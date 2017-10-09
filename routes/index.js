var express = require('express');
var request = require('request');
var myMongo = require('../db/db');
var router = express.Router();
/*
###index router###

/onlogin: 
req: {code}
res: {isInGroup, groupId}
Description: check if the user is in a group

/createGroup: 
req: {code, nickName, avatarUrl}
res: {groupId}
Description: create a new group and set the user as the manager, then redirect to group page
/backToGroup: redirect to the group


/backToGroup: 
req: {code}
res: {groupId}
Description: go back to the group
*/

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/onlogin', function(req, res, next) {
	console.log("User Logining..............");
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
			res.send({
				isInGroup: user != null,
				groupId: user ? user.groupId : -1
			});
		});
		
	});
});


router.get('/createGroup', function(req, res, next) {
	console.log("Creating group now..........");
	var code = req.query.code;
	myMongo.updateSession(code, function(err, openId) {
		if(err) {
			console.log("Update session failed. ", err.errMsg);
			res.send(null);
		}
		var user = {
			_id: openId,
			groupId: -1,
			isManager: true,
			nickName: req.query.nickName,
			avatarUrl: req.query.avatarUrl
		}
		myMongo.createManager(user, function(groupId) {
			//check the path is /group or /createGroup/group
			res.send({groupId: groupId});
		});
	});
});

router.get('/backToGroup', function(req, res, next) {
	console.log("Backing to the group now..........");
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
			res.send({groupId: user.groupId});
		});
	});
});


module.exports = router;
