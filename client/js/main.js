//блок, который исполнит вебикс когда все загрузит
var implementFunction = (function() {
  var App = window.App;
  var webix = window.webix;
  var Backbone = window.Backbone;
  
  App.State = {
    user              : null,     //Пользователь системы
    viewedUser        : null,     //текущий пользователь, выбранный в списке пользователей или друзей
    groupTreeManager  : null,     //менеджер дерева для групп
    taskTreeManager   : null,     //менеджер дерева для задач
    groups            : null,     //коллекция групп пользователя системы
    tasks             : null,     //коллекция задач пользователя системы
    serverRoute       : '',
    clientRoute       : '',
    segment           : '',   //user, users, groups, tasks, templates, finances, process, files, notes
    segmentUserId     : null,
    usrCRC            : null,
    group             : 0,        //Выбранная группа, по которой фильтруются задачи
    userlistFilter    : { userId: 0 },
    //флаги состояния приложения this_view_action
    groupstable_ItemSelected  : 0,    //выделенный элемент в области конструктора групп
    groupstable_ItemEdited    : null, //редактируемый элемент в области конструктора групп
    tasktable_ItemSelected    : 0,    //выделенный элемент в области конструктора задач
    tasktable_ItemEdited      : null,  //редактируемый элемент в области конструктора задач
    $init: function() {
      this.segment                  = '';
      this.group                    = 0;
      this.groupstable_ItemSelected = 0;
      this.groupstable_ItemEdited   = null;
      this.tasktable_ItemSelected   = 0;
      this.tasktable_ItemEdited     = null;
      this.serverRoute              = '';
      this.segmentUserId            = null;
      this.usrCRC                   = null;
      
      if(this.groupTreeManager != null) { delete this.groupTreeManager; this.groupTreeManager = null; }
      this.groupTreeManager = new treeManager();
      
      if(this.taskTreeManager != null) { delete this.taskTreeManager; this.taskTreeManager = null; }
      this.taskTreeManager = new treeManager();
      
      if(this.user != null) { delete this.user; this.user = null; }
      this.user = this.userModelInit();
      
      if(this.viewedUser != null) { delete this.viewedUser; this.viewedUser = null; }
      this.viewedUser = this.userModelInit();
      
      if(this.groups != null) { delete this.groups; this.groups = null; }
      this.groups = this.groupsModelInit();

      if(this.tasks != null) { delete this.tasks; this.tasks = null; }
      this.tasks = this.tasksModelInit();
    },
    $srvUrlChanged: function(text, data, XmlHttpRequest) {
      var sr = App.State.serverRoute;
      App.State.serverRoute = '';
      if(sr === App.State.clientRoute) {
        segmentSelector();
      } else {
        App.Router.navigate(sr, {trigger: true});
      }
    },
    $userSuccess: function(model, response, options) {
  	  //при опросе состояния сервера мы получили url, который пользователь ввел отправляя запрос на сервер
  	  //но клиентское приложение имеет самостоятельный роут, поэтому мы должны сообщить url пользователя этому роуту
  	  //и если пользователь авторизирован, перейти по этому урлу, после чего сообщить серверу, что урл обработан
  	  
      if(App.State.serverRoute !== '') {
    	  var promise = webix.ajax().post('api/v1/state', { serverRoute: '' }, App.State.$srvUrlChanged);
  	        
        promise.then(function(){}).fail(function(err) {
          webix.message({type: 'error', text: err.responseText});
        });
      } else {
        if(App.State.segment === '') {
          App.Router.navigate('id' + model.id, {trigger: true});
        } else {
          segmentSelector();
        }
      }
    },
    $userError: function(model, xhr, options) {
      App.State.user.set({'usrLogged': false}, {silent: true});
      segmentSelector();
      //заглушечка
    },
    $loadState: function(text, data) {
      //обработка состояния полученного с сервера
      
      //фиксируем полученный от пользователя URL на сервере, после обработки состояния приложение
      //перейдет по данному URL
      App.State.serverRoute = data.json().serverRoute;
      
      //(сравниваем авторизации на клиенте и сервере), (хэш суммы пользователя на клиенте и сервере)
      if(data.json().usrLogged) {
        //Если пользователь авторизирован на сервере
        
        //(сравниваем авторизации на клиенте и сервере), (хэш суммы пользователя на клиенте и сервере)
        if((App.State.user.get('usrLogged') !== data.json().usrLogged) || (App.State.usrCRC !== data.json().usrCRC)) {
          App.State.user.set({'usrLogged': true}, {silent: true});
		      App.State.user.url = '/api/v1/users/' + data.json().id;
          App.State.user.fetch({ success: App.State.$userSuccess, error: App.State.$userError, silent:true });
          
          return;
        }
        
        segmentSelector();
      } else {
        //Если пользователь не авторизирован на сервере
        if(App.State.user.get('usrLogged')) {
          App.State.user.set({'usrLogged': false}, {silent: true});
        }
        segmentSelector();
      }
    },
    $autonomeState: function(err) {
      webix.message(err);
      //заглушечка
    },
    segmentChange: function() {
      //при смене сегментов происходит запрос с сервера о состоянии приложения
      //в состоянии содержится информация об измененных объектах, о состоянии пользователя и т.п.
      //и url который ввел пользователь
      
      //если ответ от сервера получен, то переходим к функции обработки состояния
      var promise = webix.ajax().get('api/v1/state', {}, this.$loadState);
      //если ответ от сервера не получен, то переходим в автономный режим
      promise.then(function(realdata){}).fail(this.$autonomeState);
    },
    userModelInit: function() {
      //Инициализируем глобальный объект пользователя со всеми настройками приложения
      var user = new App.Models.User();
  	  user.on('change:thisTry', function() { });
      user.on('change', function(model, options) { 
        model.save(model.changedAttributes());
      });
      user.on('error', function(model, xhr, options) {});
      
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
    }
  };
  
  var dataCountry = new webix.DataCollection({ 
    url:'api/v1/country'
  });

  var dataCity = new webix.DataCollection({
    url:'api/v1/city'
  });
  
  var dataFamilyStatus = new webix.DataCollection({
    url:'api/v1/familystatus'
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
			'id:id(/)':'user',
			'users?id=:id(/)':'userUsers',
			'users(/)':'users',
			'home(/)':'home',
			'':'index'
		},
		//home выбрасывает в корень
		home:function() {
		  App.State.clientRoute = '/home';
		  this.navigate('', {trigger: true});
		},
		//корень приложения
		index:function() {
		  App.State.clientRoute = '';
		  App.State.segmentChange();
		},
		groups:function() {
		  App.State.clientRoute = '/groups';
		  App.State.segment = 'groups';
		  App.State.segmentChange();
		},
		tasks:function() {
		  App.State.clientRoute = '/tasks';
		  App.State.segment = 'tasks';
		  App.State.segmentChange();
		},
		users:function() {
		  App.State.clientRoute = '/users';
		  App.State.userlistFilter.userId = 0;
		  App.State.segment = 'users';
		  App.State.segmentChange();
		},
		user:function(id) {
		  App.State.clientRoute = '/id' + id;
		  App.State.segment = 'user';
		  App.State.segmentUserId = id;
		  App.State.segmentChange();
		},
		userUsers:function(id) {
		  App.State.clientRoute = '/id' + id + '/users';
		  App.State.segment = 'users';
		  App.State.userlistFilter.userId = id;
		  App.State.segmentUserId = id;
		  App.State.segmentChange();
		},
		login:function() {
		  App.State.clientRoute = '/login';
		  if(!App.State.user.get('usrLogged')) {
		    $$('frameCentral_Login').show();
        $$('frameCentralLogin_authenticateError').setValues({src:''});

		    $$('buttonAutorisationLogin').disable();
		    $$('buttonAutorisationRegister').enable();
		  } else {
		    App.Router.navigate('id' + App.State.user.get('id'), {trigger: true});
		  }
		},
		logout:function() {
		  App.State.clientRoute = '/logout';
      var promise = webix.ajax().put('api/v1/logout', { id: App.State.user.get('id') });
	        
      promise.then(function(realdata) {
        App.State.user.set({'usrLogged': false}, {silent:true});
        App.Router.navigate('', {trigger: true});
      }).fail(function(err){
        connectionErrorShow(err);
      });
		},
		register:function() {
		  App.State.clientRoute = '/register';
		  if(!App.State.user.get('usrLogged')) {
		    $$('frameCentral_Register').show();
		    $$('frameCentralRegister_authenticateError').setValues({src:''});
		    
		    $$('buttonAutorisationLogin').enable();
		    $$('buttonAutorisationRegister').disable();
		  } else {
		    App.Router.navigate('id' + App.State.user.get('id'), {trigger: true});
		  }
		}
	}))();
	
	//***************************************************************************
	//AFTER FETCH FUNCTIONs
	
	//Вывод данных пользовательского профиля во фрейм, после успешного получения с сервера (callback)
  var showUserDataAfterSuccess = function(model, response, options) {
    $$('tabviewCentral_User').show();
    $$('tabviewCentral_User').hideProgress();
    
    $$('scrollviewRight_UserFilter').show();
    
    //если отображается пользователь, то выводятся поля ввода, в противном случае только информационные
    if(App.State.user.get('id') === App.State.viewedUser.get('id')) {
      //В основном меню выделим пункт профиля
      if('listitemSegmentsSelector_MyProfile' != $$('listSegments_SegmentsSelector').getSelectedId()) {
        $$('listSegments_SegmentsSelector').blockEvent(); //Блокируем срабатывание события при программном выборе пункта меню
        $$('listSegments_SegmentsSelector').select('listitemSegmentsSelector_MyProfile'); //Программно выбираем пункт меню
        $$('listSegments_SegmentsSelector').unblockEvent();
      }      
      
      $$('listProfile_UserAttributesSelector').unselectAll();
      $$('frameProfile_user').show();
      App.Func.loadUserPermission();        //Загрузим настройки в панель настроек доступа своего профиля
    } else {
      $$('listProfile_viewedUserAttributesSelector').unselectAll();
      $$('listSegments_SegmentsSelector').unselectAll();
      
      $$('frameProfile_viewedUser').show();                                   //Показываем фрейм с данными чужого профиля
      if($$('multiviewRight').isVisible()) $$('multiviewRight').hide();       //Если панель настроек доступа видима, то скроем
      if($$('toggleHeader_Options').getValue()) $$('toggleHeader_Options').setValue(0); //Если кнопка настроке доступа нажата, то отожмем
      $$('toggleHeader_Options').disable();                                   //Заблокируем возможность нажимать кнопку открытия окна настроек доступа
    }
    
    App.Func.loadUserAttributes();
    
    //App.State.groups.fetch({ success: showGroupDataAfterFetch });
  };
	
	var showUserDataAfterError = function(model, xhr, options) {
	  //заглушка
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
  //segmentSelector переключает состояние интерфейса в соответствии с теми сегментами, которые были
  //установлены при обратке роутов в backbone App.Router, смена сегментов всегда сопровождается вызовом
  //следующих функций segmengChange()->опрос состояния сервера->segmentSelector()->перерисовка интерфейса
  var segmentSelector = function() {
    var user = App.State.user;
    var viewedUser = App.State.viewedUser;
    
    //если пользователь залогинился (получаем при опросе состояния сервера)
  	if(user.get('usrLogged')) {
  	  if(!$$('toolbarHeader').isVisible()) $$('toolbarHeader').show();
  	  if(!$$('toggleHeader_Options').isEnabled()) $$('toggleHeader_Options').enable();
  	  
  	  //Отрисовка интерфейса в зависимости от выбранного сегмента
  	  switch(App.State.segment) {
        case 'user':
       	  $$('tabviewCentral_User').showProgress({
            type:'icon',
            delay:500
          });
  
          viewedUser.url = '/api/v1/users/' + App.State.segmentUserId;
          viewedUser.fetch({ success: showUserDataAfterSuccess, error: showUserDataAfterError, silent:true });

          break;  	    
        case 'users':
          $$('listSegments_SegmentsSelector').blockEvent(); //Блокируем срабатывание события при программном выборе пункта меню
          if(App.State.userlistFilter.userId === 0) {
            if('listitemSegmentsSelector_AllUsers' != $$('listSegments_SegmentsSelector').getSelectedId()) {
              $$('listSegments_SegmentsSelector').select('listitemSegmentsSelector_AllUsers');
            }
          } else {
            $$('listSegments_SegmentsSelector').unselectAll();
          }
          $$('listSegments_SegmentsSelector').unblockEvent();
          
          $$('dataviewCentral_Users').clearAll();
          $$('dataviewCentral_Users').loadNext(4, 0, null, 'api/v1/userlist');

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
  	  console.log('segmentSelector: user not logged');
	    App.State.$init();
	    offState();
  	  $$('frameCentral_Greeting').show();
  	} //if(App.State.user.usrLogged)    
  };
  
  var connectionErrorShow = function(err) {
    if(err.status === 434) {
      //defaultState();
      //App.Router.navigate('', {trigger: true});
    }
    webix.message({type:'error', text:err.responseText});
  };

  App.State.$init();

  //вебикс конфигурация основного окна загруженная в экземпляр объекта вебиксового менеджера окон
  var frameBase = new webix.ui({
    id:'frameBase',
    rows:[App.Frame.multiviewToolbar, 
      { cols: [App.Frame.multiviewLeft, App.Frame.multiviewCentral, App.Frame.multiviewRight] }
    ]
  });

  var offState = function() {
    $$('multiviewLeft').hide();
    $$('multiviewRight').hide();

    $$('treetableMytasks_Tasktable').clearAll();
    $$('treetableMyGroups_Groupstable').clearAll();
    
    $$('toggleHeader_Menu').setValue(0);
    $$('toggleHeader_Options').setValue(0);
    
    $$('toolbarAutorisation').show();
    $$('buttonAutorisationLogin').enable();
	  $$('buttonAutorisationRegister').enable();
  };

  offState();

  webix.extend($$('tabviewCentral_User'), webix.ProgressBar);

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
  
  var centralUsers_DataRefresh = function(data) {
    $$('dataviewCentral_Users').parse(data);
  };
  
  $$('dataviewCentral_Users').attachEvent('onDataRequest', function(start, count, callback, url) {
    webix.ajax('api/v1/userlist', { start:start, count:count, userId: App.State.userlistFilter.userId }, centralUsers_DataRefresh);
    return false;
  });

  webix.i18n.parseFormatDate = webix.Date.strToDate('%Y/%m/%d');
  webix.event(window, 'resize', function() { frameBase.adjust(); });
  //Backbone.history.start({pushState: true, root: "/"});
  Backbone.history.start( { pushState: true } );
});