// set up ======================================================================

var http 			= require("http");
var express  		= require('express');      //Подключаем библиотеку express :http://jsman.ru/express/#section
var app      		= express(); 							//создаем приложение на основе объекта express 
var mongoose 		= require('mongoose'); 		//Подключаем библиотеку mongoose, враппер для mongoDB
var port  	 		= process.env.PORT; //Установка слушающего порта для сервера по-умолчанию
var database 		= require('./server/database'); //Чтение настроек подключения к ИБ 
var path 			= require('path');
var passport 		= require('passport');
var autoIncrement 	= require('mongoose-auto-increment');
var User 			= require('./server/models/user');
var pg				= require("pg");

// configuration ==============================================================='
mongoose.connect(database.url); 	// connect to mongoDB database on modulus.io

//postgres (check connection)
// pg.connect(database.url_pg, function(err, client, done){
	
// 	if(err){
// 		console.log('connection error (Postgres):'+err);
// 	}
// 	done();
// });

var db = mongoose.connection;
db.on('error', function (err) {
 	console.log('connection error: ' + err.message);
});

db.once('open', function callback () {
	autoIncrement.initialize(db);

	User.modelInit();
	//Group.modelInit();

	app.configure(function() {
	 	app.use(express.logger('dev')); 						// log every request to the console
	 	app.use(express.cookieParser());
	 	app.use(express.favicon(path.join(__dirname, '/client/img/favicon.ico')));
	 	app.use(express.cookieSession({ secret: process.env.COOKIE_SECRET || "Superdupersecret" }));
	 	app.use(express.bodyParser()); 							// pull information from html in POST
	 	app.use(express.methodOverride()); 					// simulate DELETE and PUT
	 	//app.use(express.static(path.join(__dirname, '/client'))); 		// set the static files location /client/img will be /img for users
	 	app.use(express.static(__dirname + '/client'));
	 	app.use(passport.initialize());
	 	app.use(passport.session());
	});
	
	app.configure('development', 'production', function() {
	  //app.use(express.csrf());
	});
		
	passport.use(User.localStrategy);
	
	passport.serializeUser(User.serializeUser);
	passport.deserializeUser(User.deserializeUser);
	
	// routes ======================================================================
	require('./server/routes.js')(app);
	
	http.createServer(app).listen(process.env.PORT, process.env.IP);
	console.log("App listening on port " + port);
});