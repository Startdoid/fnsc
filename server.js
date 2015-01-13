// set up ======================================================================
var http 					= require("http");
var express  			= require('express');      //Подключаем библиотеку express :http://jsman.ru/express/#section
var bodyParser 		= require('body-parser');
var cookieSession	= require('cookie-session');
var cookieParser 	= require('cookie-parser');
var session 			= require('express-session');
var favicon 			= require('serve-favicon');
var methodOverride = require('method-override');
var serveStatic 	= require('serve-static');
var font_middleware = require("connect-fonts");
var opensans 			= require("connect-fonts-opensans");
var mongoose 			= require('mongoose'); 		//Подключаем библиотеку mongoose, враппер для mongoDB
var port  	 			= process.env.PORT; //Установка слушающего порта для сервера по-умолчанию
var database 			= require('./server/database'); //Чтение настроек подключения к ИБ 
var path 					= require('path');
var passport 			= require('passport');
var autoIncrement = require('mongoose-auto-increment');
var user 					= require('./server/models/user');
//var pg						= require("pg");

var app      		= express(); 							//создаем приложение на основе объекта express 

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

	user.modelInit();
	//Group.modelInit();

	app.set('trust proxy', 1); // trust first proxy
 	//app.use(express.logger('dev')); 						// log every request to the console
 	app.use(cookieParser());
 	app.use(favicon(path.join(__dirname, '/client/img/favicon.ico')));
 	 app.use(session({ secret: 'me.TaskIn',
   	resave: false,
   	saveUninitialized: true,
   	cookie: { secure: false }
 	 }));
 	//app.use(cookieSession({ secret: process.env.COOKIE_SECRET || "Superdupersecret" }));
 	// parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({ extended: true }));
	// parse application/json
	app.use(bodyParser.json());
 	app.use(methodOverride('X-HTTP-Method-Override')); 					// simulate DELETE and PUT 'X-HTTP-Method-Override'
 	app.use(font_middleware.setup({
   	fonts: [ opensans ],
   	allow_origin: process.env.IP,
   	maxage: 180 * 24 * 60 * 60 * 1000,   // 180 days
   	compress: true
	}));
	//app.use('/img/avatars', serveStatic(path.join(__dirname, '/client/img/avatars')));
 	app.use(serveStatic(path.join(__dirname, '/client'), {'index': ['index.html', 'index.htm']}));

	app.use(passport.initialize());
	app.use(passport.session());

	passport.use(user.localStrategy);
	
	passport.serializeUser(user.serializeUser);
	passport.deserializeUser(user.deserializeUser);
	
	// routes ======================================================================
	require('./server/routes.js')(app);
	
	http.createServer(app).listen(process.env.PORT, process.env.IP);
	console.log("App listening on port " + port);
});