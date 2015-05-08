//блок, который исполнит вебикс когда все загрузит
var implementFunction = (function() {
  var App = window.App;
  var webix = window.webix;
  var Backbone = window.Backbone;
  
  App.State = {
    _st : [{
      clientRoute : '',
      segment     : '',   //user, users, group, groups, tasks, templates, finances, process, files, notes
      filter      : {}
    }],                   //Стек переходов пользователя по роутам
    _ConstLen_st   : 5,   //Размер стека переходов
    SelectedProfile : {
      id : null,
      type : null,  //myprofile, userprofile, groupprofile, community
      name : null
    },              //Данный атрибут указывает на профиль относительно которого показываются все сегменты
    _ConstLen_lastProfileSegment: 5, //Размер стека последних просмотренных профилей
    user        : null,  //осн. пользователь
    viewedUser  : null,  //текущий пользователь, который просм./редактир. в данный момент
    viewedGroup : null,  //текущая группа, которая просм./редактир. в данный момент
    viewedTask  : null,  //текущая задача, которая просм./редактир. в данный момент
    serverRoute : '',    //роут полученный с сервера
    usrCRC      : null,  //контролная сумма данных пользователя, планирую по ней определять момент обновления данных на клиенте
    init: function() {
      if(this.user != null) { this.user = null; }
      this.user = this.userModelInit();

      if(this.viewedUser != null) { this.viewedUser = null; }
      this.viewedUser = this.userModelInit();

      if(this.viewedGroup != null) { this.viewedGroup = null; }
      this.viewedGroup = this.groupModelInit();
      
      if(this.viewedTask != null) {this.viewedTask = null; }
      this.viewedTask = this.taskModelInit();

      this._st              = [ { clientRoute: '', segment: '' } ];
      this.SelectedProfile  = { id: null, type:null, name:null };
      this.serverRoute      = '';
      this.usrCRC           = null;
    },
    /**
    * setState
    *   Функция ДОБАВЛЯЕТ новые значения в стек состояний State._st. 
    *   Стек ограничен длиной в _ConstLen_st элемента, при привышении этой длины первый элемент стека State._st удаляется.
    *   Если атрибут функции содержит не все атрибуты стека State._st, то новое значение дополняется 
    *   значениям из предыдущего состояния стека
    * Attributes:
    *   state - новое состояние стека
    * Result:
    *****************************************************************************/
    setState: function(state) {
      if (typeof state === 'object') {
        var len = this._st.length;
        if(len > this._ConstLen_st) this._st.shift();
        len = this._st.push({ clientRoute: '', segment: '', filter: {} });
        
          for (var prop in this._st[len - 1]) {
            if(state[prop] === undefined) {
                if(len >= 2)
                    this._st[len - 1][prop] = this._st[len - 2][prop];
                else
                    this._st[len - 1][prop] = null;
            } else {
                this._st[len - 1][prop] = state[prop];
            }
          }
      }
    },
    /**
    * getState
    *   Функция ИЗВЛЕКАЕТ значения из стека состояний State._st. 
    * Attributes:
    *   state - при пустом значении извлекается последний объект стека, 
    *   - при отрицательном числовом значении извлекается предыдущий объект стека на количество 
    *   значений указанных в атрибуте
    *   - если указано строковое значение, то извлекается атрибут объекта стека состояний State.st 
    *   соответствующий этому ключу
    *   step - при отрицательном числовом значении извлекается предыдущий объект стека на количество
    *   значений указанных в атрибуте
    * Result:
    *   объект из стека состояний State._st { clientRoute: '', segment: '' } или значение атрибута 
    *   этого объекта
    *****************************************************************************/
    getState: function(state, step) {
        if(state === undefined) {
            return this._st[this._st.length - 1];
        } else if(typeof state === 'number') {
            return this._st[this._st.length - 1 + state];
        } else if(typeof state === 'string') {
            return this._st[step === undefined ? this._st.length - 1 : this._st.length - 1 + step][state];
        }
        return undefined;
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
  	  
  	  //добавим пользователя в меню профиля сегментов
  	  $$('list_InnerProfile').clearAll();
	    $$('list_InnerProfile').add({ id: 1, name: model.get('username'), segment: 'Мой профиль', type:'myprofile', profile_id:model.get('id') });
	    $$('list_InnerProfile').add({ id: 2, name: 'Сообщество', segment: 'Публичные профили', type:'community' });

			$$('list_lastProfile').clearAll();
  	  $$('list_lastProfile').parse(model.get('lastProfileSegment'));
  	  
  	  if(App.State.SelectedProfile.id === null)
  	    App.State.SelectedProfile = { id: model.get('id'), type:'myprofile', name: model.get('username') };

      if(App.State.serverRoute !== '') {
    	  var promise = webix.ajax().post('api/v1/state', { serverRoute: '' }, App.State.$srvUrlChanged);
  	        
        promise.then(function(){}).fail(function(err) {
          webix.message({type: 'error', text: err.responseText});
        });
      } else {
        if(App.State.getState('segment') === '') {
          App.Router.navigate('id' + model.id, {trigger: true});
        } else {
          segmentSelector();
        }
      }
    },
    $userError: function(model, xhr, options) {
      App.State.user.set({'mainUserLogged': false}, {silent: true});
      segmentSelector();
      //заглушечка
    },
    $loadState: function(text, data) {
      //обработка состояния полученного с сервера
      
      //фиксируем полученный от пользователя URL на сервере, после обработки состояния приложение
      //перейдет по данному URL
      App.State.serverRoute = data.json().serverRoute;
      
      //(сравниваем авторизации на клиенте и сервере), (хэш суммы пользователя на клиенте и сервере)
      if(data.json().mainUserLogged) {
        //Если пользователь авторизирован на сервере
        
        //(сравниваем авторизации на клиенте и сервере), (хэш суммы пользователя на клиенте и сервере)
        if((App.State.user.get('mainUserLogged') !== data.json().mainUserLogged) || (App.State.usrCRC !== data.json().usrCRC)) {
          App.State.user.set({'mainUserLogged': true}, {silent: true});
		      App.State.user.url = '/api/v1/users/' + data.json().id;
          App.State.user.fetch({ success: App.State.$userSuccess, error: App.State.$userError, silent:true });
          
          return;
        }
        
        segmentSelector();
      } else {
        //Если пользователь не авторизирован на сервере
        if(App.State.user.get('mainUserLogged')) {
          App.State.user.set({'mainUserLogged': false}, {silent: true});
        }
        segmentSelector();
      }
    },
    $autonomeState: function(err) {
      webix.message(err);
      //заглушечка
    },
    /**
    * segmentChange
    *   функция вызывается при смене роута, запоминает предыдущее состояние, делает запрос состояния
    *   с сервера, передает управление дальше в соответствии с Result
    * Attributes:
    *   clientRoute - url по которому переходит пользователь
    *   segment - сегмент который отображается пользователю после перехода по url
    * Result:
    *   ok: $loadState - управление сменой сегмена в зависимости от состояния на сервере
    *   error: $autonomeState - переход к автономному режиму, когда состояние от сервера не получено
    *****************************************************************************/
    segmentChange: function(clientRoute, segment, filter) {
      this.setState( { clientRoute:clientRoute, segment:segment, filter:filter } );

      var promise = webix.ajax().get('api/v1/state', {}, this.$loadState);
      promise.then(function(realdata) {
      }).fail(this.$autonomeState);
    },
    userModelInit: function() {
      //Инициализируем глобальный объект пользователя со всеми настройками приложения
      var user = new App.Models.User();
      user.on('change', function(model, options) { 
        model.save(model.changedAttributes());
      });
      user.on('error', function(model, xhr, options) {});
      
      return user;
    },
    groupModelInit: function() {
      var group = new App.Models.Group();
      group.on('change', function(model, options) {
        model.save(model.changedAttributes());
      });
      group.on('error', function(model, xhr, options) {});
      
      return group;
    },
    taskModelInit: function() {
      var task = new App.Models.Task();
      task.on('change', function(model, options) {
        model.save(model.changedAttributes());
      });
      task.on('error', function(model, xhr, options) {});
      
      return task;
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
	
// 	webix.proxy.GroupData = {
//     $proxy: true,
//     init: function() {
//       //webix.extend(this, webix.proxy.offline);
//     },
//     load: function(view, callback) {
//       //Добавляем id вебиксовых вьюх для синхронизации с данными
//   	  //важно добавлять уже после создания всех вьюх, иначе будут добавлены пустые объекты
//       App.State.groupTreeManager.viewsAdd($$(view.config.id));
//     }
//   };
  
  webix.proxy.TaskData = {
    $proxy: true,
    init: function() {
      //webix.extend(this, webix.proxy.offline);
    },
    load: function(view, callback) {
      //Добавляем id вебиксовых вьюх для синхронизации с данными
  	  //важно добавлять уже после создания всех вьюх, иначе будут добавлены пустые объекты
      //App.State.taskTreeManager.viewsAdd($$(view.config.id));
    }
  };

  var offState = function() {
    $$('multiview_Left').hide();
    $$('multiview_Right').hide();

    $$('treetable_Tasks').clearAll();
    $$('treetable_Groups').clearAll();
    
    $$('toggle_HeaderMenu').setValue(0);
    $$('toggle_HeaderOptions').setValue(0);
    
    $$('toolbarAutorisation').show();
    $$('buttonAutorisationLogin').enable();
	  $$('buttonAutorisationRegister').enable();
	  
	  $$('tree_SegmentsSelector').unselectAll();
  };

  /**
  * addLastProfileList
  *   функция добавляет новый профиль в список последних просмотренных профилей (меню сегментов), 
  *   при этом при добавлении учитывает предельный размер списка в переменной _ConstLen_lastProfileSegment
  *   и при достижении предела удаляет первый элемент и добавляет новый в конец списка,
  *   так же функция обновляет значения в элементе интерфейса отвечающего за список просм. профилей
  * Attributes:
  *   newProfile - новый профиль, который добавляется в список, соответствует следующей структуре
  *   { id: идентификатор объекта профиля, type: тип объекта профиля, name: имя профиля, segment: 
  *   какому сегменту соответствует профиль };
  *   type следующих типов community - сообщество (публичная инфа); myprofile - профиль основного пользователя;
  *   userprofile - профиль пользователей; groupprofile - профиль группы; и т.д.
  * Result:
  *****************************************************************************/  
  var addLastProfileList = function(newProfile) {
    var arrProfileSegment = App.State.user.get('lastProfileSegment');
    
    var needAdd = true;
    for (var i = 0; i < arrProfileSegment.length; i++) 
      if(arrProfileSegment[i].id === newProfile.id) {
        needAdd = false;
      }
      
    if(needAdd) {
      if(arrProfileSegment.length >= App.State._ConstLen_lastProfileSegment) {
        $$('list_lastProfile').remove(arrProfileSegment[0].id);
        arrProfileSegment.shift();
      }
      
      arrProfileSegment.push(newProfile);
      App.State.user.save();//Обновим модель основного пользователя на сервере, добавив туда элемент списка просмотренных профилей
        
      if(!$$('list_lastProfile').exists(newProfile.id))
        $$('list_lastProfile').add(newProfile);
    }
  };

	//***************************************************************************
	//AFTER FETCH FUNCTIONs
	
	//Вывод данных пользовательского профиля во фрейм, после успешного получения с сервера (callback)
  var showUserData = function(model, response, options) {
    $$('tabview_User').show();
    $$('tabview_User').hideProgress();
    
    $$('scrollview_RightUserFilter').show();
    
    //В основном меню выделим пункт профиля
    if('SegmentsSelector_Profile' != $$('tree_SegmentsSelector').getSelectedId()) {
      $$('tree_SegmentsSelector').blockEvent(); //Блокируем срабатывание события при программном выборе пункта меню
      $$('tree_SegmentsSelector').select('SegmentsSelector_Profile'); //Программно выбираем пункт меню
      $$('tree_SegmentsSelector').unblockEvent();
    }      

    //если отображается пользователь, то выводятся поля ввода, в противном случае только информационные
    if(App.State.user.get('id') === App.State.viewedUser.get('id')) {
      $$('frame_User').show();
      App.Func.loadUserPermission();        //Загрузим настройки в панель настроек доступа своего профиля
    } else {
      $$('frame_ViewedUser').show();                                   //Показываем фрейм с данными чужого профиля
      if($$('multiview_Right').isVisible()) $$('multiview_Right').hide();     //Если панель настроек доступа видима, то скроем
      if($$('toggle_HeaderOptions').getValue()) $$('toggle_HeaderOptions').setValue(0); //Если кнопка настроке доступа нажата, то отожмем
      $$('toggle_HeaderOptions').disable();                                   //Заблокируем возможность нажимать кнопку открытия окна настроек доступа
    }
    
    //*Обновление дерева меню*
    //т.к. изменился профиль, то необходимо обновить дерево меню для отображения новых элементов
  	var SegmentsSelector_Users = $$('tree_SegmentsSelector').getItem('SegmentsSelector_Users');
    SegmentsSelector_Users.value = 'Друзья';
    if(!$$('tree_SegmentsSelector').exists('SegmentsSelector_Groups'))
  	  $$('tree_SegmentsSelector').add({ id: 'SegmentsSelector_Groups', value: 'Группы', hidden:false, icon: 'sitemap', $css: 'products', details:'Список групп профиля' }, 
  	    1, 'SegmentsSelector_Segments');
    $$('tree_SegmentsSelector').refresh();

    //*Заполнение атрибутов в открывшемся окне профиля*
    App.Func.loadUserAttributes();
  };
	
  //Вывод данных профиля группы во фрейм, после успешного получения с сервера (callback)
  var showGroupData = function(model, response, options) {
    $$('tabview_Group').show();
    $$('tabview_Group').hideProgress();
    
    $$('scrollview_RightGroupFilter').show();
    
    if('SegmentsSelector_Profile' != $$('tree_SegmentsSelector').getSelectedId()) {
      $$('tree_SegmentsSelector').blockEvent(); //Блокируем срабатывание события при программном выборе пункта меню
      $$('tree_SegmentsSelector').select('SegmentsSelector_Profile'); //Программно выбираем пункт меню
      $$('tree_SegmentsSelector').unblockEvent();
    }      

    //*Обновление дерева меню*
    //т.к. изменился профиль, то необходимо обновить дерево меню для отображения новых элементов
	  var SegmentsSelector_Users = $$('tree_SegmentsSelector').getItem('SegmentsSelector_Users');
    SegmentsSelector_Users.value = 'Участники';
    if($$('tree_SegmentsSelector').exists('SegmentsSelector_Groups'))
      $$('tree_SegmentsSelector').remove('SegmentsSelector_Groups');
    $$('tree_SegmentsSelector').refresh();    

    $$('frame_Group').show();

    App.Func.loadGroupAttributes();
  };
	
  var showGroupsDataAfterSuccess = function(text, data) {
    $$('treetable_Groups').parse(text);
  };

  var showGroupsDataAfterError = function(model, xhr, options) {
	  //заглушка
	};

  var showTasksDataAfterSuccess = function(text, data) {
    $$('treetable_Tasks').parse(text);
    App.Func.bind_Task();
  };

  var showTasksDataAfterError = function(model, xhr, options) {
	  //заглушка
	};

  var showTaskData = function(Tasks, response, options) {
  };

  var showUsersData= function() {
    //Обработка показа сегмента массива пользователей, сперва верно выделим пункты меню
    //Само нажатие нам не нужно производить, поэтому блокируем срабатывание события
    //если фильтр по пользователю не выбран, выделяем пункт пользователей в основном меню
    $$('tree_SegmentsSelector').blockEvent();
    if('SegmentsSelector_Users' != $$('tree_SegmentsSelector').getSelectedId()) {
      $$('tree_SegmentsSelector').select('SegmentsSelector_Users');
    }
    $$('tree_SegmentsSelector').unblockEvent();

    switch(App.State.SelectedProfile.type) {
      case 'community':
        $$('toggle_Users_Members').hide();
        $$('toggle_Users_Request').hide();
        $$('toggle_Users_Invitations').hide();
        $$('label_UsersHeader').setValues({ title:'Список всех зарегистрированных в системе людей' }, true);
        
        break;
      case 'userprofile':
        $$('toggle_Users_Members').hide();
        $$('toggle_Users_Request').hide();
        $$('toggle_Users_Invitations').hide();
        $$('label_UsersHeader').setValues({ title:'Список видимых друзей ' + App.State.SelectedProfile.name }, true);

        break;
      case 'myprofile':
        $$('toggle_Users_Members').define('label', 'Друзья');
        $$('toggle_Users_Members').show();
        $$('toggle_Users_Request').show();
        $$('toggle_Users_Invitations').show();
        
        //$$('button1').refresh();        
        $$('label_UsersHeader').setValues({ title:'Список ваших друзей' }, true);
        
        break;
      case 'groupprofile':
        $$('toggle_Users_Members').define('label', 'Участники');
        $$('toggle_Users_Members').refresh();
        $$('toggle_Users_Members').show();
        $$('toggle_Users_Request').show();
        $$('toggle_Users_Invitations').show();
        $$('label_UsersHeader').setValues({ title:'Список участников группы' }, true);
        
        break;
    }

    if($$('toggle_Users_Invitations').getValue() === 1)
      $$('toggle_Users_Invitations').toggle();
      
    if($$('toggle_Users_Members').getValue() === 1)
      $$('toggle_Users_Members').toggle();
      
    if($$('toggle_Users_Request').getValue() === 1)
      $$('toggle_Users_Request').toggle();            
    
    if(App.State.getState('filter').all === true) {
      $$('toggle_Users_Invitations').toggle();
    } else {
      if(App.State.getState('filter').request === false)
        $$('toggle_Users_Members').toggle();
      else
        $$('toggle_Users_Request').toggle();
    }

    $$('frame_Users').show();
    $$('scrollview_UsersFilter').show();

    //Параметры загрузки массива пользователей передаются в обработчике событий onDataRequest 
    //компоненты dataview_Users
    $$('dataview_Users').clearAll();
    $$('dataview_Users').loadNext(4, 0);
  };
  
	var loadProfileDataSuccess = function(model, response, options) {
    var stateFilter = App.State.getState('filter');
    var newProfile = {};
    
    switch(stateFilter.profiletype) {
      case 'userprofile':
        //если отображается пользователь, то выводятся поля ввода, в противном случае только информационные
        if(App.State.user.get('id') === App.State.viewedUser.get('id')) {
          App.State.SelectedProfile = { id: model.get('id'), type:'myprofile', name: model.get('username') };
        } else {
          //установим в состоянии приложения новый профиль
          App.State.SelectedProfile = { id: model.get('id'), type:'userprofile', name: model.get('username') };
          
          //*Добавление профиля в список последних профилей*
          newProfile = { id: model.get('id'), type:'userprofile', name: model.get('username'), segment: 'Профиль пользователя' };
          addLastProfileList(newProfile);
        }

        if(App.State.getState('segment') === 'users')
          showUsersData();
        else
          showUserData();

        break;
      case 'groupprofile':
        //*Установим в состоянии приложения новый профиль
        App.State.SelectedProfile = { id: model.get('id'), type:'groupprofile', name: model.get('name') };
    
        //*Добавление профиля в список последних профилей*
        newProfile = { id: model.get('id'), type:'groupprofile', name: model.get('name'), segment: 'Профиль группы' };
        addLastProfileList(newProfile);
        
        if(App.State.getState('segment') === 'users')
          showUsersData();
        else
          showGroupData();
          
        break;
    }
	};
	
	var loadProfileDataError = function(model, xhr, options) {
	  //заглушка
	};
	
  /**
  * segmentSelector
  *   переключение/обновление сегмента, запрос данных по уже текущему сегменту и вызов функции 
  * отрисовки интерфейса какого либо сегмента после загрузки данных
  *****************************************************************************/	
  var segmentSelector = function() {
    var user = App.State.user;
    var viewedUser = App.State.viewedUser;
    var viewedGroup = App.State.viewedGroup;
    
    //если пользователь залогинился (получаем при опросе состояния сервера)
  	if(user.get('mainUserLogged')) {
  	  if(!$$('toolbarHeader').isVisible()) $$('toolbarHeader').show();
  	  if(!$$('toggle_HeaderOptions').isEnabled()) $$('toggle_HeaderOptions').enable();
  	  
  	  //*Установим видимость пункта меню "Группы"
  	  //$$('tree_SegmentsSelector').unselectAll();
  	  //var item = $$('tree_SegmentsSelector').getItem('SegmentsSelector_Groups');
      //item.hidden = App.State.getState('segment') === 'group'?true:false;
      //$$('tree_SegmentsSelector').updateItem('SegmentsSelector_Groups', item);
      //$$('tree_SegmentsSelector').refresh();

      var stateFilter = {};
  	  //Отрисовка интерфейса в зависимости от выбранного сегмента
  	  switch(App.State.getState('segment')) {
        case 'user':
          stateFilter = App.State.getState('filter');
       	  $$('tabview_User').showProgress({
            type:'icon',
            delay:200
          });
  
          viewedUser.url = '/api/v1/users/' + stateFilter.id;
          viewedUser.fetch({ success: loadProfileDataSuccess, error: loadProfileDataError, silent:true });

          break;
        case 'group':
       	  stateFilter = App.State.getState('filter');
       	  $$('tabview_Group').showProgress({
            type:'icon',
            delay:200
          });
          
          viewedGroup.url = '/api/v1/groups/' + stateFilter.id;
          viewedGroup.fetch({ success: loadProfileDataSuccess, error: loadProfileDataError, silent:true });
          
          break;
        case 'users':
          stateFilter = App.State.getState('filter');
          var selectedProfileType = App.State.SelectedProfile.type === 'myprofile'?'userprofile':App.State.SelectedProfile.type;
          
          if( ((selectedProfileType === stateFilter.profiletype) && (App.State.SelectedProfile.id === stateFilter.id)) || (stateFilter.id === null) ) {
            showUsersData();
          } else {
            switch(stateFilter.profiletype) {
              case 'userprofile':
              case 'myprofile':
                viewedUser.url = '/api/v1/users/' + stateFilter.id;
                viewedUser.fetch({ success: loadProfileDataSuccess, error: loadProfileDataError, silent:true });

                break;
              case 'groupprofile':
                viewedGroup.url = '/api/v1/groups/' + stateFilter.id;
                viewedGroup.fetch({ success: loadProfileDataSuccess, error: loadProfileDataError, silent:true });
                
                break;
              case 'community':
                showUsersData();
            }
          }
          
          break;
        case 'groups':
          //Обработаем показ сегмента групп, сперва верно выделим пункты меню
          //Само нажатие нам не нужно производить, поэтому блокируем срабатывание события
          //если фильтр по пользователю не выбран, выделяем пункт групп в основном меню
          //в противном случае снимаем выделение          
          $$('tree_SegmentsSelector').blockEvent();
          if('SegmentsSelector_Groups' != $$('tree_SegmentsSelector').getSelectedId()) {
            $$('tree_SegmentsSelector').select('SegmentsSelector_Groups');
          }
          $$('tree_SegmentsSelector').unblockEvent();
          
          $$('treetable_Groups').clearAll();
          var promise = webix.ajax().get('api/v1/groups', { userId: App.State.SelectedProfile.id }, showGroupsDataAfterSuccess);
          promise.then(function(realdata) {}).fail(showGroupsDataAfterError);

          //$$('treetable_Groups').load('api/v1/groups');
          //$$('treetable_Groups').loadNext(10, 0, null, 'api/v1/groups');

          $$('frame_Groups').show();
          $$('scrollviewRight_GroupsFilter').show();
          
          break;
        case 'tasks':
          $$('tree_SegmentsSelector').blockEvent();
          if('SegmentsSelector_Tasks' != $$('tree_SegmentsSelector').getSelectedId()) {
            $$('tree_SegmentsSelector').select('SegmentsSelector_Tasks');
          }
          $$('tree_SegmentsSelector').unblockEvent();
          
          $$('treetable_Tasks').clearAll();
          var promise = webix.ajax().get('api/v1/tasks', { userId: App.State.SelectedProfile.id }, showTasksDataAfterSuccess);
          promise.then(function(realdata) {}).fail(showTasksDataAfterError);

          $$('frame_Tasks').show();
          //$$('scrollviewRight_TasksFilter').show();
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
        case 'home':
          App.State.SelectedProfile = { id: 0, type:'community', name:'Сообщество' };
          $$('tree_SegmentsSelector').refresh();
          $$('frameBlank').show();
          break;
  	  }
  	} else {
  	  console.log('segmentSelector: user not logged');
	    App.State.init();
	    offState();
  	  $$('frameCentral_Greeting').show();
  	} //if(App.State.user.mainUserLogged)    
  };
  
  var connectionErrorShow = function(err) {
    if(err.status === 434) {
      //defaultState();
      //App.Router.navigate('', {trigger: true});
    }
    webix.message( { type:'error', text:err.responseText } );
  };

  function parseQueryString(queryString) {
    if (!_.isString(queryString))
      return;
    queryString = queryString.substring( queryString.indexOf('?') + 1);
    var params = {};
    var queryParts = decodeURI(queryString).split(/&/g);
    _.each(queryParts, function(val) {
      var parts = val.split('=');
      if (parts.length >= 1) {
        var val = undefined;
        if (parts.length == 2)
          val = parts[1];
        params[parts[0]] = val;
      }
    });
    return params;
  }

  /**
  * App.Router
  *   экземпляр backbone роутера, который парсит url переданный в клиента и вызывает обновление
  * сегментов соответствующих url, а если есть переданные в url параметры, то их заносит в State 
  * клиентского приложения
  * App.Router вызывается сразу же после создания
  * основные этап от url до отрисовки:
  * url->App.Router (парсинг url)
  * App.Router->state.segmentChange (оповещение состояния приложения о смене сегментов, добавление
  *  предыдущего состояния в стек состояний на случай, если нужно будет вернуться назад на пред. url)
  * state.segmentChange->$loadState (загрузка состояния приложения с сервера, в случае изменения состояния
  *  происходит загрузка данных осн.пользователя)
  * $loadState->segmentSelector 
  * или
  * $loadState->$userSuccess->segmentSelector (собственно переключение/обновление сегмента, 
  *   запрос данных по уже текущему сегменту и вызов функции отрисовки интерфейса какого либо 
  *   сегмента после загрузки данных)
  *****************************************************************************/
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
			'gr:id(/)':'group',
			'users(/)':'users',
			'users?*query':'users',
			'home(/)':'home',
			'':'index'
		},
		//home выбрасывает в корень
		home:function() {
		  App.State.segmentChange('home', 'home');
		},
		//корень приложения
		index:function() {
		  App.State.segmentChange('', undefined);
		},
		groups:function() {
		  App.State.segmentChange('groups', 'groups');
		},
		tasks:function() {
		  App.State.segmentChange('tasks', 'tasks');
		},
		user:function(id) {
		  App.State.segmentChange('id' + id, 'user', { id:id, profiletype: 'userprofile' });
		},
		group:function(id) {
		  App.State.segmentChange('gr' + id, 'group', { id:id, profiletype: 'groupprofile' });
		},
		users:function(query) {
		  var url = 'users';
		  var filter = { id: null, all: true, request: false, profiletype: 'userprofile' }; //userprofile, groupprofile, community
		  
		  //для роута inTask.me/users query будет иметь значение null, 
		  //этот роут должен привести к отображению всех зарегистрированных пользователей системы
		  //относительно прав видимости осн. пользователя
		  //в остальных случаях список пользователей отображается относительно просматриваемого сегмента
		  if(query !== null) {
		    var params = parseQueryString(query);
		    filter.all = false;
		    if(typeof params.id !== 'undefined') {
		      filter.id = Number(params.id);
		      url = url + '?id=' + params.id;
		    } else {
		      filter.profiletype = 'groupprofile';
		      filter.id = Number(params.gr);
		      url = url + '?gr=' + params.gr;
		    }
		    
  		  if(typeof params.request !== 'undefined') {
  		    filter.request = Boolean(params.request);
  		    url = url + '&request=' + params.request;
  		  }
		  }
		  
		  App.State.segmentChange(url, 'users', filter);
		},
		login:function() {
		  //App.State.clientRoute = '/login';
		  if(!App.State.user.get('mainUserLogged')) {
		    $$('frameCentral_Login').show();
        $$('frameCentralLogin_authenticateError').setValues({src:''});

		    $$('buttonAutorisationLogin').disable();
		    $$('buttonAutorisationRegister').enable();
		  } else {
		    App.Router.navigate('id' + App.State.user.get('id'), {trigger: true});
		  }
		},
		logout:function() {
		  //App.State.clientRoute = '/logout';
      var promise = webix.ajax().put('api/v1/logout', { id: App.State.user.get('id') });
	        
      promise.then(function(realdata) {
        App.State.user.set({'mainUserLogged': false}, {silent:true});
        App.Router.navigate('', {trigger: true});
      }).fail(function(err){
        connectionErrorShow(err);
      });
		},
		register:function() {
		  //App.State.clientRoute = '/register';
		  if(!App.State.user.get('mainUserLogged')) {
		    $$('frameCentral_Register').show();
		    $$('frameCentralRegister_authenticateError').setValues({src:''});
		    
		    $$('buttonAutorisationLogin').enable();
		    $$('buttonAutorisationRegister').disable();
		  } else {
		    App.Router.navigate('id' + App.State.user.get('id'), {trigger: true});
		  }
		}
	}))();

  //Инициирование начального состояния приложения
  App.State.init();
  
  //Создание dom приложения посредством загрузки конфигурации элементов интерфейса в менеджер окон webix
  var frame_Base = new webix.ui({
    id:'frame_Base',
    rows:[App.Frame.multiviewToolbar, 
      { cols: [App.Frame.multiview_Left, App.Frame.multiview_Central, App.Frame.multiview_Right] }
    ]
  });

  //после построения dom просиходит манипуляция с элементами интерфейса, в данном случае функция 
  //сбрасывает основные элементы в состояние: осн.пользователь не зарегистрирован
  offState();

  //сделаем mixin для построенного webix элементов интерфейса, т.е. добавим возможность отрисовывать 
  //ProgressBar у вьюшек ниже (расширим их функционал)
  webix.extend($$('tabview_User'), webix.ProgressBar);
  webix.extend($$('tabview_Group'), webix.ProgressBar);

  //скажем менеджеру интерфейсов какие нажатия необходимо обработать по своему
  webix.UIManager.addHotKey('enter', function() { 
    if($$('frameCentral_Register').isVisible()) {
      App.Func.Register();
    } else if($$('frameCentral_Login').isVisible()) {
      App.Func.Login();
    }
  });

  //************************************************************************************************
  //Обработчики событий
  var users_DataRefresh = function(data) {
    $$('dataview_Users').parse(data);
  };
  
  $$('dataview_Users').attachEvent('onDataRequest', function(start, count, callback, url) {
    var filter = App.State.getState('filter');
    var params = { start:start, count:count, 
        segment_id: App.State.SelectedProfile.id, 
        segment_type: App.State.SelectedProfile.type };
    
    if(typeof filter !== 'undefined') {
      if(filter.id === null) params.segment_id = 0;
    }
    
    webix.ajax().get('api/v1/users', params, users_DataRefresh);
    return false;
  });

  /*$$('uploader_User_Avatar').attachEvent('onUploadComplete', function(){
    $$('avatarProfile_user').refresh();
    $$('img_User_Avatar').hide();
  });*/

  $$('treetable_Groups').attachEvent('onAfterEditStart', function(id) {
    App.State.groupstable_ItemEdited = id;
  });

  $$('treetable_Groups').attachEvent('onAfterEditStop', function(state, editor, ignoreUpdate) {
    var ItemEdited = App.State.groupstable_ItemEdited;
    var ItemSelected = App.State.groupstable_ItemSelected;
    if (editor.column === 'name') {
      if(ItemEdited != ItemSelected) {
        this.getItem(ItemEdited).name = state.old;
        this.updateItem(ItemEdited);
        App.State.groupstable_ItemEdited = null;
      } else {
        //var selectGroup = App.State.groups.get(App.State.groupstable_ItemEdited);
        //selectGroup.set({ 'name': state.value });
      }
    }
  });
  
  // $$('treetable_Tasks').attachEvent('onAfterEditStart', function(id) {
  //   App.State.tasktable_ItemEdited = id;
  // });

  // $$('treetable_Tasks').attachEvent('onAfterEditStop', function(state, editor, ignoreUpdate) {
  //   var ItemEdited = App.State.tasktable_ItemEdited;
  //   var ItemSelected = App.State.tasktable_ItemSelected;
  //   if (editor.column === 'name') {
  //     if(ItemEdited != ItemSelected) {
  //       this.getItem(ItemEdited).name = state.old;
  //       this.updateItem(ItemEdited);
  //       App.State.tasktable_ItemEdited = null;
  //     } else {
  //       var selectTask = App.State.tasks.get(App.State.tasktable_ItemEdited);
  //       selectTask.set({ 'name': state.value });
  //     }
  //   }
  // }); 
  
  var groups_dp = webix.dp('treetable_Groups');
  groups_dp.config.updateFromResponse = true;  
  groups_dp.attachEvent('onAfterSaveError', function(id, status, response, detail) {
    // structure of status: {
    //   id:"id of item",
    //   status:"update status",
    //   newid:"new id after operation"
    // }
    // Structure of details {
    //   text:"full text of server side response",
    //   data:"webix ajax data related to the error",
    //   loader:"xmlHttpRequest object related to the error"
    // }
    
    return true;
  });
  
  groups_dp.attachEvent('onBeforeSaveError', function(id, status, response, detail) {
    return true;//return true to ignore the error and mark item as saved
  });
  
  groups_dp.attachEvent('onLoadError', function(text, data, loader) {
    return true;
  });
  
  groups_dp.attachEvent('onBeforeInsert', function(id, object) {
    $$('treetable_Groups').showOverlay('Добавление группы...');
    return true;
  });
  
  groups_dp.attachEvent('onBeforeUpdate', function(id, object) {
    $$('treetable_Groups').showOverlay('Изменение в группе...');
    return true;
  });
  
  groups_dp.attachEvent('onAfterSave', function(response, id, update) {
    $$('treetable_Groups').hideOverlay();
    return true;
  });

  var task_dp = webix.dp('treetable_Tasks');
  task_dp.config.updateFromResponse = true;  
  task_dp.attachEvent('onAfterSaveError', function(id, status, response, detail) {
    return true;
  });
  
  task_dp.attachEvent('onBeforeSaveError', function(id, status, response, detail) {
    return true;//return true to ignore the error and mark item as saved
  });
  
  task_dp.attachEvent('onLoadError', function(text, data, loader) {
    return true;
  });
  
  task_dp.attachEvent('onBeforeInsert', function(id, object) {
    $$('treetable_Tasks').showOverlay('Добавление задачи...');
    return true;
  });
  
  task_dp.attachEvent('onBeforeUpdate', function(id, object) {
    $$('treetable_Tasks').showOverlay('Изменение задачи...');
    return true;
  });
  
  task_dp.attachEvent('onAfterSave', function(response, id, update) {
    $$('treetable_Tasks').hideOverlay();
    return true;
  });
  
  webix.i18n.setLocale('ru-RU');
  moment.locale('ru');
  webix.event(window, 'resize', function() { frame_Base.adjust(); });
  //Backbone.history.start({pushState: true, root: "/"});
  Backbone.history.start( { pushState: true } );
});