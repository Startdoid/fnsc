var passport =  require('passport');
var User = require('../models/user.js');

module.exports = {
  register: function(req, res, next) {
    try {
      User.validate(req.body);
    }
    catch(err) {
      return res.send(400, err.message);
    }

    User.addUser(req.body.username, req.body.password, req.body.role, function(err, usr) {
      if(err === 'UserAlreadyExists') return res.send(403, "User already exists");
      else if(err === 'UserCantCreate') return res.send(402, "DB can't add user");
      else if(err)                    return res.send(500);

      req.logIn(usr, function(err) {
        if(err)     { next(err); }
        else        { res.json(200, { "role": usr.role, "username": usr.username }); }
      });
    });
  },

  login: function(req, res, next) {
    passport.authenticate('local', function(err, user) {

    if(err)     { return next(err); }
    if(!user)   { return res.send(400); }

    req.logIn(user, function(err) {
      if(err) {
        return next(err);
      }

      if(req.body.rememberme) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
        res.json(200, { "role": user.role, "username": user.username });
      });
    })(req, res, next);
  },

  logout: function(req, res) {
    req.logout();
    res.send(200);
  }
};