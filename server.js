var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');

var apiRoutes = require('./app/routes/api');

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
		name: 'John Doe',
		username: 'john',
		password: 'password'
	});

	john.save(function(err) {
		if (err) throw err;

		console.log('User saved successfully!');
		res.json({sucess: true});
	})
});


app.use('/api', apiRoutes);

app.listen(port);

console.log("Server listening at: " + port);