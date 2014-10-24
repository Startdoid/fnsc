var _ = require('underscore');
var path = require('path');
var taskModel = require('./models/task');
var userModel = require('./models/user');
var groupModel = require('./models/group');

	var collect = [
    {id:1, parent_id:0, name: "My organization", numUsers: 5},
    {id:2, parent_id:1, name: "Administrations", numUsers: 2},
    {id:3, parent_id:2, name: "CEO", numUsers: 1},
    {id:55, parent_id:2, name: "Vice CEO", numUsers: 1},
    {id:425, parent_id:55, name: "financical departament", numUsers: 2},
    {id:4, parent_id:0, name: "investors", numUsers: 1}
  ];

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
    path: '/groups',
    httpMethod: 'GET',
    middleware: [function(req, res) {
      console.log('srv: in groups');
      //res.json(JSON.stringify(collect));
      groupModel.find(function(err, groups) {
        if (err) { res.send(err); return; }
        //console.log(groups);
        res.json(groups);
      });
    }]
  },
  //сохранить модель коллекции
  {
    path: '/groups/:group_id',
    httpMethod: 'PUT',
    middleware: [function (req, res) {
      console.log(req.body);
      groupModel.findOneAndUpdate({id : req.params.group_id}, req.body, {upsert:true}, function(err, group) {
        if (err) { res.send(err); return; }
        
        console.log(group);
      });
      
      //Task.create({
      //   text : req.body.text,
      //   done : false
      // }, function(err, task) {
      //   if (err)
      //     res.send(err);
    }]
  },
  //получить пользователя, а вместе с ним настройки сессии
  {
    path: '/user/:user_id',
    httpMethod: 'GET',
    middleware: [function(req, res){
      console.log(req.params.user_id);
      userModel.findOne({id : req.params.user_id}, function(err, user) {
        if (err) { res.send(err); return; }
        if (!user) {}
        
        console.log(user);
        res.json(user);
      });
    }]
  },

  //получить задачу из базы
  {
    path: '/tasks/:task_id',
    httpMethod: 'GET',
    middleware: [function (req, res) {
      console.log(req.params.task_id);
      // use mongoose to get all tasks in the database
      
      taskModel.findOne( { id: req.params.task_id }, function(err, task) {
      // if there is a1n error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
          console.log('error');
          res.send(err);
        };
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
    path: '/*',
    httpMethod: 'GET',
    middleware: [function(req, res) {
      res.sendfile('./client/index.html'); 
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
}

function ensureAuthorized(req, res, next) {
  console.log('hat');
  return next();
}