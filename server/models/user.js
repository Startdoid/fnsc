var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var userSchema = mongoose.Schema({
  id: Number,
  grouplist: [{ groupId: Number, permission: Number }],
  friendlist: [{ userId: Number }],
  fotolist: [{ fotoId: Number }],
  avatar: Number,
  username : String,
  email: String,
  password : String
});

var userModel = null;
var loggedUser = null;

var _ = require('underscore');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var check = require('validator').check;
var md5 = require('MD5');

module.exports = {
  model: userModel,
  modelInit: function() {
    userSchema.plugin(autoIncrement.plugin, { model: 'user', field: 'id' });
    userModel = mongoose.model('user', userSchema);
  },
  addUser: function(username, password, email, callback) {
    userModel.findOne({ email: email }, function(err, user) {
      if (err) return callback("UserDbError");
      if (user !== null) return callback("UserAlreadyExists");
      
      loggedUser = new userModel({ username: username, password: md5(password), email: email });
      loggedUser.save(function (err) {
        if (err) return callback("UserCantCreate");
        
        callback(null, loggedUser.toObject());
      });
    });
  },
  getLoggedUser: function() {
    return loggedUser;
  },
  logoutUser: function() {
    if(!loggedUser) {
      delete loggedUser;
      loggedUser = null;
    }
  },
  getUserById: function(id, callback) {
    userModel.findOne({ id : id }, function(err, user) {
      if (err) return callback("UserDbError");
      if (user === null) return callback("NoUser");
  
      callback(null, user.toObject());
    });
  },
  validate: function(user) {
    check(user.username, 'Имя пользователя должно содержать от 1 до 20 символов').len(1, 20);
    check(user.password, 'Пароль должен быть не короче 5 и не длиннее 60 символов').len(5, 60);
    check(user.username, 'Invalid username').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
    //^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$
    check(user.email, 'Пожалуйста введите корректный email').len(4,64).isEmail();
  },
  localStrategy: new LocalStrategy({ usernameField: 'email' },
    function(username, password, done) {
      userModel.findOne({ email: username }, doAuth);

      function doAuth(err, foundUser) {
        if (err) return done(null, false, { message: 'Db error' });
        if (foundUser === null) return done(null, false, { message: 'User not found'});

        loggedUser = foundUser;
        var obj = loggedUser.toObject();
        if(obj.password != md5(password))
          done(null, false, { message: 'Incorrect password.' });
        else
          return done(null, obj);
      }
    }
  ),
  serializeUser: function(user, done) {
    done(null, user.id);
  },
  deserializeUser: function(id, done) {
    userModel.findOne({ id: id }, doAuth);

    function doAuth(err, foundUser) {
      if (err) { console.log(err); return done(null, false, { message: 'Db error' }) }
      if (foundUser === null) return done(null, false, { message: 'User not found'});

      loggedUser = foundUser;
      done(null, loggedUser.toObject());
    }
  }
};