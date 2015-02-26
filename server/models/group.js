/**
* Модуль серверной модели работы с пользователями
* @module Group
* @author iceflash, bruian
*/

var pg            = require('pg');
var global        = require('../global');
var mongoose      = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var errors        = require('../errors');

var groupSchema = mongoose.Schema({
  id: Number, //идентификатор группы
  parent_id: Number, //идентификатор родителя в иерархии групп
  name: String, //наименование группы
  email: String,
  description: String
});

groupSchema.plugin(autoIncrement.plugin, { model: 'group', field: 'id' });
var groupModel = mongoose.model('group', groupSchema);

module.exports = {
  model: groupModel,
  getGroupById: function(id, callback) {
    groupModel.findOne({ id : id }, function(err, group) {
      if (err) return callback("GroupDbError");
      if (group === null) return callback("NoGroup");
  
      callback(null, group.toObject());
    });
  },
  /**
   * Чтение списка групп из БД (mongoDB и Postgres), извлечение групп происходит в два этапа:
   * 1 этап - присходит для основных веток дерева parent_id = 0
   * 2 этап - извлекаются потомки основных веток, при раскрытии родителя parent_id > 0
   * @param {Object} user - осн.пользователь
   * @param {String} params.user_id - идентификатор пользователя относительно которого извлекаются данные
   * @param {String} params.parent_id - идентификатор родителя извлекаемых групп
   * @param {String} params.cont - false 1 этап извлечения, true 2-ой этап извлечения
   * @param {function} callback(err, groups|error message) - результат функции возвращается в коллбэк,
   * где если err не null то результат функции является ошибка с комментарием в error message,
   * если нет ошибки то err должно быть = null и groups должен содержать массив возвращаемых групп
   * в след. формате: для cont = true { 'parent': parent, 'data': [массив групп (см. ниже)] }
   * для cont = false [{ id: идентификатор группы, ост. поля возвращаемой группы, webix_kids (булев параметр для webix) }]
   */  
  getGroups: function(user, params, callback) {
    if(user === null) return callback("NeedUser");
    
    pg.connect(global.url_pg, function(err, client, done) {
	   	if(err) {
	   	  callback(errors.restStat_isOk, 'Fail connection to database');
    		console.log('connection error (Postgres):' + err);
    		done();
    		return;
    	}
      var queryResult = function(err, result) {
  	   	if(err) {
  	   	  callback(errors.restStat_isOk, 'Fail get query from database');
      		console.log('connection error (Postgres):' + err);
      		done();
      		return;
      	}

    	  if(result.rows.length === 0) {
          callback(errors.restStat_isOk, '0 groups for this user in database');
          done();
          return;
        }

        var arrGroups = result.rows.map(function(object) { 
          var user_type = 'Не в группе';
          switch(object.user_type) {
            case 0: 
              user_type = 'Владелец';
              break;
            case 1:
              user_type = 'Куратор';
              break;
            case 2:
              user_type = 'Участник';
              break;
          }
      	  return { 'id': object.id, 'parent_id': object.parent_id, 'groupVisible': object.groupVisible,
      	    'name': object.name, 'description': object.description, 'email': object.email, 
      	    'webix_kids': object.hasChildren, 'user_type': user_type, 'order': object.order };
      	});
      	
	    	if(!params.cont)
          callback(null, arrGroups);
        else
          callback(null, { 'parent': params.parent_id, 'data': arrGroups });
      };
      
      if(params.user_id === 0) {
      	client.query(global.pg_query_getAllGroups, [user.id, params.parent_id], queryResult);
      } else {
        client.query(global.pg_query_getAllGroupsForUser, [user.id, params.parent_id, params.user_id], queryResult);
      }
    });
    
    //Старое содержание функции
  	//var arrGrId = result.rows.map(function(object) { return object.GroupId });
  	//groupModel.find({ id: { $in: arrGrId }  }, function(err, groups) {
    //  if (err) return callback("GroupDbError");
    //    callback(null, groups);
    //});
  },
  getPublicGroups: function(user, filter, callback) {
    if(user === null) return callback("NeedUser");
    
    groupModel.find({ visible: 2  }, function(err, groups) {
      if (err) return callback("GroupDbError");
      
      callback(null, groups);
    });
  }
};