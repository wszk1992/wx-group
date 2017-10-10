var mongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var request = require('request');
var myMongo = {};
var url = "mongodb://localhost:27017/wxgroup";
var AppID = "wx33c22a7766cf9f17";
var AppSecret = "d4a46fe8a75c212868a46e4bedb15769";

//db instance
var db_;
/*
tip: one user only belongs to one group


Schema:

Sessions: {
	_id(openId),
	code
}

Users:{
	_id(openId),
	groupId,
	isManager,
	nickName,
	avatarUrl
}

Groups: {
	_id(groupId),
	managerId
}

*/


/**
 * Connect to MongoDB server
 */
myMongo.connect = function (callback) {
	mongoClient.connect(url, function(err, db) {
		if (err) throw err;
		db_ = db;
		callback();
	});
}

/**
 * get db instance
 */
myMongo.getDb = function() {
	if(!that.isConnected()) return;
	return db_;
}

/**
 * check db instance is created
 */

 myMongo.isConnected = function() {
 	if(db_ === undefined) {
		console.log("db_ instance hasn't been created");
		return false;
	} else {
		return true;
	}
 }


/**
 * insert a obj to the collection.
 */
myMongo.insert = function (obj, collection, callback) {
	var that = this;
	if(!that.isConnected()) return;
	db_.collection(collection).insertOne(obj, function(err, res) {
		if(err) throw err;
		console.log("1 document inserted in ", collection);
		callback(res.insertedId);
	});
}

/**
 * delete the obj with _id in the collection
 */
myMongo.deleteById = function (id, collection) {
	var that = this;
	if(!that.isConnected()) return;
	db_.collection(collection).deleteOne({_id: id}, function(err, res) {
		if(err) throw err;
		console.log("1 document with _id ", id, " removed");
	});
}

/**
 * create the user info, including user obj in users collection and user info in the group
 */

myMongo.createMember = function(obj) {
	var that = this;
	if(!that.isConnected()) return;
	that.insert(obj, "users", function(res) {
		console.log("member is created");
	});
}

myMongo.createManager = function(obj, callback) {
	var that = this;
	if(!that.isConnected()) return;
	that.insert({managerId: obj._id}, "groups", function(groupId) {
		that.insert({
			_id: obj._id,
			groupId: groupId,
			isManager: true,
			nickName: obj.nickName,
			avatarUrl: obj.avatarUrl
		}, "users", function(res) {
			console.log("manager and his group are created");
			callback(groupId);
		});
	});
}

/**
 * delete the user info, including user obj in users collection and user info in the group
 */
myMongo.deleteUser = function(openId) {
	var that = this;
	if(!that.isConnected()) return;
	db_.collection("users").findOne({_id:openId}, function(err, res) {
		if(err) throw err;
		that.deleteById(openId, "users");
		if(res.isManager) {
			//delete the group
			that.deleteById(res.groupId, "groups");
		}
	});
}

/**
 * get user info by openId
 */
myMongo.getUserById = function(openId, callback) {
	var that = this;
	if(!that.isConnected()) return;
	db_.collection("users").findOne({_id:openId}, function(err, res) {
		if(err) throw err;
		callback(null, res);
	})
}

/**
 * get users info (nickName and avatarUrl) by groupid
 */
myMongo.getUsersByGroupId = function(groupId, callback) {
	var that = this;
	if(!that.isConnected()) return;
	var array = [];
	db_.collection("users").find({groupId: ObjectId(groupId)}).each(function(err, user) {
		if(err) throw err;
		if(user) {
			console.log("find one user", user);
			array.push({nickName: user.nickName, avatarUrl: user.avatarUrl});
		} else {
			console.log("Finished finding", user);
			callback(array);
		}
	});
}

/**
 *  manager info by groupid
 */
myMongo.getManagerByGroupId = function(groupId, callback) {
	var that = this;
	if(!that.isConnected()) return;
	db_.collection("groups").findOne({_id:groupId}, function(err, res) {
		if(err) throw err;
		callback(res.managerId);
	});
}

/**
 *  update session
 *	parameter: {
		code:  user code to retrieve openId
		callback(err, openId)
 *	}
 */
myMongo.updateSession = function(code, callback) {
	var that = this;
	if(!that.isConnected()) return;
		db_.collection("session").findOne({code:code}, function(err, res) {
		if(err) throw err;
		if(res) {
			callback(null, res._id);
		} else {
			var url = `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`;
			request.get(url, (error, response, body) => {
				console.log('error: ', error);
				console.log('statusCode: ', response && response.statusCode);
				console.log('body: ', body);
				if(error == null) {
					db_.collection("session").findOne({_id:body.openid},function(err, res) {
						if(err) throw err;
						if(res) {
							console.log("1 session updated!");
							res.code = code;
							callback(null, res._id);
						} else {
							db_.collection("session").insertOne({_id:body.openid, code:code}, function(err, res) {
								if(err) throw err;
								console.log("1 session inserted!");
								callback(null, res.insertedId);
							});
						}
					});
				} else {
					callback({errMsg:'error happened in receiving openid'}, 0);
				}
			});
		}
	});
}

module.exports = myMongo;
