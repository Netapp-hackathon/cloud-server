var express 	= require('express');
var mongoose 	= require('mongoose');
var jwt 	= require('jsonwebtoken');
var config 	= require('../../config');
var User 	= require('../models/user');
var http 	= require('http');
var ldap        = require('ldapjs');
var apiRoutes 	= express.Router();


apiRoutes.post('/authenticate', function(req, res) {
    var username = req.body.username;
	var client = ldap.createClient({
		url: 'ldap://vmwaddc06-prd.hq.netapp.com:389'
	});

	client.bind(username+'@netapp.com', req.body.password, function (err) {
		if (err) {
			res.json({
				err: {
					errNo: 1,
					errMsg: "Authentication failed, user not found!"
				}   
			});
			console.log(err);
			client.unbind(function(err) {
				if(err) {
					console.log(err.message);
				} else {
					console.log('LDAP client disconnected');
				}
			});
		} else {
			var token = jwt.sign(username, config.secret, {
				expiresIn: 7 * 24 * 60 * 60 // Seconds worth 7 days!
			});

			res.json({
				err: {
					errNo: 0,
					errMsg: "Login successful!"
				},
				token: token
			});
		}

	});
});
// Safe routes begin here!
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
				req.username = decoded;
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
});
apiRoutes.get('/validate', function(req, res) {
	res.json({
		err: {
			errNo: 0,
			errMsg: "Your token is valid!"
		}
	});
});
apiRoutes.get('/ops', function(req, res) {
	var ovs_options = { 
		"method": "GET",
		"hostname": "10.74.213.25",
		"port": "1337",
		"path": "/api/ops",
		"headers": {
			"cache-control": "no-cache",
		}
	};
	var reqs = http.request(ovs_options, function (resp) {
		var respStr = "";

		resp.on("data", function (chunk) {
			respStr += chunk;
		});
		resp.on("end", function () {
			console.log(respStr + "\n");
			res.json(JSON.parse(respStr));
		});
		resp.on('error', function() {
			console.log("Error fetching ops from OVS!");
			res.json({
				err: {
					errNo: 1,
					errMsg: "Unable to fetch ops!"
				}
			})
		})
	});
	reqs.end();
});
apiRoutes.get('/ws', function(req, res) {
	var ovs_options = {
		"method": "GET",
		"hostname": "10.74.213.25",
		"port": "1337",
		"path": "/api/ws?username=john",// + TODO: req.username,
		"headers": {
			"cache-control": "no-cache",
		}
	};
	var reqs = http.request(ovs_options, function (resp) {
		var respStr = "";

		resp.on("data", function (chunk) {
			respStr += chunk;
		});

		resp.on("end", function () {
			res.json(JSON.parse(respStr));
		});
	});
	reqs.end();
});
apiRoutes.get('/vsim', function(req, res) {
	var ovs_options = {
		"method": "GET",
		"hostname": "10.74.213.25",
		"port": "1337",
		"path": "/api/vsim?username=john",// + TODO: req.username,
		"headers": {
			"cache-control": "no-cache",
		}
	};
	var reqs = http.request(ovs_options, function (resp) {
		var respStr = "";

		resp.on("data", function (chunk) {
			respStr += chunk;
		});

		resp.on("end", function () {
			res.json(JSON.parse(respStr));
		});
	});
	reqs.end();
});
apiRoutes.post('/ops', function(req, res) {
	delete req.body.token;
	req.body.username = req.username;
	var ovs_options = {
		"method": "POST",
		"hostname": "10.74.213.25",
		"port": "1337",
		"path": "/api/ops",
		"headers": {
			"cache-control": "no-cache",
			"Content-Type": "application/json"
		}
	};
	var reqs = http.request(ovs_options, function (resp) {
		var respStr = "";

		resp.on("data", function (chunk) {
			respStr += chunk;
		});

		resp.on("end", function () {
			console.log(respStr);
			res.json(JSON.parse(respStr));
		});
	});
	console.log("Sending op request forward: " + JSON.stringify(req.body));
	reqs.end(JSON.stringify(req.body));
})

apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

module.exports = apiRoutes;
