var _ = require('underscore');
var path = require('path');
var taskModel = require('./models/task');
var userModel = require('./models/user');
var groupModel = require('./models/group');
var passport = require('passport');

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
  //получить коллекцию пользователя
  {
    path: '/api/groups',
    httpMethod: 'GET',
    middleware: [getgroups]
  },
  //сохранить модель коллекции
  {
    path: '/api/groups/:group_id',
    httpMethod: 'PUT',
    middleware: [savegroup]
  },
  //получить пользователя, а вместе с ним настройки сессии
  {
    path: '/api/users/:user_id',
    httpMethod: 'GET',
    middleware: [getuser]
  },
  //получить задачу из базы
  {
    path: '/api/tasks/:task_id',
    httpMethod: 'GET',
    middleware: [function (req, res) {
      console.log(req.params.task_id);
      // use mongoose to get all tasks in the database
      
      taskModel.findOne( { id: req.params.task_id }, function(err, task) {
      // if there is a1n error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
          console.log('error');
          res.send(err);
        }
        console.log(task);
        res.json(task); // return task in JSON format

      });
    }]
  },

  // create task and send back all tasks after creation
  {
    path: '/api/tasks',
    httpMethod: 'POST',
    middleware: [function (req, res) {
      // create a task, information comes from AJAX request from Angular
      // Task.create({
      //   text : req.body.text,
      //   done : false
      // }, function(err, task) {
      //   if (err)
      //     res.send(err);
  
      //   // get and return all the tasks after you create another
      //   Task.find(function(err, tasks) {
      //     if (err)
      //       res.send(err);
      //     res.json(tasks);
      //   });
      // });
    }]
  },

	// delete a task	
	{
    path: '/api/tasks/:task_id',
    httpMethod: 'DELETE',
    middleware: [function (req, res) {
      // Task.remove({
      //   _id : req.params.task_id
      // }, function(err, task) {
      //   if (err)
      //     res.send(err);
  
      //   // get and return all the tasks after you create another
      //   Task.find(function(err, tasks) {
      //     if (err)
      //       res.send(err);
      //     res.json(tasks);
      //   });
      //});      
    }]
  },
  {
    path: '/api/logged',
    httpMethod: 'GET',
    middleware: [getLoggedUser]
  },  
  {
    path: '/api/login',
    httpMethod: 'POST',
    middleware: [login]
  },
  {
    path: '/api/logout',
    httpMethod: 'PUT',
    middleware: [logout]
  },
  {
    path: '/api/register',
    httpMethod: 'POST',
    middleware: [register]
  },
  {
    path: '/*',
    httpMethod: 'GET',
    middleware: [function(req, res) {
      res.redirect('/');
    }]
  },
  {
    path: '/home',
    httpMethod: 'GET',
    middleware: [function(req, res) {
      res.sendfile('./client/index.html'); 
    }]
  }
];

module.exports = function(app) {
  _.each(routes, function(route) {
    //route.middleware.unshift(ensureAuthorized); //Поместили в стек
    var args = _.flatten([route.path, route.middleware]); //Разложение вложенного массива на элементарный ряд

    switch(route.httpMethod.toUpperCase()) {
      case 'GET':
        app.get.apply(app, args); //вызов функции в контексте app
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
};

function ensureAuthorized(req, res, next) {
  req.isAuthenticated()
    ? next()
    : res.redirect('/');

  //if(!req.user) role = userRoles.public;
  //else          role = req.user.role;

  //var accessLevel = _.findWhere(routes, { path: req.route.path }).accessLevel || accessLevels.public;

  //if(!(accessLevel.bitMask & role.bitMask)) return res.send(403);
}

function register(req, res, next) {
  try {
    userModel.validate(req.body);
  }
  catch(err) {
    return res.send(432, err.message);
  }

  userModel.addUser(req.body.username, req.body.password, req.body.email, function(err, usr) {
    if(err === 'UserAlreadyExists') return res.send(432, "User already exists");
    else if(err === 'UserDbError') return res.send(433, "DB can't add user");
    else if(err) return res.send(400);

    req.logIn(usr, function(err) {
      if(err) return next(err); 
      else return res.json(200, usr); 
      //else return res.redirect('/users/' + req.user.id);
    });
  });
}

function login(req, res, next) {
  passport.authenticate('local', function(err, user) {

  if(err)     { return next(err); }
  if(!user)   { return res.send(400); }

  req.logIn(user, function(err) {
    if(err) return next(err);

    if(req.body.rememberme) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
    res.json(200, user);
    });
  })(req, res, next);
}

function logout(req, res, next) {
  if(req.isAuthenticated()) req.logout();
  if(userModel != null) userModel.logoutUser();
  res.send(200);
}

function getuser(req, res, next) {
  if(!req.isAuthenticated()) return res.send(434, 'User not loged');

  userModel.getUserById(req.params.user_id, function(err, usr) {
    if(err === 'UserDbError') return res.send(433, "DB can't add user");
    else if(err === 'NoUser') return res.send(434, 'User not found');
    else if(err) return res.send(400);
    
    res.json(200, usr);
  });
}

function getLoggedUser(req, res, next) {
  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.send(434, 'User not loged');
  
  res.json(200, { id: loggedUser.id });
}

function getgroups(req, res, next) {
  if(!req.isAuthenticated()) return res.send(434, 'User not loged');
  
  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.send(434, 'User not logged');
  
  var grId = loggedUser.grouplist.map(function(object) { return object.groupId });
  
  groupModel.find({ id: { $in: grId } }, function(err, groups) {
    if (err) { res.send(err); return; }
    //console.log(groups);
    res.json(groups);
  });
}

function savegroup(req, res, next) {
  if(!req.isAuthenticated()) return res.send(434, 'User not loged');
  
  delete req.body._id;
  delete req.body.__v;
  groupModel.findOneAndUpdate({id : req.params.group_id}, req.body, {upsert:true}, function(err, group) {
    if (err) { res.send(err); return; }
  });
}
//432 - Autorization error
//433 - User db error
//434 - User not found