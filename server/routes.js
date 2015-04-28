var http       = require('http');
var _          = require('underscore');
var path       = require('path');
var taskModel  = require('./models/task');
var userModel  = require('./models/user');
var groupModel = require('./models/group');
var errors     = require('./errors');
var passport   = require('passport');
var global     = require('./global');
var Upload     = require('upload-file');
var lwip       = require('lwip');
var fs         = require('fs');
var moment     = require('moment');

var routeExclude = ['/img/avatars/',
  '/img/gravatars/',
  '/js/jquery.min.map',
  '/favicon.ico',
  '/codebase/skins/fonts/PTS-webfont.ttf',
  '/codebase/skins/fonts/PTS-webfont.woff'];

var routes = [
  // Views
  {
    path: '/api/v1/upload',
    httpMethod: 'POST',
    middleware: [uploader]
  },  
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
    middleware: [getGroups]
  },
  {
    path: '/api/v1/groups',
    httpMethod: 'PUT',
    middleware: [putGroups]
  },
  {
    path: '/api/v1/groups',
    httpMethod: 'POST',
    middleware: [postGroups]
  },
  {
    path: '/api/v1/groups',
    httpMethod: 'DELETE',
    middleware: [deleteGroups]
  },  
  {
    path: '/api/v1/groups/:group_id',
    httpMethod: 'GET',
    middleware: [getGroup]
  },
  {
    path: '/api/v1/groups/:group_id',
    httpMethod: 'PUT',
    middleware: [saveGroup]
  },
  {
    path: '/api/v1/groups/:group_id',
    httpMethod: 'DELETE',
    middleware: [deleteGroup]
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
    path: '/api/v1/users',
    httpMethod: 'GET',
    middleware: [getUsers]
  },
  {
    path: '/api/v1/users',
    httpMethod: 'PUT',
    middleware: [addUsers]
  },
  {
    path: '/api/v1/users',
    httpMethod: 'DELETE',
    middleware: [deleteUsers]
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
    path: '/img/avatars/*',
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

//bru: загрузка файла на сервер
function uploader(req, res, next) {
  var loggedUser = userModel.getLoggedUser();
  
  new Upload(req, {
    dest: './client/tmp',
    maxFileSize: 100 * 1024,
    rename: function(filename) {
      return filename;
    },
    done: function(err, files) {
      //console.log(files);
      if (global.imgs.indexOf(path.extname(filename)) != -1) {
        lwip.open('./client/tmp/' + filename, function(err, image) {
          if(err) return res.send(errors.restMess_ImgErr);
          
          image.resize(100, 100, function(err, image) {
            if(err) return res.send(errors.restMess_ImgErr);
            
            image.writeFile('./client/img/avatars/100/avtr'+loggedUser.id+'.png', function(err) {
              if(err) return res.send(errors.restMess_ImgErr);
              
              step2();
            });
          });
        });

        var step2 = function() {
          lwip.open('./client/tmp/' + filename, function(err, image) {
            if(err) return res.send(errors.restMess_ImgErr);
            
            image.resize(200, 200, function(err, image) {
              if(err) return res.send(errors.restMess_ImgErr);
              
              image.writeFile('./client/img/avatars/200/avtr'+loggedUser.id+'.png', function(err) {
                if(err) return res.send(errors.restMess_ImgErr);

                fs.unlinkSync('./client/tmp/' + filename);
                res.send(errors.restMess_ImgOk);
              });
            });
          });
        };
      } else {
        res.send(errors.restMess_ImgErr);
      }
    }
  });
}

function getState(req, res, next) {
  if(req.isAuthenticated()) {
    var loggedUser = userModel.getLoggedUser();
    if(loggedUser !== null) {
      global.state.id = loggedUser.id;
      global.state.mainUserLogged = true;
    }
  } else {
    global.state.id = 0;
    global.state.mainUserLogged = false;
  }
  
  res.status(errors.restStat_isOk).json(global.state);
}

function setState(req, res, next) {
  if(req.body.serverRoute !== 'undefined') {
    global.state.serverRoute = '';//req.body.serverRoute;
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
      res.status(errors.restStat_isOk).json({ id: user.id, mainUserLogged: true });
    });
  })(req, res, next);
}

function logout(req, res, next) {
  if(req.isAuthenticated()) req.logout();
  if(userModel.model != null) userModel.logoutUser();
  
  res.status(errors.restStat_isOk).end();
}

//bru: ловит URL и сохраняет в промежуточную переменную, что бы отдать клиенту, когда тот загрузит всё приложение
//и продолжит роут переданный в URL
function throwInRoot(req, res, next) {
  if(routeExclude.indexOf(req.url) != -1) return next();
  console.log(req.url);
  global.state.serverRoute = req.url;
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

//{ Отладочные данные (заглушкка), для отладки клиента, пока не сделано на сервере
//groupVisible: 0 - видна только владельцу, 1 - видна куратору и владельцу, 2 - видна членам группы, куратору и владельцу, 3 - видна всем
var tableGroups = [
  { id: 1, parent_id: 0, webix_kids:true,  groupVisible: 3, name: 'Branch', email: 'branch@maus.ru', description: 'Это корневая ветка в тестовом дереве групп', numUsers: 1 },
  { id: 2, parent_id: 0, webix_kids:false, groupVisible: 3, name: 'Branch two', email: 'branch_two@maus.ru', description: 'Это вторая корневая ветка в тестовом дереве групп', numUsers: 1 },
  { id: 3, parent_id: 1, webix_kids:true,  groupVisible: 3, name: 'Sub-Branch', email: 'sub-branch@maus.ru', description: 'Это подветка в корневой ветке в тестовом дереве групп', numUsers: 1 },
  { id: 4, parent_id: 1, webix_kids:false, groupVisible: 3, name: 'Sub-Branch two', email: 'sub-branch_two@maus.ru', description: 'Это вторая подветка в корневой ветке в тестовом дереве групп', numUsers: 1 },
  { id: 7, parent_id: 1, webix_kids:false, groupVisible: 2, name: 'Sub-Branch two with user 4', email: 'sub-branch_twous4@maus.ru', description: 'Это вторая подветка в корневой ветке в тестовом дереве групп', numUsers: 1 },
  { id: 5, parent_id: 3, webix_kids:false, groupVisible: 3, name: 'Sub-sub-Branch', email: 'sub-sub-branch@maus.ru', description: 'Глубокая подветка, третий уровнеь', numUsers: 1 },
  { id: 6, parent_id: 0, webix_kids:false, groupVisible: 0, name: 'Branch other use with id 4', email: 'branchuser4@maus.ru', description: 'Для пользователя с id 4', numUsers: 1 },
];

var indexIdGroups = [1, 2, 3, 4, 7, 5, 6];

//userType: 0 - owner, 1 - curator, 2 - member
var tableGroups_Member = [
  { id: 1, user_id: 3, userType: 0 },
  { id: 2, user_id: 3, userType: 0 },
  { id: 3, user_id: 3, userType: 0 },
  { id: 4, user_id: 3, userType: 0 },
  { id: 5, user_id: 3, userType: 0 },
  { id: 6, user_id: 4, userType: 0 },
  { id: 7, user_id: 3, userType: 0 },
  { id: 7, user_id: 4, userType: 2 }
];

var indexIdGroups_Member = [1, 2, 3, 4, 5, 6, 7, 7];
//}

/**
* getGroup
*  Функция извлекает группу из DB по переданному ID, при извлечении группы из DB важно учитывать 
* видимость этой группы, видима ли она для осн. пользователя. Если пользователя нет в списках доступа,
* то необходимо проверить обладает ли данная группа публичной видимостью. В противном случае возвращать
* отказ в запросе данной группы
* Attributes:
*  group_id - группа, которая извлекается из DB
* Result:
*****************************************************************************/
function getGroup(req, res, next) {
  if(!req.isAuthenticated()) return res.status(errors.restStat_NoAutorisationUser).send(errors.restMess_NoAutorisationUser);
  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.status(errors.restStat_NoAutorisationUser).send(errors.restMess_NoAutorisationUser);
  
  var group_id = Number(req.param('group_id'));
  
  //сперва найдем права на группу для осн.пользователя, userType - по умолчанию равный 4 означает, 
  //что прав на просмотр пользователь не имеет
  var member = { id: group_id, user_id: loggedUser.id, userType: 4 };
  for(var i = 0; i < tableGroups_Member.length; i++ ) {
    if(tableGroups_Member[i].id === member.id && tableGroups_Member[i] === member.user_id) {
      member.userType = tableGroups_Member[i].userType;
    }
  }
  
  //после извлечения прав на группу, находим саму группу
  for(var i2 = 0; i2 < tableGroups.length; i2++) {
    if (group_id === tableGroups[i2].id) {
      //нашли группу и проверяем её видимость
      if(tableGroups[i2].groupVisible === 3) {
        //группа видима всем, можно отдавать клиенту
        return res.status(errors.restStat_isOk).json(tableGroups[i2]);
      } else if(tableGroups[i2].groupVisible >= member.userType) {
        //простая проверка на видимость и тип пользователя, т.к. видимость распространяется от
        //владельца группы к простому члену группы, то сравнив тип пользователя и видимость мы 
        //учтем его право на просмотр
        return res.status(errors.restStat_isOk).json(tableGroups[i2]);
      } else {
        //осн. пользователю нельзя показывать эту группу, возвращаем наименование группы и id
        return res.status(errors.restStat_isOk).json( {id: tableGroups[i2].id, name: tableGroups[i2].name, notVisible: true } );
      }
    }
  }
  
  //типа данные вообще не прочитались из базы данных
  return res.status(errors.restStat_DbReadError).send(errors.restMess_DbReadError);
}

/**
* getGroups
*  Функция извлекает группы из DB, это несколько сложная задача. Необходимо извлечь группы относительно 
* пользователя чей id указан в userId, при этом учесть права видимости для извлекаемых групп относительно
* осн.пользователя.
* Attributes:
*  userId - пользователь, относительно которого извлекается массив групп
*  - если значение 0, то извлекаются все группы в соответствии с настройками приватности для групп
*  т.е. все "публичные" группы + группы которые видимы осн-пользователю
* Result:
*****************************************************************************/
function getGroups(req, res, next) {
  if(!req.isAuthenticated()) return res.status(errors.restStat_NoAutorisationUser).send(errors.restMess_NoAutorisationUser);
  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.status(errors.restStat_NoAutorisationUser).send(errors.restMess_NoAutorisationUser);

  var userId = req.param('userId'),
  cont = req.param('continue'),
  parent = req.param('parent');
  
  //Если cont = true, то значит запрошена вторая порция данных (т.е. раскрываются дополнительные ветки)
  //если cont = false, то значит запрошена первая порция данных корни групп
  
  if(typeof userId === 'undefined')
    userId = 0;
  else
    userId = Number(userId);
    
  if(typeof parent === 'undefined')
    parent = 0;
  else
    parent = Number(parent);    
    
  if(typeof cont === 'undefined')
    cont = false;
  else if (cont === 'true')
    cont = true;
  else
    cont = false;
    
  console.log(userId);
  console.log(parent);
  console.log(cont);
  
  if(!cont) {
    return res.status(errors.restStat_isOk).json({ id: 2, parent_id: 0, webix_kids:false, groupVisible: 3, name: 'Branch two', email: 'branch_two@maus.ru', description: 'Это вторая корневая ветка в тестовом дереве групп', numUsers: 1 });
  }
  
  // groupModel.getGroups(loggedUser, { user_id: userId, parent_id: parent, cont: cont }, function(err, groups) {
  //   if(err) return res.status(err).send(groups);
  //   console.log(groups);
  //   return res.status(errors.restStat_isOk).json(groups);
  // });
}

/**
* setGroups
*  Функция изменяет, удаляет, добавляет группы в DB
* Attributes:
*  userId - пользователь, относительно которого извлекается массив групп
*  - если значение 0, то извлекаются все группы в соответствии с настройками приватности для групп
*  т.е. все "публичные" группы + группы которые видимы осн-пользователю
* Result:
*****************************************************************************/
function setGroups(req, res, next) {
  if(!req.isAuthenticated()) return res.status(errors.restStat_NoAutorisationUser).send(errors.restMess_NoAutorisationUser);
  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.status(errors.restStat_NoAutorisationUser).send(errors.restMess_NoAutorisationUser);

  console.log(req.param('index'));
  console.log(req.param('id'));
  console.log(req.body);
  
  var crud = req.param('webix_operation');
  var parent = req.param('parent');
  var id = req.param('id');
  
  if(crud === undefined) {
    //Запрос пришел не от webix
  } else {
    switch (crud) {
      case 'insert':
        // Добавление элемента в дерево
        
        //ВНИМАНИЕ Добавив элемент в дереве, мы должны вернуть на клиент новый id, т.е. назначенный в DB id
        //Необходимо вернуть всю запись с новым id подобно шаблону ниже
        //{ id:'1', name:'Branch', numUsers:1, webix_kids:true }, где webix_kids означает, что ветка
        //содержит потомков, false (или без этого атрибута) - нифига не содержит
        //Опять же всё делаем в коллбеке, добавление в базу и возврат ответа на клиент
        var newGroup;
        
        if(Number(parent) === 0) {
          //Родитель не указан, поэтому добавляем в корень дерева
          
          //ВНИМАНИЕ!! т.к. это данные-заглушка, то использование итератора для присваивание нового Id группе тут приемлемо, в рабочем варианте
          //id должно назначаться механизмом базы данных с использованием автоинкремента
          newGroup = { id: tableGroups.length + 1, parent_id: 0, owner_id: loggedUser.id, name: 'New group', email: '', description: '', numUsers: 1 };
          tableGroups.push(newGroup);
          
          res.status(errors.restStat_isOk).json(newGroup);
        } else {
          //Есть родитель, поэтому добавляем в родителя
        
          //Необходимо обозначить родителю, что его ветка содержит детей, т.е. добавить webix_kids:true
          for (var i = 0; i < tableGroups.length; i++) {
            if(tableGroups[i].id === Number(parent)) {
              tableGroups[i].webix_kids = true;
              break;
            }
          }
          
          //ВНИМАНИЕ!! т.к. это данные-заглушка, то использование итератора для присваивание нового Id группе тут приемлемо, в рабочем варианте
          //id должно назначаться механизмом базы данных с использованием автоинкремента
          newGroup = { id: tableGroups.length + 1, parent_id: Number(parent), owner_id: loggedUser.id, name: 'New group', email: '', description: '', numUsers: 1 };
          tableGroups.push(newGroup);
          
          res.status(errors.restStat_isOk).json(newGroup);
        }
        break;
      
      case 'update':
        //Обновление элемента в дереве
        
        //ВНИМАНИЕ Обновив элемент в дереве, мы должны вернуть на клиент новый id, т.е. назначенный в DB id
        //Необходимо вернуть всю запись с новым id подобно шаблону ниже
        //{ id:'1', name:'Branch', numUsers:1, webix_kids:true }, где webix_kids означает, что ветка
        //содержит потомков, false (или без этого атрибута) - нифига не содержит
        //Опять же всё делаем в коллбеке, добавление в базу и возврат ответа на клиент
        
        //например конструкция ниже возвращает клиенту тоже что и получил
        delete req.body.webix_operation;
        res.status(errors.restStat_isOk).json(req.body);
        break;
      
      case 'delete':
          //При удалении ветки дерева необходимо удостовериться, что пользователь является владельцем этой ветки,
          //и правильно обработать потомков в дереве
          for (var i = 0; i < tableGroups.length; i++) {
            if(tableGroups[i].id === Number(parent)) {
              tableGroups[i].webix_kids = true;
              break;
            }
          }        
        
        res.status(errors.restStat_isOk).end();
        break;
    }
  }
}

//Обработчики crud для не вебикс запросов
//**************************************************************************************************
function postGroups(req, res, next) {
  return setGroups(req, res, next);
}

function putGroups(req, res, next) {
  return setGroups(req, res, next);
}

function deleteGroups(req, res, next) {
  return setGroups(req, res, next);
}
//**************************************************************************************************

function saveGroup(req, res, next) {
  // if(!req.isAuthenticated()) return res.status(200).send({ id: 0, mainUserLogged: false });

  // var loggedUser = userModel.getLoggedUser();
  // if(loggedUser === null) return res.status(200).send({ id: 0, mainUserLogged: false });
  
  // var arrGrId = loggedUser.grouplist.map(function(object) { return object.groupId });
  // var index = arrGrId.indexOf(Number(req.params.group_id));
  // if(index === -1) loggedUser.grouplist.push( { groupId: Number(req.params.group_id), permission: 0 } );
  //   else {
  //     loggedUser.grouplist[index].groupId = Number(req.params.group_id);
  //     loggedUser.grouplist[index].permission = 0;
  //   }
  // loggedUser.save();

  // delete req.body._id;
  // delete req.body.__v;
  // groupModel.model.findOneAndUpdate({id : Number(req.params.group_id)}, req.body, {upsert:true}, function(err, group) {
  //   if (err) { res.status(400).send(err); }
  //   res.status(errors.restStat_isOk).end();
  // });
  res.status(200).end();
}

function deleteGroup(req, res, next) {
  res.status(400).end();
}

//**************************************************************************************************

var tasks = [{ id: 1, //уникальный идентификатор задачи
  parent_id: 0, //уникальный идентификатор родителя задачи, 0 - для корневых задач
  webix_kids:true, //специфичный идентификатор для клиентской части, указывающий на наличие потомков у ветки
  title: 'Это первая моя задача', //описание задачи
  status: 0,//Отметка об исполнении задачи. Имеет 4 состояния: К исполнению (0); Исполнено(3); На утверждении(2); Отклонена(1). 
          //Состояние "К исполнению" имеют все вновь созданные задачи. Состояние "Исполнено" имеют завершенные задачи. 
          //Задачи в настройках, которых отмечена опция "Обязательный аудит", либо в настройках группы 
          //включена подобная опция, имеют состояние "На утверждении" и "Отклонена". Первое состояние показывает что, 
          //задача находится на проверке у владельца задачи, либо у куратора группы. Второе состояние означает, 
          //что задача не прошла проверку. Задачи помеченные, как исполненные и идущие в составе другой задачи, 
          //не исчезают в область "Завершено", а остаются затененными. Но помеченными, как исполненные.
  priority: 'A', //приоритет задачи, A,B,C
  createMoment: moment() //дата создания задачи
}, {id:2, parent_id:1, webix_kids:true, title:'Первая подзадача', status:3, priority:'B', createMoment: moment()},
   {id:3, parent_id:2, webix_kids:false, title:'ПодПодЗадача', status:2, priority:'C', createMoment: moment()},
   {id:4, parent_id:1, webix_kids:false, title:'Просто вторая задача', status:1, priority:'B', createMoment: moment()}];

function gettasks(req, res, next) {
  if(!req.isAuthenticated()) return res.status(errors.restStat_isOk).send({ id: 0, mainUserLogged: false });

  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.status(errors.restStat_isOk).send({ id: 0, mainUserLogged: false });

  //!!!!!Вставить проверку на права просмотра группы для текущего пользователя!!!!!
  
  var userId = req.param('userId'),
  cont = req.param('continue'),
  parent = req.param('parent');
  
  //Если cont = true, то значит запрошена вторая порция данных (т.е. раскрываются дополнительные ветки)
  //если cont = false, то значит запрошена первая порция данных корни групп
  
  if(typeof userId === 'undefined')
    userId = 0;
  else
    userId = Number(userId);
    
  if(typeof parent === 'undefined')
    parent = 0;
  else
    parent = Number(parent);    
    
  if(typeof cont === 'undefined')
    cont = false;
  else if (cont === 'true')
    cont = true;
  else
    cont = false;
    
  console.log(userId);
  console.log(parent);
  console.log(cont);
  
  if(!cont) {
    var arr = [tasks[0], tasks[3]];
    res.status(errors.restStat_isOk).json(arr);
  } else {
    if(parent === 1)
      res.status(errors.restStat_isOk).json({ 'parent': parent, 'data': tasks[1] });
    else if(parent === 2)
      res.status(errors.restStat_isOk).json({ 'parent': parent, 'data': tasks[2] });
  }

  //Проверим переданный атрибут - идентификатор группы по которой происходит отбор задач
  //если идентификатор пустой, тогда делается выборка по всем личным группам

  // groupModel.getGroupById(req.params.group_id, function(err, grp) {
  //   if(err === 'GroupDbError') return res.status(433).send("DB group error");
  //   else if(err === 'NoGroup') return res.status(434).send('Group not found');
  //   else if(err) return res.status(400).end();

  //   var arrTaskId = grp.tasklist.map(function(object) { return object.taskId });
  //   taskModel.model.find({ id: { $in: arrTaskId } }, function(err, tasks) {
  //     if (err) { res.status(400).send(err); return; }
  //     res.status(errors.restStat_isOk).json(tasks);
  //   });
  // });
}

function gettask(req, res, next) {
  var task_id = Number(req.params.task_id);
  var task_json = { id:1, title:'Первая задача', status:0, priority:'A', createMoment: moment(), description:'Описание задачи производится тут' };
  
  switch (task_id) {
    case 1:
      break;
    case 2:
      task_json = { id:2, title:'Первая подзадача', status:3, priority:'B', createMoment: moment(), description:'Вторая подзадача' };
      break;
    default:
      // code
  }
  
  res.status(errors.restStat_isOk).json(task_json);
}

function savetask(req, res, next) {
  if(!req.isAuthenticated()) return res.status(errors.restStat_isOk).send({ id: 0, mainUserLogged: false });

  var loggedUser = userModel.getLoggedUser();
  if(loggedUser === null) return res.status(errors.restStat_isOk).send({ id: 0, mainUserLogged: false });
  
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

/**
 * Запрос массива пользователей у сервера, запрос происходит в несколько этапов (порциями)
 * 1 этап - клиент запрашивает первую порцию пользователей и общее количество пользователей, как константу
 * последующие этапы - криент в соответствии со скролингом списка пользователем запрашивает остальные порции 
 * данных пока их количество не будет достигнуто значения константы
 * @param {Integer} start - начальная позиция считывания
 * @param {Integer} count - количество запрашиваемых элементов
 * @param {Integer} segment_id - идентификатор сегмента, в разрезе которого запрашиваются пользователи
 * @param {String} segment_type - тип сегмента, в разрезе которого запрашиваются пользователи
 * {myprofile, userprofile, groupprofile, community}
 * return:
 * если start === 0, то необходимо вернуть данные согласно следующему шаблону
 *  первая выдача данных { total_count: - количество элементов, data:[] - массив элементов }
 * если start > 0, то необходимо вернуть данные согласно следующему шаблону
 *  последующие порции данных { pos: start - стартовая позиция, data:[] - массив последующих элементов }
*/
function getUsers(req, res, next) {
  var start = req.param('start');
  var count = req.param('count');

  //bru: если значение === 0, то отдаются все пользователи. 
  //В противном случает отдаются друзья пользователя с id = userId
  var segment_id = Number(req.param('segment_id'));
  var segment_type = req.param('segment_type');
  
  switch(segment_type) {
    case 'myprofile':
      // code
      //break;
    case 'userprofile':
      if(segment_id === 0) {
        userModel.getUsersList(Number(start), Number(start) + Number(count), {}, function(status, message, userlist) {
          if(status === errors.restStat_isOk)
            res.status(status).json(userlist);
        });
      } else {
        userModel.getFriends(segment_id, Number(start), Number(count), function(status, message, userlist) {
          if(status === errors.restStat_isOk)
            res.status(status).json(userlist);
          else console.log(message);
        });
      }
      break;
    case 'groupprofile':
      if(segment_id === 0) {
        userModel.getUsersList(Number(start), Number(start) + Number(count), {}, function(status, message, userlist) {
          if(status === errors.restStat_isOk)
            res.status(status).json(userlist);
        });
      } else {
        res.status(errors.restStat_isOk).json('0 groups for this user in database');
      }
      break;
    case 'community':
      break;
  }
}

//bru: Добавление пользователя в список друзей
function addUsers(req, res, next) {
  //bru: Добавляемый пользователь
  var userId = req.param('userId');
  
  userModel.addFriend(userId, function(status) {
    if(status) {
      //bru: в случае успеха отсылает id добавленного пользователя
      res.status(errors.restStat_isOk).send( { userId:userId } );
    } else {res.status(errors.restStat_DbSaveError).end();}
  });
}

//bru:Удаление пользователя из списка друзей
function deleteUsers(req, res, next) {
  //bru: Удаляемый пользователь
  var userId = req.param('userId');
  
  userModel.deleteFriend(userId, function(status) {
    if(status) {
      //bru: в случае успеха отсылает id удаленного пользователя
      res.status(errors.restStat_isOk).send( { userId:userId } );
    } else {res.status(errors.restStat_DbSaveError).end();}
  });
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
  res.status(errors.restStat_isOk).send(country);
}

function getcity(req, res, next) {
  var city = [
	  {id:1, value:'Выбор города'},
    {id:2, value:'Красноярск'},
    {id:3, value:'Москва'}
  ];
  res.status(errors.restStat_isOk).send(city);
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
  res.status(errors.restStat_isOk).send(familystatus);
}