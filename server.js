// set up ======================================================================
var express  = require('express');
var app      = express(); 								// create our app w/ express
var mongoose = require('mongoose'); 		// mongoose for mongodb
var port  	 = process.env.PORT || 8080; // set the port
var database = require('./config/database'); // load the database config
var http     = require('http');
var passport = require('passport');
var path = require('path');
//User =        require('./server/models/User.js');


// configuration ===============================================================
mongoose.connect(database.url); 	// connect to mongoDB database on modulus.io

app.configure(function() {
	app.use(express.static(path.join(__dirname, 'client'))); 		// set the static files location /client/img will be /img for users
	app.use(express.logger('dev')); 						// log every request to the console
	app.use(express.bodyParser()); 							// pull information from html in POST
	app.use(express.methodOverride()); 						// simulate DELETE and PUT
	app.use(express.cookieParser());
  app.use(express.cookieSession(
    {
      secret: process.env.COOKIE_SECRET || "Superdupersecret"
    }));
});

app.configure('development', 'production', function() {
    app.use(express.csrf());
    app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });
});

app.use(passport.initialize());
app.use(passport.session());

// routes ======================================================================
require('./server/routes.js')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);

//passport.use(User.localStrategy);
//passport.use(User.twitterStrategy());  // Comment out this line if you don't want to enable login via Twitter
//passport.use(User.facebookStrategy()); // Comment out this line if you don't want to enable login via Facebook
//passport.use(User.googleStrategy());   // Comment out this line if you don't want to enable login via Google
//passport.use(User.linkedInStrategy()); // Comment out this line if you don't want to enable login via LinkedIn

//passport.serializeUser(User.serializeUser);
//passport.deserializeUser(User.deserializeUser);

//app.set('port', process.env.PORT || 8000);
//http.createServer(app).listen(app.get('port'), function(){
//    console.log("Express server listening on port " + app.get('port'));
//});