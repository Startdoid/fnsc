//блок, который исполнит вебикс когда все загрузит
var implementFunction = (function() {
  var App = window.App;
  var webix = window.webix;
  var Backbone = window.Backbone;
  
  var CountryData = new webix.DataCollection({ 
    url:'api/country'
  });

  var CityData = new webix.DataCollection({
    url:'api/city'
  });
  
  var FamilyStatusData = new webix.DataCollection({
    url:'api/familystatus'
  });

  webix.ui({
		id:'CountrySuggest', view:'suggest', data:CountryData
	});
	
	webix.ui({
	  id:'CitySuggest', view:'suggest', data:CityData
	});
	
	webix.ui({
	  id:'FamilyStatusSuggest', view:'suggest', data:FamilyStatusData
	});
	
	webix.proxy.GroupData = {
    $proxy: true,
    init: function() {
      //webix.extend(this, webix.proxy.offline);
    },
    load: function(view, callback) {
      //Добавляем id вебиксовых вьюх для синхронизации с данными
  	  //важно добавлять уже после создания всех вьюх, иначе будут добавлены пустые объекты
      App.Trees.GroupTree.viewsAdd($$(view.config.id));
    }
  };
  
  webix.proxy.TaskData = {
    $proxy: true,
    init: function() {
      //webix.extend(this, webix.proxy.offline);
    },
    load: function(view, callback) {
      //Добавляем id вебиксовых вьюх для синхронизации с данными
  	  //важно добавлять уже после создания всех вьюх, иначе будут добавлены пустые объекты
      App.Trees.TaskTree.viewsAdd($$(view.config.id));
    }
  };

  var showInterface = function(enable) {
    if(enable) $$("headerframe").enable(); else $$("headerframe").disable();
    $$("headerframe").refresh();
  };
  
  //создадим экземпляр бакбоновского роутера, который будет управлять навигацией на сайте
	App.Router = new (Backbone.Router.extend({
	  //слева роут, косая в скобках означает, что роут может быть как с косой чертой на конце, так и без нее
	  //справа функция, которая вызовется для соответствующего роута
		routes:{
			"login(/)":"login",
			"logout(/)":"logout",
			"register(/)":"register",
			"groups(/)":"groups",
			"tasks(/)":"tasks",
			"users(/)":"users",
			'home(/)':"home",
			'':"index"
		},
		//home выбрасывает в корень
		home:function() {
		  this.navigate('', {trigger: true});
		},
		//корень приложения
		index:function() {
		  if(App.User.get('id') === 0) {
        var promise = webix.ajax().get('api/logged', {}, function(text, data) {
          App.User.set({'usrLogged': data.json().usrLogged}, {silent: true});
          App.User.set({'id': data.json().id}, {silent: true});
          interfaceSelector();
	      });
	        
        promise.then(function(realdata){}).fail(function(err) {
          connectionErrorShow(err);
        });
		  } else {
		    interfaceSelector();
		  }
		},
		groups:function() {
		  this.navigate('', {trigger: true});
		},
		tasks:function() {
		  this.navigate('', {trigger: true});
		},
		users:function() {
		  this.navigate('', {trigger: true});
		},
		login:function() {
	    $$('loginframe').show();
	    webix.UIManager.setFocus("loginForm");
		},
		logout:function() {
      var promise = webix.ajax().put("api/logout", { id: App.User.id });
	        
      promise.then(function(realdata) {
        defaultState();
        App.Router.navigate('', {trigger: true});
      }).fail(function(err){
        connectionErrorShow(err);
      });
		},
		register:function() {
	    $$('registerframe').show();
		}
	}))();
	
	//***************************************************************************
	//AFTER FETCH FUNCTIONs
  var showUserDataAfterFetch = function(User, response, options) {
    showInterface(true);
    
    $$('userframe').show();
    $$("userframe").hideProgress();
    
    if($$("userlist").getSelectedId() === '') {
      $$('userlist').select($$('userlist').getFirstId());
      App.Frame.filluserframe(App.User.get('id'));
    } else if ($$("userlist").getSelectedId() === $$('userlist').getFirstId()) {
      App.Frame.filluserframe(App.User.get('id'));
    } else {
      App.Frame.filluserframe($$("userlist").getSelectedId());
    }
    
    App.Collections.Groups.fetch({ success: showGroupDataAfterFetch });
  };
	
  var showGroupDataAfterFetch = function(Groups, response, options) {
    App.Trees.GroupTree.treeBuild(App.Collections.Groups.models);
    
    $$('ingrid_groupframe').load('GroupData->load');
    $$('slicegroups').load('GroupData->load');
  };

  var showTaskDataAfterFetch = function(Tasks, response, options) {
    App.Trees.TaskTree.treeBuild(App.Collections.Tasks.models);
    
    $$('ingrid_taskframe').load('TaskData->load'); //!!!!!!!!!!!!!!!!!!!!!
  };

  //***************************************************************************
  //INTERFACE MANIPULATION
  var interfaceSelector = function() {
    //если пользователь залогинился
  	if(App.User.get('usrLogged')) {
  	  //Отрисовка интерфейса в зависимости от выбранного сегмента
  	  showInterface(true);
  	  switch(App.User.get('thisSegment')) {
        case 'users':
       	  $$("userframe").showProgress({
            type:"icon",
            delay:500
          });
  
          App.User.url = '/api/users/' + App.User.get('id');
          App.User.fetch({ success: showUserDataAfterFetch, silent:true });
  		        
          break;
        case 'groups':
          App.Collections.Groups.fetch({ success: showGroupDataAfterFetch });
          $$('groupframe').show();
          break;
        case 'tasks':
          App.Collections.Tasks.fetch({ success: showTaskDataAfterFetch });
          $$('taskframe').show();
          break;
        case 'templates':
          // code
          break;
        case 'finances':
          break;
        case 'process':
          // code
          break;
        case 'files':
          // code
          break;
        case 'notes':
          // code
          break;
  	  }
  	} else {
  	  showInterface(false);
  	  $$('greetingframe').show();
  	} //if(App.User.usrLogged)    
  };
  
  var connectionErrorShow = function(err) {
    if(err.status === 434) {
      defaultState();
      App.Router.navigate('', {trigger: true});
    }
    webix.message({type:"error", text:err.responseText});
  };

  //***************************************************************************
  //INIT FUNCTIONs
  var UserModelInit = function() {
    //Инициализируем глобальный объект пользователя со всеми настройками приложения
  	App.User = new App.Models.User();
  	
  	//Привязываем события которые будут обрабатываться User model
  	App.User.on('change:thisSegment', function() {
  	});
  
  	App.User.on('change:thisTry', function() {
  	  //App.Router.navigate('home', {trigger:true} );
  	});
  	
  	App.User.on('change:this_ingrid_groupframe_ItemSelected', function() {
  	  //console.log(App.User.get('this_ingrid_groupframe_ItemSelected') + " item select");
  	});
  	
    App.User.on('change', function(eventName) {
      App.User.save(App.User.changedAttributes());
    });  	
  };
  
  var GroupModelInit = function() {
  	App.Trees.GroupTree = new treeManager();
    
  	App.Collections.Groups = new collectionGroups();
  
  	App.Collections.Groups.on('add', function(grp) {
  	  App.Trees.GroupTree.treeAdd(grp);
  	});
  	
  	App.Collections.Groups.on('remove', function(ind) {
  	  App.Trees.GroupTree.treeRemove(ind);
  	});
  
    App.Collections.Groups.on('change', function(model, options) {
      App.Trees.GroupTree.treeChange(model);
      model.save();
    });
    
    App.Collections.Groups.on('move', function(currentPosId, newPosId, parentId) {
      App.Trees.GroupTree.move(currentPosId, newPosId, parentId);
    });
  };
  
  var TaskModelInit = function() {
    App.Trees.TaskTree = new treeManager();
    
    App.Collections.Tasks = new collectionTasks();
    
    App.Collections.Tasks.on('add', function(tsk) {
      App.Trees.TaskTree.treeAdd(tsk);
    });
    
  	App.Collections.Tasks.on('remove', function(ind) {
  	  App.Trees.TaskTree.treeRemove(ind);
  	});
  
    App.Collections.Tasks.on('change', function(model, options) {
      App.Trees.TaskTree.treeChange(model);
      model.save();
    });
    
    App.Collections.Tasks.on('move', function(currentPosId, newPosId, parentId) {
      App.Trees.TaskTree.move(currentPosId, newPosId, parentId);
    });    
  };
  
  var defaultState = function() {
    delete App.User;
    UserModelInit();
      
    delete App.Trees.GroupTree;
    delete App.Collections.Groups;
    GroupModelInit();
    
    delete App.Trees.TaskTree;
    delete App.Collections.Tasks;
    TaskModelInit();
    
    $$('ingrid_taskframe').clearAll();
    
    $$('ingrid_groupframe').clearAll();
    $$('slicegroups').clearAll();
    
    $$('mnuSegments').setValue(1);
  };
  
  //***************************************************************************
  //TREE MANAGER
  //объект организует работу с деревьями, для того что бы линейную бэкбоновскую коллекцию
  //разворачивать в древовидную структуру и выводить в webix-овые вьюхи
	var treeManager = function (collection) {
	  //древовидный массив
	  var tree = [];
	  var views = [];

    //рекурсивный перебор
    var treeRecursively = function(branch, list) {
      if (typeof branch === 'undefined') return null;
      var tr = [];
      for(var i=0; i<branch.length; i++)      
      {
          branch[i].data = treeRecursively(list[ branch[i].id ], list);
          tr.push(branch[i]);
      }
      return tr;
    };

    //функция рекурсивного обхода дерева, корень дерева представлен, как branch
    //ветка дерева содержится в массиве data корня branch т.е. branch->data[branch->data[branch->data]] и т.д.
    var recursively = function(branch, element, oper) {
      //проверка на то что корень является данными типа - объект
      if (typeof branch === 'undefined') return false;
      //проверка на то что корень не обнулен
      if (branch === null) return false;
      
      //Если родитель корневой элемент, то добавим в корень
      if ((oper === 'add') && (element.parent_id === 0)) {
        branch.push(element);
        return true;        
      } 

      for (var i = 0; i<branch.length; i++) {
        if (branch[i] === null) continue;
        
        if (oper === 'add') {
          if (element.parent_id === branch[i].id) {
            if ((branch[i].data === null) || (typeof branch[i].data === 'undefined')) {
              branch[i].data = [];
            }
            branch[i].data.push(element);
            return true;
          } else {
            if(recursively(branch[i].data, element, oper)) { return true }
          }
        } else {
          if (element.id === branch[i].id) {
            //var deletedElements = this.models.splice(delElementIndex, 1); ПОПРОБУЙ
            branch[i] = null;
            //delete branch[i];
            return true;
          }
          else
          {
            if(recursively(branch[i].data, element, oper)) { return true }
          }
        }
      }
    };

    this.treeBuild = function(collection) {
	    //преобразуем в линейный массив бэкбоновскую коллекцию (разворачиваем атрибуты объекта)
      var maplist = collection.map(function(object) { return object.attributes });
      if(maplist.length > 0) {
        //сгруппируем элементы массива по родителю
        var list = _.groupBy(maplist, 'parent_id');
        //рекурсивно перебирая сгруппированный массив построим дерево
        tree = treeRecursively(list[0], list);
      } else {
        tree = [];
      }
    };
    
    //добавление элемента в дерево, автоматическое обновление элементов во вьюхах из массива views
    this.treeAdd = function(element) {
      var result = recursively(tree, webix.copy(element.attributes), 'add');
      if(result) {
        //var currentItem = views[0].getItem(element.attributes.parent_id);
        //views[0].data.sync(tree);
        for (var i = views.length; i--; ) {
          //var insertIndex = tree.getIndexById(element.attributes.parent_id);
          views[i].add(webix.copy(element.attributes), -1, element.attributes.parent_id);
          views[i].refresh();
        }
      }
    };
    
    this.treeRemove = function(element) {
      var result = recursively(tree, element.attributes, 'delete');
      if(result) {
        for (var i = views.length; i--; ) {
          views[i].remove(element.attributes.id);
          views[i].refresh();
        }
      }
    };
    
    this.treeChange = function(element) {
      for (var i = views.length; i--; ) {
        var record = views[i].getItem(element.get('id'));
        var chgAtr = element.changedAttributes();
        var keysArr = _.keys(chgAtr);
        var valuesArr = _.values(chgAtr);
        for (var j = keysArr.length; j--; ) {
          record[keysArr[j]] = valuesArr[j];
        }
        views[i].refresh();
      }
    };
    
    this.move = function(currentPosId, newPosId, parentId) {
      for (var i = views.length; i--; ) {
        //var newPosIndex = views[i].getBranchIndex(newPosId, views[i].getParentId(newPosId));
        //views[i].move(currentPosId, newPosIndex, null, { parent: views[i].getParentId(newPosId) });
        //views[i].refresh();
        var newPosIndex = views[i].getBranchIndex(newPosId, parentId);
        views[i].move(currentPosId, newPosIndex, null, { parent: parentId });
        views[i].refresh();
      }      
    };
    
    //добавление вьюхи в массив для датабиндинга
    this.viewsAdd = function(view) {
      if (typeof view === 'object')
      {
        //добавим в массив, если нет такой
        if(views.indexOf(view) === -1) {
          views.push(view);
          
          //обновим вновь добавленную вьюху информцией из дерева
          view.clearAll();
          view.parse(JSON.stringify(tree));
        }
      }
    };
    
    //удаление вьюхи из массива датабиндинга
    this.viewsDelete = function(view) {
      console.log('view delete');
    };
    
    //если при создании объекта передан не пустой параметр, то формируется дерево
	  if (typeof collection !== 'undefined')
	  {
	    this.treeBuild(collection);
	  }
  };

  //_.extend(App.Collections.Groups, Backbone.Events);
  UserModelInit();
  GroupModelInit();
  TaskModelInit();

  //вебикс конфигурация основного окна загруженная в экземпляр объекта вебиксового менеджера окон
  //описание внизу модуля
  var masterframe = new webix.ui({
    id:"masterframe",
    rows:[App.Frame.headerframe, 
      { cols: [App.Frame.leftframe, App.Frame.centralframe,  App.Frame.userlist, App.Frame.rightframe] }
    ]
  });

  webix.extend($$("userframe"), webix.ProgressBar);
  
  $$("leftframe").hide();
  $$("rightframe").hide();
  $$("userlist").hide();
  
  webix.UIManager.addHotKey('enter', function() { 
    if($$('registerframe').isVisible()) {
      App.Func.Register();
    } else if($$('loginframe').isVisible()) {
      App.Func.Login();
    }
  });
  
  $$('ingrid_groupframe').attachEvent('onAfterEditStart', function(id) {
    App.User.set({'this_ingrid_groupframe_ItemEdited': id}, {silent: true});
  });

  $$('ingrid_groupframe').attachEvent('onAfterEditStop', function(state, editor, ignoreUpdate) {
    var ItemEdited = App.User.get('this_ingrid_groupframe_ItemEdited');
    var ItemSelected = App.User.get('this_ingrid_groupframe_ItemSelected');
    if (editor.column === 'name') {
      if(ItemEdited != ItemSelected) {
        this.getItem(ItemEdited).name = state.old;
        this.updateItem(ItemEdited);
        App.User.set({'this_ingrid_groupframe_ItemEdited': null}, {silent: true});
      } else {
        var selectGroup = App.Collections.Groups.get(App.User.get('this_ingrid_groupframe_ItemEdited'));
        selectGroup.set({ 'name': state.value });
      }
    }
  });
  
  $$('ingrid_taskframe').attachEvent('onAfterEditStart', function(id) {
    App.User.set({'this_ingrid_taskframe_ItemEdited': id}, {silent: true});
  });

  $$('ingrid_taskframe').attachEvent('onAfterEditStop', function(state, editor, ignoreUpdate) {
    var ItemEdited = App.User.get('this_ingrid_taskframe_ItemEdited');
    var ItemSelected = App.User.get('this_ingrid_taskframe_ItemSelected');
    if (editor.column === 'name') {
      if(ItemEdited != ItemSelected) {
        this.getItem(ItemEdited).name = state.old;
        this.updateItem(ItemEdited);
        App.User.set({'this_ingrid_taskframe_ItemEdited': null}, {silent: true});
      } else {
        var selectTask = App.Collections.Tasks.get(App.User.get('this_ingrid_taskframe_ItemEdited'));
        selectTask.set({ 'name': state.value });
      }
    }
  });
  
  showInterface(false);

  webix.i18n.parseFormatDate = webix.Date.strToDate("%Y/%m/%d");
  webix.event(window, "resize", function() { masterframe.adjust(); });
  Backbone.history.start({pushState: true, root: "/"});
});