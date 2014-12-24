//блок, который исполнит вебикс когда все загрузит
var implementFunction = (function() {
  var App = window.App;
  var webix = window.webix;
  var Backbone = window.Backbone;
  
  App.State = {
    $init: function() {
      this.defaultState             = true;
      this.segment                  = 'user';
      this.group                    = 0;
      this.groupstable_ItemSelected = 0;
      this.groupstable_ItemEdited   = null;
      this.tasktable_ItemSelected   = 0;
      this.tasktable_ItemEdited     = null;
    },
    defaultState      : true,
    segment           : 'user',  //user, users, groups, tasks, templates, finances, process, files, notes
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
		  App.State.segment = 'groups';
		  this.navigate('', {trigger: true});
		},
		tasks:function() {
		  App.State.segment = 'tasks';
		  this.navigate('', {trigger: true});
		},
		users:function() {
		  App.State.segment = 'users';
		  this.navigate('', {trigger: true});
		},
		user:function() {
		  App.State.segment = 'user';
		  this.navigate('', {trigger: true});
		},
		login:function() {
		  if(!App.User.get('usrLogged')) {
		    $$('frameCentral_Login').show();
		  } else {
		    App.Router.navigate('', {trigger: true});
		  }
		},
		logout:function() {
      var promise = webix.ajax().put("api/logout", { id: App.User.id });
	        
      promise.then(function(realdata) {
        App.Router.navigate('', {trigger: true});
      }).fail(function(err){
        connectionErrorShow(err);
      });
		},
		register:function() {
		  if(!App.User.get('usrLogged')) {
		    $$('frameCentral_Register').show();
		  } else {
		    App.Router.navigate('', {trigger: true});
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
      App.Func.fillUserAttributes(App.User.get('id'));
    } else if ($$("dataviewCentral_Users").getSelectedId() === $$('dataviewCentral_Users').getFirstId()) {
      App.Func.fillUserAttributes(App.User.get('id'));
    } else {
      App.Func.fillUserAttributes($$("dataviewCentral_Users").getSelectedId());
    }
    
    App.Collections.Groups.fetch({ success: showGroupDataAfterFetch });
  };
	
  var showGroupDataAfterFetch = function(Groups, response, options) {
    App.Trees.GroupTree.treeBuild(App.Collections.Groups.models);
    
    $$('treetableMyGroups_Groupstable').load('GroupData->load');
  };

  var showTaskDataAfterFetch = function(Tasks, response, options) {
    App.Trees.TaskTree.treeBuild(App.Collections.Tasks.models);
    
    $$('treetableMytasks_Tasktable').load('TaskData->load'); //!!!!!!!!!!!!!!!!!!!!!
  };

  //***************************************************************************
  //INTERFACE MANIPULATION
  var interfaceSelector = function() {
    //если пользователь залогинился
  	if(App.User.get('usrLogged')) {
  	  //Выставим флаг того, что состояние по-умолчанию сброшено
  	  App.State.defaultState = false;
  	  
  	  //Отрисовка интерфейса в зависимости от выбранного сегмента
  	  $$('toolbarHeader').enable();
  	  $$('toolbarHeader').refresh();
  	  
  	  switch(App.State.segment) {
        case 'user':
       	  $$('tabviewCentral_User').showProgress({
            type:'icon',
            delay:500
          });
  
  		    if('listitemSegmentsSelector_MyProfile' != $$('listSegments_SegmentsSelector').getSelectedId()) {
            $$('listSegments_SegmentsSelector').select('listitemSegmentsSelector_MyProfile');
	  	    }
	  	    
	  	    $$('scrollviewRight_UserFilter').show();
	  	    
          App.User.url = '/api/users/' + App.User.get('id');
          App.User.fetch({ success: showUserDataAfterFetch, silent:true });
  		    
          break;  	    
        case 'users':
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

          App.Collections.Groups.fetch({ success: showGroupDataAfterFetch });
          
          $$('tabviewCentral_Groups').show();
          $$('scrollviewRight_GroupsFilter').show();
          
          break;
        case 'tasks':
          $$('listSegments_SegmentsSelector').select('listitemSegmentsSelector_AllTasks');
          
          App.Collections.Tasks.fetch({ success: showTaskDataAfterFetch });
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
  	  if(!App.State.defaultState)
  	    defaultState();
  	  $$('frameCentral_Greeting').show();
  	} //if(App.User.usrLogged)    
  };
  
  var connectionErrorShow = function(err) {
    if(err.status === 434) {
      //defaultState();
      //App.Router.navigate('', {trigger: true});
    }
    webix.message({type:"error", text:err.responseText});
  };

  //***************************************************************************
  //INIT FUNCTIONs
  var UserModelInit = function() {
    //Инициализируем глобальный объект пользователя со всеми настройками приложения
  	App.User = new App.Models.User();
  	
  	App.User.on('change:thisTry', function() {
  	  //App.Router.navigate('home', {trigger:true} );
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
    
    App.State.$init();

    offState();
  };
  
  UserModelInit();
  GroupModelInit();
  TaskModelInit();

  //вебикс конфигурация основного окна загруженная в экземпляр объекта вебиксового менеджера окон
  //описание внизу модуля
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
  }();

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
        var selectGroup = App.Collections.Groups.get(App.State.groupstable_ItemEdited);
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
        var selectTask = App.Collections.Tasks.get(App.State.tasktable_ItemEdited);
        selectTask.set({ 'name': state.value });
      }
    }
  });
  
  webix.i18n.parseFormatDate = webix.Date.strToDate("%Y/%m/%d");
  webix.event(window, "resize", function() { frameBase.adjust(); });
  Backbone.history.start({pushState: true, root: "/"});
});