var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  id: Number,
  username : String,
  password : String,
  role : { bitMask: Number, title: String }
});

var userModel = mongoose.model('User', userSchema);

module.exports = userModel;

// var User;
var _ = require('underscore');
var passport = require('passport');
// var Task = require('./models/task');
var LocalStrategy = require('passport-local').Strategy
var TwitterStrategy = require('passport-twitter').Strategy
var FacebookStrategy = require('passport-facebook').Strategy
var GoogleStrategy = require('passport-google').Strategy
var LinkedInStrategy = require('passport-linkedin').Strategy
var check = require('validator').check
var userRoles = require('../../client/js/routingConfig').userRoles;

var users = [
{
  id:         1,
  username:   "user",
  password:   "123",
  role:   userRoles.user
},
{
  id:         2,
  username:   "admin",
  password:   "123",
  role:   userRoles.admin
}
];

module.exports = {
  addUser: function(username, password, role, callback) {
    userModel.findOne({ username: username }, function(err, user) {
      if (err) { console.log(err); return callback("UserCantCreate"); };
      if (user !== null) return callback("UserAlreadyExists");
      
      userModel.count({ }, function (err, count) {
        //if (err) ..
        //добавить итератор для id id:         _.max(users, function(user) { return user.id; }).id + 1,
        var newUser = new userModel({ id: count + 1, username: username, password: password, role: role });
  
        newUser.save(function (err) {
          if (err) { console.log(err); return callback("UserCantCreate"); };
          
          var Cuser = newUser.toObject();
          callback(null, Cuser);
        });
      });
    });
  },

  findOrCreateOauthUser: function(provider, providerId) {
    var user = module.exports.findByProviderId(provider, providerId);
    if(!user) {
      user = {
        id: _.max(users, function(user) { return user.id; }).id + 1,
        username: provider + '_user', // Should keep Oauth users anonymous on demo site
        role: userRoles.user,
        provider: provider
      };
      user[provider] = providerId;
      users.push(user);
    }
    return user;
  },

  findAll: function() {
    return _.map(users, function(user) { return _.clone(user); });
  },

  findByProviderId: function(provider, id) {
    return _.find(users, function(user) { return user[provider] === id; });
  },

  validate: function(user) {
    check(user.username, 'Username must be 1-20 characters long').len(1, 20);
    check(user.password, 'Password must be 5-60 characters long').len(5, 60);
    check(user.username, 'Invalid username').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);

    // TODO: Seems node-validator's isIn function doesn't handle Number arrays very well...
    // Till this is rectified Number arrays must be converted to string arrays
    // https://github.com/chriso/node-validator/issues/185
    var stringArr = _.map(_.values(userRoles), function(val) { return val.toString() });
    check(user.role, 'Invalid user role given').isIn(stringArr);
  },

  localStrategy: new LocalStrategy(
    function(username, password, done) {
      userModel.findOne({ username: username }, doAuth);

      function doAuth(err, newUser) {
        if (err) { console.log(err); return done(null, false, { message: 'Db error' }) }
        if (newUser === null) return done(null, false, { message: 'User not found'})

        var Cuser = newUser.toObject();
        if(Cuser.password != password)
          { done(null, false, { message: 'Incorrect password.' }); }
        else
          { return done(null, Cuser); }
      }
    }
  ),

  twitterStrategy: function() {
    if(!process.env.TWITTER_CONSUMER_KEY)    throw new Error('A Twitter Consumer Key is required if you want to enable login via Twitter.');
    if(!process.env.TWITTER_CONSUMER_SECRET) throw new Error('A Twitter Consumer Secret is required if you want to enable login via Twitter.');

    return new TwitterStrategy({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:8000/auth/twitter/callback'
    },
    function(token, tokenSecret, profile, done) {
      var user = module.exports.findOrCreateOauthUser(profile.provider, profile.id);
      done(null, user);
    });
  },

  facebookStrategy: function() {
    if(!process.env.FACEBOOK_APP_ID)     throw new Error('A Facebook App ID is required if you want to enable login via Facebook.');
    if(!process.env.FACEBOOK_APP_SECRET) throw new Error('A Facebook App Secret is required if you want to enable login via Facebook.');
    
    return new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || "http://localhost:8000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      var user = module.exports.findOrCreateOauthUser(profile.provider, profile.id);
      done(null, user);
    });
  },

  googleStrategy: function() {
    return new GoogleStrategy({
      returnURL: process.env.GOOGLE_RETURN_URL || "http://localhost:8000/auth/google/return",
      realm: process.env.GOOGLE_REALM || "http://localhost:8000/"
    },
    function(identifier, profile, done) {
      var user = module.exports.findOrCreateOauthUser('google', identifier);
      done(null, user);
    });
  },

  linkedInStrategy: function() {
    if(!process.env.LINKED_IN_KEY)    throw new Error('A LinkedIn App Key is required if you want to enable login via LinkedIn.');
    if(!process.env.LINKED_IN_SECRET) throw new Error('A LinkedIn App Secret is required if you want to enable login via LinkedIn.');

    return new LinkedInStrategy({
      consumerKey: process.env.LINKED_IN_KEY,
      consumerSecret: process.env.LINKED_IN_SECRET,
      callbackURL: process.env.LINKED_IN_CALLBACK_URL || "http://localhost:8000/auth/linkedin/callback"
    },
    function(token, tokenSecret, profile, done) {
      var user = module.exports.findOrCreateOauthUser('linkedin', profile.id);
      done(null,user); 
    });
  },
  
  serializeUser: function(user, done) {
    done(null, user.id);
  },

  deserializeUser: function(id, done) {
    userModel.findOne({ id: id }, doAuth);

    function doAuth(err, newUser) {
      if (err) { console.log(err); return done(null, false, { message: 'Db error' }) }
      if (newUser === null) return done(null, false, { message: 'User not found'})

      var Cuser = newUser.toObject();
      done(null, Cuser);
    }
  }
};