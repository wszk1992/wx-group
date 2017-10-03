var express = require('express');
var request = require('request');
var router = express.Router();
var AppID = "wx33c22a7766cf9f17";
var AppSecret = "d4a46fe8a75c212868a46e4bedb15769";
var Users = {};

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log("nickName: ", req.query.nickName);
	res.render('index', { title: 'Express' });
});

router.get('/onlogin', function(req, res, next) {
	var code = req.query.code;
	var url = `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`;
	request.get(url, (error, response, body) => {
		console.log('error: ', error);
		console.log('statusCode: ', response && response.statusCode);
		console.log('body: ', body);
		if(error == null) {
			res.send({
				isInGroup: body.openid in Users,
				users: Object.keys(Users).map(key => Users[key]),
				usersNum: Object.keys(Users).length
			});
		} else {
			console.log('error happened in receiving openid');
			res.send(null);
		}
	});
});

router.get('/joinGroup', function(req, res, next) {
	var code = req.query.code;
	var status = req.query.status;
	var nickName = req.query.nickName;
	var avatarUrl = req.query.avatarUrl;
	var url = `https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`;
	request.get(url, (error, response, body) => {
		console.log('error: ', error);
		console.log('statusCode: ', response && response.statusCode);
		console.log('body: ', body);
		console.log('status: ', status);
		if(error == null) {
			if(status == 1) {
				//current state: joined, next state: leave
				if(body.openid in Users) {
					console.log("the user is deleted");
					delete Users[body.openid];
				} else {
					console.log("the user has been deleted before");
				}
			} else {
				if(body.openid in Users) {
					console.log("the user has been added before");
				} else {
					//current state: leave, next state: join
					console.log("the user is added");
					Users[body.openid] = {
						nickName: nickName,
						avatarUrl: avatarUrl
					};
				}
			}
			res.send({
				status: body.openid in Users,
				users: Object.keys(Users).map(key => Users[key]),
				usersNum: Object.keys(Users).length
			});
		} else {
			console.log('error happened in receiving openid');
			res.send(null);
		}
	});
});

module.exports = router;
