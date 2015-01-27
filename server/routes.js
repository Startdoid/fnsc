var _ = require('underscore');
var path = require('path');
var taskModel = require('./models/task');
var userModel = require('./models/user');
var groupModel = require('./models/group');
var errors = require('./errors');
var passport = require('passport');

var state = {
  id: 0,
  usrLogged: false,
  usrCRC: null,
  serverRoute: ''
};
  
var routeExclude = ['/img/avatars/',
  '/js/jquery.min.map',
  '/favicon.ico',
  '/codebase/skins/fonts/PTS-webfont.ttf',
  '/codebase/skins/fonts/PTS-webfont.woff'];

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
    path: '/api/v1/groups',
    httpMethod: 'GET',
    middleware: [getgroups]
  },
  {
    path: '/api/v1/groups/:group_id',
    httpMethod: 'GET',
    middleware: [getgroup]
  },
  {
    path: '/api/v1/groups/:group_id',
    httpMethod: 'PUT',
    middleware: [savegroup]
  },
  {
    path: '/api/v1/groups/:group_id',
    httpMethod: 'DELETE',
    middleware: [deletegroup]
  },
  {
    path: '/api/v1/tasks',
    httpMethod: 'GET',
    middleware: [gettasks]
  },
  {
    path: '/api/v1/tasks/:task_id',
    httpMethod: 'GET',
    middleware: [gettask]
  },
  {
    path: '/api/v1/tasks/:task_id',
    httpMethod: 'PUT',
    middleware: [savetask]
  },
	{
    path: '/api/v1/tasks/:task_id',
    httpMethod: 'DELETE',
    middleware: [deletetask]
  },
  {
    path: '/api/v1/users/:user_id',
    httpMethod: 'GET',
    middleware: [getUser]
  },
  {
    path: '/api/v1/users/:user_id',
    httpMethod: 'PUT',
    middleware: [saveUser]
  },
  {
    path: '/api/v1/users/:user_id',
    httpMethod: 'POST',
    middleware: [saveUser]
  },  
  {
    path: '/api/v1/userlist',
    httpMethod: 'GET',
    middleware: [userlist]
  },
  {
    path: '/api/v1/state',
    httpMethod: 'GET',
    middleware: [getState]
  },
  {
    path: '/api/v1/state',
    httpMethod: 'POST',
    middleware: [setState]
  },  
  {
    path: '/api/v1/country',
    httpMethod: 'GET',
    middleware: [getcountry]
  },
  {
    path: '/api/v1/city',
    httpMethod: 'GET',
    middleware: [getcity]
  },
  {
    path: '/api/v1/familystatus',
    httpMethod: 'GET',
    middleware: [getfamilystatus]
  },
  {
    path: '/api/v1/login',
    httpMethod: 'POST',
    middleware: [login]
  },
  {
    path: '/api/v1/logout',
    httpMethod: 'PUT',
    middleware: [logout]
  },
  {
    path: '/api/v1/register',
    httpMethod: 'POST',
    middleware: [register]
  },
  {
    path: '/img/avatars',
    httpMethod: 'GET',
    middleware:[function (req, res) {
      //var requestedView = path.join('./', req.url);
      res.type('image/png').status(304).end();
    }] 
  },
  {
    path: '/codebase/skins/fonts/*',
    httpMethod: 'GET',
    middleware:[sendFonts]
  },  
  {
    path: '/*',
    httpMethod: 'GET',
    middleware: [throwInRoot]
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
        //break;
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

function sendFonts(req, res, next) {
  res.type('application/x-font-woff');
  //var options = {
  //  root: __dirname + '/public/',
  //  dotfiles: 'deny',
  //  headers: {
  //    'x-timestamp': Date.now(),
  //    'x-sent': true
  //  }
  //};

  var fileName = req.params[0];
  res.sendFile(path.join(__dirname, '../client/codebase/fonts', fileName), function (err) {
    if (err) {
      console.log('sendFonts:'+err);
      res.status(err.status).end();
    }
  });
}

function getState(req, res, next) {
  if(req.isAuthenticated()) {
    var loggedUser = userModel.getLoggedUser();
    if(loggedUser !== null) {
      state.id = loggedUser.id;
      state.usrLogged = true;
    }
  } else {
    state.id = 0;
    state.usrLogged = false;
  }
  
  res.status(errors.restStat_isOk).json(state);
}

function setState(req, res, next) {
  if(req.body.serverRoute !== 'undefined') {
    state.serverRoute = '';//req.body.serverRoute;
  }
  
  res.status(errors.restStat_isOk).send('');
}

function register(req, res, next) {
  try {
    userModel.validate(req.body);
  }
  catch(err) {
    return res.status(errors.restStat_UserValidationError).send(err.message);
  }

  userModel.addUser(req.body.username, req.body.password, req.body.email, function(err, usr) {
    if(err !== null) return res.status(err.status).send(err.message);

    req.logIn(usr, function(err) {
      if(err) return next(err); 
      if(req.body.rememberme) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
      return res.status(errors.restStat_isOk).json(usr); 
    });
  });
}

function login(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if(err)     { return next(err); }
    if(!user)   { return res.status(info.status).send(info.message); }

    req.logIn(user, function(err) {
      if(err) return next(err);
      if(req.body.rememberme) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
      res.status(errors.restStat_isOk).json({ id: user.id, usrLogged: true });
    });
  })(req, res, next);
}

function logout(req, res, next) {
  if(req.isAuthenticated()) req.logout();
  if(userModel.model != null) userModel.logoutUser();
  
  res.status(errors.restStat_isOk).end();
}

function throwInRoot(req, res, next) {
  if(routeExclude.indexOf(req.url) != -1) return next();
  state.serverRoute = req.path;
  res.redirect('/');
}

function getUser(req, res, next) {
  if(!req.isAuthenticated()) return res.status(errors.restStat_NoAutorisationUser).send(errors.restMess_NoAutorisationUser);

  userModel.getUserById(req.params.user_id, function(status, message, usr) {
    if(status === errors.restStat_isOk) { 
      res.status(status).json(usr);
    } else {
      res.status(status).send(message);
    }
  });
}

function saveUser(req, res, next) {
  if(!req.isAuthenticated()) return res.status(errors.restStat_NoAutorisationUser).send(errors.restMess_NoAutorisationUser);
  
  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.status(errors.restStat_NoAutorisationUser).send(errors.restMess_NoAutorisationUser);

  if(loggedUser.id === Number(req.params.user_id))
  {
    userModel.saveLoggedUserFromBody(req.body, function(status, error) { 
      if(status === errors.restStat_isOk) { 
        res.status(status).end(); 
      } else {
        res.status(status).send(errors);
      }
    });
  } else {
    res.status(errors.restStat_NoAutorisationUser).send(errors.restMess_NoAutorisationUser);
  }
}

function getgroup(req, res, next) {
  res.status(200).end();
}

function getgroups(req, res, next) {
  if(!req.isAuthenticated()) return res.status(200).send({ id: 0, usrLogged: false });
  
  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.status(200).send({ id: 0, usrLogged: false });
  
  groupModel.getGroups(loggedUser, null, function(err, groups) {
    if(err) return res.status(400).send(err);
    
    res.status(200).json(groups);
  });
}

function savegroup(req, res, next) {
  if(!req.isAuthenticated()) return res.status(200).send({ id: 0, usrLogged: false });

  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.status(200).send({ id: 0, usrLogged: false });
  
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
    if (err) { res.status(400).send(err); }
    res.status(200).end();
  });
}

function deletegroup(req, res, next) {
  res.status(400).end();
}

function gettasks(req, res, next) {
  if(!req.isAuthenticated()) return res.status(200).send({ id: 0, usrLogged: false });

  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.status(200).send({ id: 0, usrLogged: false });

  //!!!!!Вставить проверку на права просмотра группы для текущего пользователя!!!!!

  //Проверим переданный атрибут - идентификатор группы по которой происходит отбор задач
  //если идентификатор пустой, тогда делается выборка по всем личным группам

  groupModel.getGroupById(req.params.group_id, function(err, grp) {
    if(err === 'GroupDbError') return res.status(433).send("DB group error");
    else if(err === 'NoGroup') return res.status(434).send('Group not found');
    else if(err) return res.status(400).end();

    var arrTaskId = grp.tasklist.map(function(object) { return object.taskId });
    taskModel.model.find({ id: { $in: arrTaskId } }, function(err, tasks) {
      if (err) { res.status(400).send(err); return; }
      res.status(200).json(tasks);
    });
  });
}

function gettask(req, res, next) {
  res.status(400).end();
}

function savetask(req, res, next) {
  if(!req.isAuthenticated()) return res.status(200).send({ id: 0, usrLogged: false });

  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.status(200).send({ id: 0, usrLogged: false });
  
  //!!!!!Вставить проверку на права просмотра группы для текущего пользователя!!!!!
  
  groupModel.getGroupById(req.params.group_id, function(err, grp) {
    if(err === 'GroupDbError') return res.status(433).send("DB group error");
    else if(err === 'NoGroup') return res.status(434).send('Group not found');
    else if(err) return res.status(400).end();

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
      if (err) { res.status(200).send(err); }
      res.status(200).end();
    });
  });  
}

function deletetask(req, res, next) {
  res.status(400).end();
}

function userlist(req, res, next) {
  var start = req.param('start');
  var count = req.param('count');
  var userId = req.param('userId');
  
  userModel.getUsersList(Number(start), Number(start) + Number(count), {}, function(status, message, userlist) {
    if(status === errors.restStat_isOk)
      res.status(status).json(userlist);
  });

  // if (Number(start) === 0) {
  //   //Первый вызов, это инициализация динамического списка первыми данными
  // } else {
  //   //последующая подгрузка: get "count" records from "pos" position
  //   var json = { pos:start, data:[] };
  //   for (var i = 0; i < count; i++) {
  //     json.data.push({ img:'1.jpg', name:'bru'+(start*1+(i+1)), email:'bru@bru.bru' });
  //   }
  //   res.status(200).send(json);
  // }
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
  res.status(200).send(country);
}

function getcity(req, res, next) {
  var city = [
	  {id:1, value:'Выбор города'},
    {id:2, value:'Красноярск'},
    {id:3, value:'Москва'}
  ];
  res.status(200).send(city);
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
  res.status(200).send(familystatus);
}