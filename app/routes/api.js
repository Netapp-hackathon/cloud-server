var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var User = require('../models/user');

var apiRoutes = express.Router();

apiRoutes.post('/authenticate', function(req, res) {
	console.log(req.body);
	User.findOne({
		username: req.body.username
	}, function(err, user) {
		if (!user) {
			res.json({
				err: {
					errNo: 1,
					errMsg: "Authentication failed, user not found!"
				}
			});
		} else if (user) {
			if (user.password != req.body.password) {
				res.json({
					err: {
						errNo: 2,
						errMsg: "Authentication failed, invalid username or password!"
					}
				});
			} else {
				var token = jwt.sign(user, config.secret, {
					expiresIn: 7 * 24 * 60 * 60 // Seconds worth 7 days!
				});

				res.json({
					err: {
						errNo: 0,
						errMsg: "Login Successful!"
					},
					token: token
				});
			}
		}
	});
});
apiRoutes.use(function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, config.secret, function(err, decoded) {
			if (err) {
				return res.json({
					err: {
						errNo: 3,
						errMsg: "Failed to authenticate token!"
					}
				})
			} else {
				req.decoded = decoded;
				console.log(decoded);
				next();
			}
		});
	} else {
		return res.status(403).send({
			err: {
				errNo: 4,
				errMsg: "No token provided!"
			}
		});
	}
})
apiRoutes.get('/', function(req, res) {
	res.json({message: 'Welcome to VPN bypass APIs'});
});
apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

module.exports = apiRoutes;