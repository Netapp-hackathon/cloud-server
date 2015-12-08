var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');

var port = process.env.PORT || 8080;

mongoose.connect(config.database);

app.set('secret', config.secret);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

// Routes
app.get('/', function(req, res) {
	res.send("Hello! API you are looking for is in another castle - http://localhost:" + port + '/api');
});

app.get('/setup', function(req, res) {
	var john = new User({
		username: 'John Doe',
		password: 'password'
	});

	john.save(function(err) {
		if (err) throw err;

		console.log('User saved successfully!');
		res.json({sucess: true});
	})
});

var apiRoutes = express.Router();
apiRoutes.get('/', function(req, res) {
	res.json({message: 'Welcome to VPN bypass APIs'});
});
apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});
apiRoutes.post('/authenticate', function(req, res) {
	User.findOne()
})
app.use('/api', apiRoutes);

app.listen(port);

console.log("Server listening at: " + port);