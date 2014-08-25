// set up ======================================================================
var express  = require('express');      //Подключаем библиотеку express :http://jsman.ru/express/#section
var app      = express(); 							//создаем приложение на основе объекта express 
var mongoose = require('mongoose'); 		//Подключаем библиотеку mongoose, враппер для mongoDB
var port  	 = process.env.PORT; //Установка слушающего порта для сервера по-умолчанию
var database = require('./server/database'); //Чтение настроек подключения к ИБ 
var path = require('path');

// configuration ==============================================================='
mongoose.connect(database.url); 	// connect to mongoDB database on modulus.io

var db = mongoose.connection;

db.on('error', function (err) {
	console.log('connection error: ' + err.message);
});

db.once('open', function callback () {
	console.log("Connected to DB!");
});

app.configure(function() {
	app.use(express.static(path.join(__dirname, 'client'))); 		// set the static files location /client/img will be /img for users
	app.use(express.logger('dev')); 						// log every request to the console
	app.use(express.bodyParser()); 							// pull information from html in POST
	app.use(express.methodOverride()); 					// simulate DELETE and PUT
});

app.configure('development', 'production', function() {
  // app.use(express.csrf());
});

// routes ======================================================================
require('./server/routes.js')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);