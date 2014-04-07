var _ = require('underscore');
var path =      require('path');
var passport =  require('passport');
var AuthCtrl =  require('./controllers/auth');
var UserCtrl =  require('./controllers/user');
var userRoles = require('../client/js/routingConfig').userRoles;
var accessLevels = require('../client/js/routingConfig').accessLevels;
var Task = require('./models/task');
var User = require('./models/user');

var routes = [
  // Views
  {
    path: '/partials/*',
    httpMethod: 'GET',
    middleware: [function (req, res) {
      var requestedView = path.join('./', req.url);
      res.sendfile('./client/views/' + requestedView);
      //res.render(requestedView);
    }]
  },

  // {
  //   path: '/login',
  //   httpMethod: 'GET',
  //   middleware: [function (req, res) {
  //     var requestedView = path.join('./', req.url);
  //     res.sendfile(requestedView);
  //     console.log("login-");
  //     //res.render(requestedView);
  //   }]
  // },

  //получить все задачи из базы
  {
    path: '/api/tasks',
    httpMethod: 'GET',
    middleware: [function (req, res) {
        // use mongoose to get all tasks in the database
        Task.find(function(err, tasks) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) 
          res.send(err);
        res.json(tasks); // return all tasks in JSON format
      });
    }]
  },

  // create task and send back all tasks after creation
  {
    path: '/api/tasks',
    httpMethod: 'POST',
    middleware: [function (req, res) {
      // create a task, information comes from AJAX request from Angular
      Task.create({
        text : req.body.text,
        done : false
      }, function(err, task) {
        if (err)
          res.send(err);
  
        // get and return all the tasks after you create another
        Task.find(function(err, tasks) {
          if (err)
            res.send(err);
          res.json(tasks);
        });
      });
    }]
  },

	// delete a task	
	{
    path: '/api/tasks/:task_id',
    httpMethod: 'DELETE',
    middleware: [function (req, res) {
      Task.remove({
        _id : req.params.task_id
      }, function(err, task) {
        if (err)
          res.send(err);
  
        // get and return all the tasks after you create another
        Task.find(function(err, tasks) {
          if (err)
            res.send(err);
          res.json(tasks);
        });
      });      
    }]
	},

  // OAUTH
  {
    path: '/auth/twitter',
    httpMethod: 'GET',
    middleware: [passport.authenticate('twitter')]
  },
  
  {
    path: '/auth/twitter/callback',
    httpMethod: 'GET',
    middleware: [passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/login'
    })]
  },
  
  {
    path: '/auth/facebook',
    httpMethod: 'GET',
    middleware: [passport.authenticate('facebook')]
  },
  
  {
    path: '/auth/facebook/callback',
    httpMethod: 'GET',
    middleware: [passport.authenticate('facebook', {
      successRedirect: '/',
      failureRedirect: '/login'
    })]
  },
  
  {
    path: '/auth/google',
    httpMethod: 'GET',
    middleware: [passport.authenticate('google')]
  },
  
  {
    path: '/auth/google/return',
    httpMethod: 'GET',
    middleware: [passport.authenticate('google', {
      successRedirect: '/',
      failureRedirect: '/login'
    })]
  },
  
  {
    path: '/auth/linkedin',
    httpMethod: 'GET',
    middleware: [passport.authenticate('linkedin')]
  },
  
  {
    path: '/auth/linkedin/callback',
    httpMethod: 'GET',
    middleware: [passport.authenticate('linkedin', {
      successRedirect: '/',
      failureRedirect: '/login'
    })]
  },

  // Local Auth
  {
    path: '/register',
    httpMethod: 'POST',
    middleware: [AuthCtrl.register]
  },
  
  {
    path: '/login',
    httpMethod: 'POST',
    middleware: [AuthCtrl.login]
  },
  
  {
    path: '/logout',
    httpMethod: 'POST',
    middleware: [AuthCtrl.logout]
  },

  // User resource
  {
    path: '/users',
    httpMethod: 'GET',
    middleware: [UserCtrl.index],
    accessLevel: accessLevels.admin
  },

  // All other get requests should be handled by AngularJS's client-side routing system
  {
    path: '/*',
    httpMethod: 'GET',
    middleware: [function(req, res) {
      var role = userRoles.public, username = '';
      if(req.user) {
        role = req.user.role;
        username = req.user.username;
      }
      res.cookie('user', JSON.stringify({
        'username': username,
        'role': role
      }));
      res.sendfile('./client/views/index.html'); // load the single view file (angular will handle the page changes on the front-end)
      // res.render('index');
    }]
  }  
];

module.exports = function(app) {
  _.each(routes, function(route) {
    route.middleware.unshift(ensureAuthorized);
    var args = _.flatten([route.path, route.middleware]);

    switch(route.httpMethod.toUpperCase()) {
      case 'GET':
        app.get.apply(app, args);
        break;
      case 'POST':
        app.post.apply(app, args);
        break;
      case 'PUT':
        app.put.apply(app, args);
        break;
      case 'DELETE':
        app.delete.apply(app, args);
        break;
      default:
        throw new Error('Invalid HTTP method specified for route ' + route.path);
        break;
      }
  });
}

function ensureAuthorized(req, res, next) {
  var role;
  if(!req.user) role = userRoles.public;
  else          role = req.user.role;

  var accessLevel = _.findWhere(routes, { path: req.route.path }).accessLevel || accessLevels.public;

  if(!(accessLevel.bitMask & role.bitMask)) return res.send(403);
  return next();
}