var http          = require("http");
var mongoose      = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var pg            = require('pg');
var database 			= require('../database'); //Чтение настроек подключения к ИБ 

var userFields = {
  id: Number,
  grouplist: [{ groupId: Number, permission: Number }],
  friendlist: [{ userId: Number }],
  fotolist: [{ fotoId: Number }],
  avatar: Number,
  username : String,
  email: String,
  password : String,
  country: Number,
  city: Number,
  dateofbirth: Date,
  gender: Number,
  familystatus: Number
};

var userSchema = mongoose.Schema(userFields);

//var userModel = null;
var loggedUser = null;

var _ = require('underscore');
//var passport = require('passport');
var check = require('validator').check;
var LocalStrategy = require('passport-local').Strategy;
var md5 = require('MD5');
var errors = require('../errors');

var country = [
  {id:1, value:'Выбор страны'},
  {id:2, value:'Россия'},
  {id:3, value:'Украина'},
  {id:4, value:'Беларусь'},
  {id:5, value:'Казахстан'},
  {id:6, value:'Азербайджан'},
  {id:7, value:'Армения'},
  {id:8, value:'Грузия'},
  {id:9, value:'Израиль'},
  {id:10, value:'Мауссия'}
];

var city = [
  {id:1, value:'Выбор города'},
  {id:2, value:'Красноярск'},
  {id:3, value:'Москва'},
  {id:4, value:'Маусвиль'}
];

var familystatus = [
  {id:1, value:'Выбор статуса'},
  {id:2, value:'В поиске'},
  {id:3, value:'Не женат'},
  {id:4, value:'Встречается'},
  {id:5, value:'Помолвен'},
  {id:6, value:'Женат'},
  {id:7, value:'Влюблен'}
];

var rollback = function(client, done) {
  client.query('ROLLBACK', function(err) {
    //if there was a problem rolling back the query
    //something is seriously messed up.  Return the error
    //to the done function to close & remove this client from
    //the pool.  If you leave a client in the pool with an unaborted
    //transaction weird, hard to diagnose problems might happen.
    return done(err);
  });
};

var commit = function(client, callback) {
    
    // commit
    client.query('COMMIT');
    done();
    return callback(validationResult.status);
};


module.exports = {
  model: null,
  modelInit: function() {
    userSchema.plugin(autoIncrement.plugin, { model: 'user', field: 'id' });
    module.exports.model = mongoose.model('user', userSchema);
  },
  addUser: function(username, password, email, callback) {
    module.exports.model.findOne({ email: email }, function(err, user) {
      if (err) return callback({ status: errors.restStat_DbReadError, message: errors.restMess_DbReadError }, null);
      if (user !== null) return callback({ status: errors.restStat_UserExist, message: errors.restMess_UserExist }, null);
      
      loggedUser = new module.exports.model({ username: username, 
        password: md5(password), 
        email: email,
        country: 1,
        city: 1,
        dateofbirth: new Date(),
        gender: 0,
        familystatus: 1
      });

      loggedUser.save(function (err) {
        if (err) return callback({ status: errors.restStat_DbSaveError, message: errors.restMess_DbSaveError }, null);
        
        callback(null, loggedUser.toObject());
      });
    });
  },
  getLoggedUser: function() {
    return loggedUser;
  },
  //Получение списка пользователей из линейной DB
  getUsersList: function(from, to, filter, callback) {
    //структура возвращаемых значений:
    //1. первая выдача данных { total_count - количество элементов, data - массив элементов }
    //2. последующие порции данных { data }
    var usersList = { data: [{}] };
    
    if(from === 0) {
      pg.connect(database.url_pg, function(err, client, done) {
  	   	if(err) {
      		console.log('connection error (Postgres):' + err);
      	}
  
      	client.query('SELECT * FROM "Users" WHERE "id" BETWEEN $1 AND $2', [from, to], function(err, result) {
      	  if(err) { console.log(err) }
      	  done();
      	  
          usersList.total_count = 4; //заглушка (должна получать количество пользователей в базе и передавать сюда)
  
      	  var arrUsrs = result.rows.map(function(object) { 
      	    return { id: object.id, username: object.username, email: object.email, img:'avtr' + object.id + '.png' };
      	  });
      	  //usersList.data = new Array();
      	  //usersList.data.push(arrUsrs);
      	  usersList.data = arrUsrs;
      	  //console.log(usersList);
      	  
      	  callback(errors.restStat_isOk, '', usersList);
      	});
      });
    } else {
      usersList.data = [];
      callback(errors.restStat_isOk, '', usersList);
    }
  },
  logoutUser: function() {
    if(!loggedUser) {
      delete loggedUser;
      loggedUser = null;
    }
  },
  getUserById: function(id, callback) {
    module.exports.model.findOne({ id : id }, function(err, user) {
      if (err) {
        var error = errors.translateMongoError(err); 
        return callback(error.status, error.message, null);
      }

      if (user === null) return callback(errors.restStat_UserNotFound, errors.restMess_UserNotFound, null);
      callback(errors.restStat_isOk, '', user.toObject());
    });
  },
  
  /*
  * saveLoggedUserFromBody  записываем информацию о пользователи
  *
  */
  saveLoggedUserFromBody: function(body, callback) {
    var validationResult = errors.validateUser(body);
    if(validationResult.status === errors.restStat_isOk) {
      var newSet = {};
      for(var key in userFields) {
        if((key === 'avatar') || (key === 'permissionVisibleProfile')) continue;
        newSet[key] = body[key];
      }
      //mongo
      module.exports.model.update({ id: loggedUser.id }, newSet, function (err) {
        if (err) {
          var error = errors.translateMongoError(err); 
          return callback(error.status, error.message);
        }
          
        callback(validationResult.status);
      });
      
      //postgres
      pg.connect(database.url_pg, function(err, client, done) {
	   	if(err) {
    		console.log('connection error (Postgres):'+err);
    		return;
    	}
    	
    	//запросы
    	var querySelect = 'SELECT id FROM "Users" WHERE "id"=$1;';
    	var queryUpdate = 'UPDATE "Users" SET "username"=$1, "email"=$2, "visibleProfile"=$3 WHERE "id"=$4;';
    	var queryInsert = 'INSERT INTO "Users"("id", "username", "email", "visibleProfile") VALUES ($1, $2, $3, $4);';
    	
    	//trqansaction
    	client.query('BEGIN', function(err){
    	  if(err) return rollback(client, done);
    	  
    	  //проверяем существует или нет
    	  var modeUpdate = false;
    	  client.query(querySelect,[body['id']], function(err, result){
    	    if(err) return rollback(client,done);
    	    if(result.rowCount>=1) modeUpdate = true;
    	    
    	    if(modeUpdate){
    	    // обновляем
      	  client.query(queryUpdate,[body['username'], body['email'], body['permissionVisibleProfile'], body['id']], function(err){
      	    if(err) return rollback(client,done);
      	    
              // commit
              client.query('COMMIT');
              done();
              return callback(validationResult.status);
      	  });
      	  }else{
      	  
        	  // вставляем
        	  client.query(queryInsert, [body['id'], body['username'], body['email'], body['permissionVisibleProfile']], function(err){
        	    if(err) return rollback(client,done);
          	     // commit
                client.query('COMMIT');
                done();
                return callback(validationResult.status);
      	    });
      	  }
    	  });
    	  
    	});
    	
    });
    } else {
      callback(validationResult.status, validationResult.message);
    }
  },
  validate: function(user) {
    check(user.username, 'Имя пользователя должно содержать от 1 до 20 символов').len(1, 20);
    check(user.password, 'Пароль должен быть не короче 5 и не длиннее 60 символов').len(5, 60);
    check(user.username, 'Такое имя пользователя не подходит').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
    check(user.email, 'Ваш email не корректен, попробуйте ввести повторно').len(4,64).isEmail();
  },
  localStrategy: new LocalStrategy({ usernameField: 'email' },
    function(username, password, done) {
      module.exports.model.findOne({ email: username }, doAuth);

      function doAuth(err, foundUser) {
        if (err) return done(err, false, { status: errors.restStat_DbReadError, message: errors.restMess_DbReadError });
        if (foundUser === null) return done(null, false, { status: errors.restStat_UserNotFound, message: errors.restMess_UserNotFound });

        loggedUser = foundUser;
        var obj = loggedUser.toObject();
        if(obj.password != md5(password))
          done(null, false, { status: errors.restStat_UserValidationError, message: errors.restMess_UserPasswordIncorrect });
        else
          return done(null, obj, { status: errors.restStat_isOk });
      }
    }
  ),
  serializeUser: function(user, done) {
    done(null, user.id);
  },
  deserializeUser: function(id, done) {
    module.exports.model.findOne({ id: id }, doAuth);

    function doAuth(err, foundUser) {
      if (err) { return done(null, false, { message: 'Db error' }) }
      if (foundUser === null) return done(null, false, { message: 'User not found'});

      loggedUser = foundUser;
      done(null, loggedUser.toObject());
    }
  }
};