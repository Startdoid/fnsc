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
  {
    path: '/api/groups',
    httpMethod: 'GET',
    middleware: [getgroups]
  },
  {
    path: '/api/groups/:group_id',
    httpMethod: 'GET',
    middleware: [getgroup]
  },
  {
    path: '/api/groups/:group_id',
    httpMethod: 'PUT',
    middleware: [savegroup]
  },
  {
    path: '/api/groups/:group_id',
    httpMethod: 'DELETE',
    middleware: [deletegroup]
  },
  {
    path: '/api/tasks',
    httpMethod: 'GET',
    middleware: [gettasks]
  },
  {
    path: '/api/tasks/:task_id',
    httpMethod: 'GET',
    middleware: [gettask]
  },
  {
    path: '/api/tasks/:task_id',
    httpMethod: 'PUT',
    middleware: [savetask]
  },
	{
    path: '/api/tasks/:task_id',
    httpMethod: 'DELETE',
    middleware: [deletetask]
  },
  {
    path: '/api/users/:user_id',
    httpMethod: 'GET',
    middleware: [getuser]
  },
  {
    path: '/api/userlist',
    httpMethod: 'GET',
    middleware: [userlist]
  },
  {
    path: '/api/logged',
    httpMethod: 'GET',
    middleware: [getLoggedUser]
  },
  {
    path: '/api/country',
    httpMethod: 'GET',
    middleware: [getcountry]
  },
  {
    path: '/api/city',
    httpMethod: 'GET',
    middleware: [getcity]
  },
  {
    path: '/api/familystatus',
    httpMethod: 'GET',
    middleware: [getfamilystatus]
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
    res.json(200, { id: user.id, usrLogged: true });
    });
  })(req, res, next);
}

function logout(req, res, next) {
  if(req.isAuthenticated()) req.logout();
  if(userModel.model != null) userModel.logoutUser();
  res.send(200);
}

function getuser(req, res, next) {
  if(!req.isAuthenticated()) return res.send(200, { id: 0, usrLogged: false });

  userModel.getUserById(req.params.user_id, function(err, usr) {
    if(err === 'UserDbError') return res.send(433, "DB can't add user");
    else if(err === 'NoUser') return res.send(434, 'User not found');
    else if(err) return res.send(400);
    
    res.json(200, usr);
  });
}

function getLoggedUser(req, res, next) {
  if(!req.isAuthenticated()) return res.send(200, { id: 0, usrLogged: false });
  
  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.send(200, { id: 0, usrLogged: false });
  
  res.json(200, { id: loggedUser.id, usrLogged: true });
}

function getgroup(req, res, next) {
  res.send(200);
}

function getgroups(req, res, next) {
  if(!req.isAuthenticated()) return res.send(200, { id: 0, usrLogged: false });
  
  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.send(200, { id: 0, usrLogged: false });
  
  groupModel.getGroups(loggedUser, null, function(err, groups) {
    if(err) return res.send(400, err);
    
    res.json(groups);
  });
}

function savegroup(req, res, next) {
  if(!req.isAuthenticated()) return res.send(200, { id: 0, usrLogged: false });

  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.send(200, { id: 0, usrLogged: false });
  
  var arrGrId = loggedUser.grouplist.map(function(object) { return object.groupId });
  var index = arrGrId.indexOf(Number(req.params.group_id));
  if(index === -1) loggedUser.grouplist.push( { groupId: Number(req.params.group_id), permission: 0 } );
    else {
      loggedUser.grouplist[index].groupId = Number(req.params.group_id);
      loggedUser.grouplist[index].permission = 0;
    }
  loggedUser.save();

  delete req.body._id;
  delete req.body.__v;
  groupModel.model.findOneAndUpdate({id : Number(req.params.group_id)}, req.body, {upsert:true}, function(err, group) {
    if (err) { res.send(err); }
    res.send(200);
  });
}

function deletegroup(req, res, next) {
  res.send(400);
}

function gettasks(req, res, next) {
  if(!req.isAuthenticated()) return res.send(200, { id: 0, usrLogged: false });

  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.send(200, { id: 0, usrLogged: false });

  //!!!!!Вставить проверку на права просмотра группы для текущего пользователя!!!!!

  //Проверим переданный атрибут - идентификатор группы по которой происходит отбор задач
  //если идентификатор пустой, тогда делается выборка по всем личным группам

  groupModel.getGroupById(req.params.group_id, function(err, grp) {
    if(err === 'GroupDbError') return res.send(433, "DB group error");
    else if(err === 'NoGroup') return res.send(434, 'Group not found');
    else if(err) return res.send(400);

    var arrTaskId = grp.tasklist.map(function(object) { return object.taskId });
    taskModel.model.find({ id: { $in: arrTaskId } }, function(err, tasks) {
      if (err) { res.send(err); return; }
      res.json(tasks);
    });
  });
}

function gettask(req, res, next) {
  res.send(400);
}

function savetask(req, res, next) {
  if(!req.isAuthenticated()) return res.send(200, { id: 0, usrLogged: false });

  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.send(200, { id: 0, usrLogged: false });
  
  //!!!!!Вставить проверку на права просмотра группы для текущего пользователя!!!!!
  
  groupModel.getGroupById(req.params.group_id, function(err, grp) {
    if(err === 'GroupDbError') return res.send(433, "DB group error");
    else if(err === 'NoGroup') return res.send(434, 'Group not found');
    else if(err) return res.send(400);

    var arrTaskId = grp.tasklist.map(function(object) { return object.taskId });
    var index = arrTaskId.indexOf(Number(req.params.task_id));
    if(index === -1) grp.tasklist.push( { taskId: Number(req.params.task_id), permission: 0 } );
      else {
        grp.tasklist[index].taskId = Number(req.params.task_id);
        grp.tasklist[index].permission = 0;
      }
    grp.save();

    delete req.body._id;
    delete req.body.__v;
    taskModel.model.findOneAndUpdate({id : Number(req.params.task_id)}, req.body, {upsert:true}, function(err, task) {
      if (err) { res.send(err); }
      res.send(200);
    });
  });  
}

function deletetask(req, res, next) {
  res.send(400);
}

function userlist(req, res, next) {
  var start = req.param("start");
  var count = req.param("count");
  
  if (!start && !count) {
    //Первый вызов, это инициализация динамического списка первыми данными
    res.send({
      total_count:5000,
      data:[
        //initial set of data
        { img:'1.jpg', name:'bru1', email:'bru@bru.bru' },
        { img:'1.jpg', name:'bru2', email:'bru@bru.bru' },
        { img:'1.jpg', name:'bru3', email:'bru@bru.bru' }
      ]
    });
  } else {
    //последующая подгрузка: get "count" records from "pos" position
    var json = { pos:start, data:[] };
    for (var i = 0; i < count; i++) {
      json.data.push({ img:'1.jpg', name:'bru'+(start*1+(i+1)), email:'bru@bru.bru' });
    }
    res.send(json);
  }
  
  //  { img: '1.jpg', name: 'bru14', email: 'bru@bru.bru' }
	//res.json(mydataset);
  //res.send(200);
}

function getcountry(req, res, next) {
  var country = [
	  {id:1, value:'Выбор страны'},
    {id:2, value:'Россия'},
    {id:3, value:'Украина'},
    {id:4, value:'Беларусь'},
    {id:5, value:'Казахстан'},
    {id:6, value:'Азербайджан'},
    {id:7, value:'Армения'},
    {id:8, value:'Грузия'},
    {id:9, value:'Израиль'}
  ];
  res.send(country);
}

function getcity(req, res, next) {
  var city = [
	  {id:1, value:'Выбор города'},
    {id:2, value:'Красноярск'},
    {id:3, value:'Москва'}
  ];
  res.send(city);
}

function getfamilystatus(req, res, next) {
  var familystatus = [
	  {id:1, value:'Выбор статуса'},
    {id:2, value:'В поиске'},
    {id:3, value:'Не женат'},
    {id:4, value:'Встречается'},
    {id:5, value:'Помолвен'},
    {id:6, value:'Женат'},
    {id:7, value:'Влюблен'}
  ];
  res.send(familystatus);
}
//432 - Autorization error
//433 - User db error
//434 - User not found