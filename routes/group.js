var express = require('express');
var request = require('request');
var myMongo = require('../db/db');
var router = express.Router();

/*
###group router###

/: 
req: {code, groupId}
res: {belongToThisGroup, users[{nickName, avatarUrl}]}
Description: get group info and user's status(in this group or not)


*/

router.get('/', function(req, res, next) {
	var groupId = req.query.groupId;
	var code = req.query.code;
	myMongo.updateSession(code, function(err, openId) {
		if(err) {
			console.log("Update session failed. ", err.errMsg);
			res.send(null);
		}
		myMongo.getUserById(openId, function(err, user) {
			if(err) {
				console.log("Failed to get user:", err.errMsg);
			}
			myMongo.getUsersByGroupId(groupId, function(users) {
				res.send({
					belongToThisGroup: user.groupId == groupId,
					users: users
				})
			});
		});
		
	});
})


// router.get('/joinGroup', function(req, res, next) {
// 	var code = req.query.code;
// 	var status = req.query.status;
// 	var nickName = req.query.nickName;
// 	var avatarUrl = req.query.avatarUrl;
// 	var url = `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`;
// 	request.get(url, (error, response, body) => {
// 		console.log('error: ', error);
// 		console.log('statusCode: ', response && response.statusCode);
// 		console.log('body: ', body);
// 		console.log('status: ', status);
// 		if(error == null) {
// 			if(status == 1) {
// 				//current state: joined, next state: leave
// 				if(body.openid in Users) {
// 					console.log("the user is deleted");
// 					delete Users[body.openid];
// 				} else {
// 					console.log("the user has been deleted before");
// 				}
// 			} else {
// 				if(body.openid in Users) {
// 					console.log("the user has been added before");
// 				} else {
// 					//current state: leave, next state: join
// 					console.log("the user is added");
// 					Users[body.openid] = {
// 						nickName: nickName,
// 						avatarUrl: avatarUrl
// 					};
// 				}
// 			}
// 			res.send({
// 				status: body.openid in Users,
// 				users: Object.keys(Users).map(key => Users[key]),
// 				usersNum: Object.keys(Users).length
// 			});
// 		} else {
// 			console.log('error happened in receiving openid');
// 			res.send(null);
// 		}
// 	});
// });

module.exports = router;
