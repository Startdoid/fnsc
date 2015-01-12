//блок, который исполнит вебикс когда все загрузит
var implementFunction = (function() {
  var App = window.App;
  var webix = window.webix;
  var Backbone = window.Backbone;
  
  App.State = {
    $init: function() {
      //this.defaultState             = true;
      this.segment                  = 'user';
      this.group                    = 0;
      this.groupstable_ItemSelected = 0;
      this.groupstable_ItemEdited   = null;
      this.tasktable_ItemSelected   = 0;
      this.tasktable_ItemEdited     = null;
      this.serverRoute              = '';
      
      if(this.groupTreeManager != null) { delete this.groupTreeManager; this.groupTreeManager = null; }
      this.groupTreeManager = new treeManager();
      
      if(this.taskTreeManager != null) { delete this.taskTreeManager; this.taskTreeManager = null; }
      this.taskTreeManager = new treeManager();
      
      if(this.user != null) { delete this.user; this.user = null; }
      this.user = this.userModelInit();
      
      if(this.currentUser != null) { delete this.currentUser; this.currentUser = null; }
      this.currentUser = this.userModelInit();
      
      if(this.groups != null) { delete this.groups; this.groups = null; }
      this.groups = this.groupsModelInit();

      if(this.tasks != null) { delete this.tasks; this.tasks = null; }
      this.tasks = this.tasksModelInit();
    },
    segmentChange: function () {
		  if(this.user.get('id') === 0) {
        var promise = webix.ajax().get('api/logged', {}, interfaceSelector);
	        
        promise.then(function(realdata){}).fail(function(err) {
          connectionErrorShow(err);
        });
		  } else {
		    interfaceSelector('null');
		  }

    },
    userModelInit: function() {
      //Инициализируем глобальный объект пользователя со всеми настройками приложения
      var user = new App.Models.User();
  	  user.on('change:thisTry', function() { });
      user.on('change', function(eventName) { this.save(this.changedAttributes()); }); ///проверить вызов THIS!!!!!!!!!!!!!!!!!!!!!!!!!!!
      
      return user;
    },
    groupsModelInit: function() {
  	  var groups = new collectionGroups();
  
    	groups.on('add', function(grp) {
    	  App.State.groupTreeManager.treeAdd(grp);
    	});
  	
    	groups.on('remove', function(ind) {
    	  App.State.groupTreeManager.treeRemove(ind);
    	});
  
      groups.on('change', function(model, options) {
        App.State.groupTreeManager.treeChange(model);
        model.save(); 
      });
      
      groups.on('move', function(currentPosId, newPosId, parentId) {
        App.State.groupTreeManager.move(currentPosId, newPosId, parentId);
      });
      
      return groups;
    },
    tasksModelInit: function() {
      var tasks = new collectionTasks();
      
      tasks.on('add', function(tsk) {
        App.State.taskTreeManager.treeAdd(tsk);
      });
      
    	tasks.on('remove', function(ind) {
    	  App.State.taskTreeManager.treeRemove(ind);
    	});
    
      tasks.on('change', function(model, options) {
        App.State.taskTreeManager.treeChange(model);
        model.save();
      });
      
      tasks.on('move', function(currentPosId, newPosId, parentId) {
        App.State.taskTreeManager.move(currentPosId, newPosId, parentId);
      });
      
      return tasks;
    },
    user              : null,     //Пользователь системы
    currentUser       : null,     //текущий пользователь, выбранный в списке пользователей или друзей
    groupTreeManager  : null,     //менеджер дерева для групп
    taskTreeManager   : null,     //менеджер дерева для задач
    groups            : null,     //коллекция групп пользователя системы
    tasks             : null,     //коллекция задач пользователя системы
    serverRoute       : '',
    //defaultState      : true,     //флаг того, что состояние по-умолчанию сброшено
    segment           : 'user',   //user, users, groups, tasks, templates, finances, process, files, notes
    group             : 0,        //Выбранная группа, по которой фильтруются задачи
    //флаги состояния приложения this_view_action
    groupstable_ItemSelected  : 0,    //выделенный элемент в области конструктора групп
    groupstable_ItemEdited    : null, //редактируемый элемент в области конструктора групп
    tasktable_ItemSelected    : 0,    //выделенный элемент в области конструктора задач
    tasktable_ItemEdited      : null  //редактируемый элемент в области конструктора задач
  };
  
  var dataCountry = new webix.DataCollection({ 
    url:'api/country'
  });

  var dataCity = new webix.DataCollection({
    url:'api/city'
  });
  
  var dataFamilyStatus = new webix.DataCollection({
    url:'api/familystatus'
  });

  webix.ui({
		id:'suggestCountry', view:'suggest', data:dataCountry
	});
	
	webix.ui({
	  id:'suggestCity', view:'suggest', data:dataCity
	});
	
	webix.ui({
	  id:'suggestFamilyStatus', view:'suggest', data:dataFamilyStatus
	});
	
	webix.proxy.GroupData = {
    $proxy: true,
    init: function() {
      //webix.extend(this, webix.proxy.offline);
    },
    load: function(view, callback) {
      //Добавляем id вебиксовых вьюх для синхронизации с данными
  	  //важно добавлять уже после создания всех вьюх, иначе будут добавлены пустые объекты
      App.State.groupTreeManager.viewsAdd($$(view.config.id));
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
      App.State.taskTreeManager.viewsAdd($$(view.config.id));
    }
  };

  //создадим экземпляр бакбоновского роутера, который будет управлять навигацией на сайте
	App.Router = new (Backbone.Router.extend({
	  //слева роут, косая в скобках означает, что роут может быть как с косой чертой на конце, так и без нее
	  //справа функция, которая вызовется для соответствующего роута
		routes:{
			'login(/)':'login',
			'logout(/)':'logout',
			'register(/)':'register',
			'groups(/)':'groups',
			'tasks(/)':'tasks',
			'user(/)':'user',
			'users(/)':'users',
			'home(/)':'home',
			'':'index'
		},
		//home выбрасывает в корень
		home:function() {
		  this.navigate('', {trigger: true});
		},
		//корень приложения
		index:function() {
		  App.State.segmentChange();
		},
		groups:function() {
		  App.State.segment = 'groups';
		  App.State.segmentChange();
		},
		tasks:function() {
		  App.State.segment = 'tasks';
		  App.State.segmentChange();
		},
		users:function() {
		  App.State.segment = 'users';
		  App.State.segmentChange();
		},
		user:function() {
		  App.State.segment = 'user';
		  App.State.segmentChange();
		},
		login:function() {
		  if(!App.State.user.get('usrLogged')) {
		    $$('frameCentral_Login').show();
		  } else {
		    App.Router.navigate('user', {trigger: true});
		  }
		},
		logout:function() {
      var promise = webix.ajax().put('api/logout', { id: App.State.user.id });
	        
      promise.then(function(realdata) {
        App.State.user.set('usrLogged', false);
        App.Router.navigate('', {trigger: true});
      }).fail(function(err){
        connectionErrorShow(err);
      });
		},
		register:function() {
		  if(!App.State.user.get('usrLogged')) {
		    $$('frameCentral_Register').show();
		  } else {
		    App.Router.navigate('user', {trigger: true});
		  }
		}
	}))();
	
	//***************************************************************************
	//AFTER FETCH FUNCTIONs
  var showUserDataAfterFetch = function(User, response, options) {
    $$('tabviewCentral_User').show();
    $$("tabviewCentral_User").hideProgress();
    
    if($$("dataviewCentral_Users").getSelectedId() === '') {
      $$('dataviewCentral_Users').select($$('dataviewCentral_Users').getFirstId());
      App.Func.fillUserAttributes(App.State.user.get('id'));
    } else if ($$("dataviewCentral_Users").getSelectedId() === $$('dataviewCentral_Users').getFirstId()) {
      App.Func.fillUserAttributes(App.State.user.get('id'));
    } else {
      App.Func.fillUserAttributes($$("dataviewCentral_Users").getSelectedId());
    }
    
    App.State.groups.fetch({ success: showGroupDataAfterFetch });
  };
	
  var showGroupDataAfterFetch = function(Groups, response, options) {
    App.State.groupTreeManager.treeBuild(App.State.groups.models);
    
    $$('treetableMyGroups_Groupstable').load('GroupData->load');
  };

  var showTaskDataAfterFetch = function(Tasks, response, options) {
    App.State.taskTreeManager.treeBuild(App.State.tasks.models);
    
    $$('treetableMytasks_Tasktable').load('TaskData->load'); //!!!!!!!!!!!!!!!!!!!!!
  };

  //***************************************************************************
  //INTERFACE MANIPULATION
  var interfaceSelector = function(text, data) {
    var user = App.State.user;
    if(text === 'null') {
      //user.set({ 'usrLogged': false }, { silent: true });
    } else {
      user.set({ 'usrLogged': data.json().usrLogged }, { silent: true });
      user.set({ 'id': data.json().id }, { silent: true });
      
      //App.State.serverRoute = data.json().serverRoute;
      if(data.json().serverRoute !== '') {
        return App.Router.navigate(data.json().serverRoute, {trigger: true});
      }
    }

    //если пользователь залогинился
  	if(user.get('usrLogged')) {
  	  //Выставим флаг того, что состояние по-умолчанию сброшено
  	  //App.State.defaultState = false;
  	  console.log('interfaceSelector: user logged');
  	  
  	  //Отрисовка интерфейса в зависимости от выбранного сегмента
  	  $$('toolbarHeader').enable();
  	  $$('toolbarHeader').refresh();
  	  
  	  switch(App.State.segment) {
        case 'user':
          console.log('interfaceSelector: user');
       	  $$('tabviewCentral_User').showProgress({
            type:'icon',
            delay:500
          });
  
          //Надо подумать как решить этот вопрос.... при выделении пункта меню снова вызывается роутер
  		    if('listitemSegmentsSelector_MyProfile' != $$('listSegments_SegmentsSelector').getSelectedId()) {
            $$('listSegments_SegmentsSelector').select('listitemSegmentsSelector_MyProfile');
	  	    }
	  	    
	  	    $$('scrollviewRight_UserFilter').show();
	  	    
          user.url = '/api/users/' + user.get('id');
          user.fetch({ success: showUserDataAfterFetch, silent:true });
  		    
          break;  	    
        case 'users':
          console.log('interfaceSelector: users');
          if('listitemSegmentsSelector_AllUsers' != $$('listSegments_SegmentsSelector').getSelectedId()) {
            $$('listSegments_SegmentsSelector').select('listitemSegmentsSelector_AllUsers');
          }
          
          $$('frameCentral_Users').show();
          $$('scrollviewRight_UsersFilter').show();
          
          break;
        case 'groups':
          if('listitemSegmentsSelector_AllGroups' != $$('listSegments_SegmentsSelector').getSelectedId()) {
            $$('listSegments_SegmentsSelector').select('listitemSegmentsSelector_AllGroups');
          }

          App.State.groups.fetch({ success: showGroupDataAfterFetch });
          
          $$('tabviewCentral_Groups').show();
          $$('scrollviewRight_GroupsFilter').show();
          
          break;
        case 'tasks':
          $$('listSegments_SegmentsSelector').select('listitemSegmentsSelector_AllTasks');
          
          App.State.tasks.fetch({ success: showTaskDataAfterFetch });
          $$('tabviewCentral_Task').show();
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
  	  //если флаг состояния по-умолчанию не сброшен, то произведен сброс всех системных параметров и
  	  //очистку всех значений в памяти, приведем систем в порядок начальных значений, флаг необходим
  	  //для исключения ситуаций повторных сбросов системы
  	  //if(!App.State.defaultState) {
  	  console.log('interfaceSelector: user not logged');
  	    App.State.$init();
  	    offState();
  	  //}
  	  $$('frameCentral_Greeting').show();
  	} //if(App.State.user.usrLogged)    
  };
  
  var connectionErrorShow = function(err) {
    if(err.status === 434) {
      //defaultState();
      //App.Router.navigate('', {trigger: true});
    }
    webix.message({type:"error", text:err.responseText});
  };

  App.State.$init();

  //вебикс конфигурация основного окна загруженная в экземпляр объекта вебиксового менеджера окон
  var frameBase = new webix.ui({
    id:"frameBase",
    rows:[App.Frame.toolbarHeader, 
      { cols: [App.Frame.multiviewLeft, App.Frame.multiviewCentral, App.Frame.multiviewRight] }
    ]
  });

  var offState = function() {
    $$("multiviewLeft").hide();
    $$("multiviewRight").hide();

    $$('treetableMytasks_Tasktable').clearAll();
    $$('treetableMyGroups_Groupstable').clearAll();
    
    $$('toggleHeader_Menu').setValue(0);
    $$('toggleHeader_Options').setValue(0);
    
    $$("toolbarHeader").disable();
    $$("toolbarHeader").refresh();
  };

  offState();

  webix.extend($$("tabviewCentral_User"), webix.ProgressBar);

  webix.UIManager.addHotKey('enter', function() { 
    if($$('frameCentral_Register').isVisible()) {
      App.Func.Register();
    } else if($$('frameCentral_Login').isVisible()) {
      App.Func.Login();
    }
  });

  //************************************************************************************************
  //Обработчики событий
  $$('treetableMyGroups_Groupstable').attachEvent('onAfterEditStart', function(id) {
    App.State.groupstable_ItemEdited = id;
  });

  $$('treetableMyGroups_Groupstable').attachEvent('onAfterEditStop', function(state, editor, ignoreUpdate) {
    var ItemEdited = App.State.groupstable_ItemEdited;
    var ItemSelected = App.State.groupstable_ItemSelected;
    if (editor.column === 'name') {
      if(ItemEdited != ItemSelected) {
        this.getItem(ItemEdited).name = state.old;
        this.updateItem(ItemEdited);
        App.State.groupstable_ItemEdited = null;
      } else {
        var selectGroup = App.State.groups.get(App.State.groupstable_ItemEdited);
        selectGroup.set({ 'name': state.value });
      }
    }
  });
  
  $$('treetableMytasks_Tasktable').attachEvent('onAfterEditStart', function(id) {
    App.State.tasktable_ItemEdited = id;
  });

  $$('treetableMytasks_Tasktable').attachEvent('onAfterEditStop', function(state, editor, ignoreUpdate) {
    var ItemEdited = App.State.tasktable_ItemEdited;
    var ItemSelected = App.State.tasktable_ItemSelected;
    if (editor.column === 'name') {
      if(ItemEdited != ItemSelected) {
        this.getItem(ItemEdited).name = state.old;
        this.updateItem(ItemEdited);
        App.State.tasktable_ItemEdited = null;
      } else {
        var selectTask = App.State.tasks.get(App.State.tasktable_ItemEdited);
        selectTask.set({ 'name': state.value });
      }
    }
  });
  
  webix.i18n.parseFormatDate = webix.Date.strToDate("%Y/%m/%d");
  webix.event(window, "resize", function() { frameBase.adjust(); });
  //Backbone.history.start({pushState: true, root: "/"});
  Backbone.history.start( { pushState: true } );
});