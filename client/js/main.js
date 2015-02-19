//блок, который исполнит вебикс когда все загрузит
var implementFunction = (function() {
  var App = window.App;
  var webix = window.webix;
  var Backbone = window.Backbone;
  
  App.State = {
    _st : [{
      clientRoute : '',
      segment     : '',   //user, users, groups, tasks, templates, finances, process, files, notes
      segmentId   : null
    }],                   //Стек переходов пользователя по роутам
    _ConstLen_st   : 4,    //Размер стека переходов
    SelectedSegmentProfile : {
      id : null,
      type : null,
      name : null
    },                    //Данный атрибут указывает на профиль относительно которого показываются все сегменты
    _ConstLen_lastProfileSegment: 5, //Размер стека последних просмотренных профилей
    user             : null,     //Пользователь системы
    viewedUser       : null,     //текущий пользователь, выбранный в списке пользователей или друзей
    viewedGroup      : null,
    //groupTreeManager : null,     //менеджер дерева для групп
    //taskTreeManager  : null,     //менеджер дерева для задач
    //groups           : null,     //коллекция групп пользователя системы
    //tasks            : null,     //коллекция задач пользователя системы
    serverRoute      : '',
    //segmentUserId    : null,
    //segmentGroupId   : null,
    usrCRC           : null,
    group            : 0,        //Выбранная группа, по которой фильтруются задачи
    usersFilter      : { userId: 0 },
    //флаги состояния приложения this_view_action
    //groupstable_ItemSelected  : 0,    //выделенный элемент в области конструктора групп
    //groupstable_ItemEdited    : null, //редактируемый элемент в области конструктора групп
    //tasktable_ItemSelected    : 0,    //выделенный элемент в области конструктора задач
    //tasktable_ItemEdited      : null,  //редактируемый элемент в области конструктора задач
    init: function() {
      if(this.user != null) { this.user = null; }
      this.user = this.userModelInit();

      if(this.viewedUser != null) { this.viewedUser = null; }
      this.viewedUser = this.userModelInit();

      if(this.viewedGroup != null) { this.viewedGroup = null; }
      this.viewedGroup = this.groupModelInit();

      //if(this.groupTreeManager != null) { this.groupTreeManager = null; }
      //this.groupTreeManager = new treeManager();

      //if(this.taskTreeManager != null) { this.taskTreeManager = null; }
      //this.taskTreeManager = new treeManager();

      //if(this.groups != null) { this.groups = null; }
      //this.groups = this.groupsModelInit();

      //if(this.tasks != null) { this.tasks = null; }
      //this.tasks = this.tasksModelInit();

      this._st                      = [ { clientRoute: '', segment: '' } ];
      this.SelectedSegmentProfile   = { id: null, type:null, name:null };
      this.serverRoute              = '';
      this.prevClientRoute          = '',
      //this.segmentUserId            = null;
      //this.segmentGroupId           = null;
      this.usrCRC                   = null;
      this.group                    = 0;
      this.usersFilter              = { userId: 0 };
      //this.groupstable_ItemSelected = 0;
      //this.groupstable_ItemEdited   = null;
      //this.tasktable_ItemSelected   = 0;
      //this.tasktable_ItemEdited     = null;
    },
    /**
    * setState
    *   Функция ДОБАВЛЯЕТ новые значения в стек состояний State._st. 
    *   Стек ограничен длиной в 4 элемента, при привышении этой длины первый элемент стека State._st удаляется.
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
        len = this._st.push({ clientRoute: '', segment: '' });
        
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
  	  
  	  if(App.State.SelectedSegmentProfile.id === null)
  	    App.State.SelectedSegmentProfile = { id: model.get('id'), type:'myprofile', name: model.get('username') };

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
    segmentChange: function(clientRoute, segment, segmentId) {
      this.setState( { clientRoute:clientRoute, segment:segment, segmentId:segmentId } );
      if(segmentId !== undefined)
        App.State.SelectedSegmentProfile.id = segmentId;

      var promise = webix.ajax().get('api/v1/state', {}, this.$loadState);
      promise.then(function(realdata) {
        //prevClientRoute = 
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
    }
    // groupsModelInit: function() {
  	 // var groups = new collectionGroups();
  
    // 	groups.on('add', function(grp) {
    // 	  App.State.groupTreeManager.treeAdd(grp);
    // 	});
  	
    // 	groups.on('remove', function(ind) {
    // 	  App.State.groupTreeManager.treeRemove(ind);
    // 	});
  
    //   groups.on('change', function(model, options) {
    //     App.State.groupTreeManager.treeChange(model);
    //     model.save(); 
    //   });
      
    //   groups.on('move', function(currentPosId, newPosId, parentId) {
    //     App.State.groupTreeManager.move(currentPosId, newPosId, parentId);
    //   });
      
    //   return groups;
    // },
    // tasksModelInit: function() {
    //   var tasks = new collectionTasks();
      
    //   tasks.on('add', function(tsk) {
    //     App.State.taskTreeManager.treeAdd(tsk);
    //   });
      
    // 	tasks.on('remove', function(ind) {
    // 	  App.State.taskTreeManager.treeRemove(ind);
    // 	});
    
    //   tasks.on('change', function(model, options) {
    //     App.State.taskTreeManager.treeChange(model);
    //     model.save();
    //   });
      
    //   tasks.on('move', function(currentPosId, newPosId, parentId) {
    //     App.State.taskTreeManager.move(currentPosId, newPosId, parentId);
    //   });
      
    //   return tasks;
    // }
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
      //App.State.taskTreeManager.viewsAdd($$(view.config.id));
    }
  };

  var offState = function() {
    $$('multiview_Left').hide();
    $$('multiview_Right').hide();

    $$('treetableMytasks_Tasktable').clearAll();
    $$('treetableMyGroups_Groupstable').clearAll();
    
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
  var showUserDataAfterSuccess = function(model, response, options) {
    $$('tabview_CentralUser').show();
    $$('tabview_CentralUser').hideProgress();
    
    $$('scrollview_RightUserFilter').show();
    
    //В основном меню выделим пункт профиля
    if('SegmentsSelector_Profile' != $$('tree_SegmentsSelector').getSelectedId()) {
      $$('tree_SegmentsSelector').blockEvent(); //Блокируем срабатывание события при программном выборе пункта меню
      $$('tree_SegmentsSelector').select('SegmentsSelector_Profile'); //Программно выбираем пункт меню
      $$('tree_SegmentsSelector').unblockEvent();
    }      

    //если отображается пользователь, то выводятся поля ввода, в противном случае только информационные
    if(App.State.user.get('id') === App.State.viewedUser.get('id')) {
      App.State.SelectedSegmentProfile = { id: model.get('id'), type:'myprofile', name: model.get('username') };
      
      $$('frameProfile_user').show();
      App.Func.loadUserPermission();        //Загрузим настройки в панель настроек доступа своего профиля
    } else {
      //установим в состоянии приложения новый профиль
      App.State.SelectedSegmentProfile = { id: model.get('id'), type:'userprofile', name: model.get('username') };
      
      //*Добавление профиля в список последних профилей*
      var newProfile = { id: model.get('id'), type:'userprofile', name: model.get('username'), segment: 'Профиль пользователя' };
      addLastProfileList(newProfile);
      
      $$('frameProfile_viewedUser').show();                                   //Показываем фрейм с данными чужого профиля
      if($$('multiview_Right').isVisible()) $$('multiview_Right').hide();       //Если панель настроек доступа видима, то скроем
      if($$('toggle_HeaderOptions').getValue()) $$('toggle_HeaderOptions').setValue(0); //Если кнопка настроке доступа нажата, то отожмем
      $$('toggle_HeaderOptions').disable();                                   //Заблокируем возможность нажимать кнопку открытия окна настроек доступа
    }
    
    //*Обновление дерева меню*
    //т.к. изменился профиль, то необходимо обновить дерево меню для отображения новых элементов
    $$('tree_SegmentsSelector').refresh();
    
    //*Заполнение атрибутов в открывшемся окне профиля*
    App.Func.loadUserAttributes();
  };
	
	var showUserDataAfterError = function(model, xhr, options) {
	  //заглушка
	};
	
  //Вывод данных профиля группы во фрейм, после успешного получения с сервера (callback)
  var showGroupDataAfterSuccess = function(model, response, options) {
    $$('tabview_CentralGroup').show();
    $$('tabview_CentralGroup').hideProgress();
    
    $$('scrollview_RightGroupFilter').show();
    
    if('SegmentsSelector_Profile' != $$('tree_SegmentsSelector').getSelectedId()) {
      $$('tree_SegmentsSelector').blockEvent(); //Блокируем срабатывание события при программном выборе пункта меню
      $$('tree_SegmentsSelector').select('SegmentsSelector_Profile'); //Программно выбираем пункт меню
      $$('tree_SegmentsSelector').unblockEvent();
    }      

    //*Установим в состоянии приложения новый профиль
    App.State.SelectedSegmentProfile = { id: model.get('id'), type:'groupprofile', name: model.get('name') };

    //*Добавление профиля в список последних профилей*
    var newProfile = { id: model.get('id'), type:'groupprofile', name: model.get('name'), segment: 'Профиль группы' };
    addLastProfileList(newProfile);
    
    //*Обновление дерева меню*
    //т.к. изменился профиль, то необходимо обновить дерево меню для отображения новых элементов
    $$('tree_SegmentsSelector').refresh();    

    $$('frame_GroupProfile').show();
    //App.Func.loadUserPermission();        //Загрузим настройки в панель настроек доступа своего профиля

    App.Func.loadGroupAttributes();
  };
	
	var showGroupDataAfterError = function(model, xhr, options) {
	  //заглушка
	};
	
  var showGroupsDataAfterSuccess = function(text, data) {
    //App.State.groupTreeManager.treeBuild(App.State.groups.models);
    
    //$$('treetableMyGroups_Groupstable').load('GroupData->load');
    $$("treetableMyGroups_Groupstable").parse(text);
  };

  var showGroupsDataAfterError = function(model, xhr, options) {
	  //заглушка
	};

  var showTaskDataAfterFetch = function(Tasks, response, options) {
    //App.State.taskTreeManager.treeBuild(App.State.tasks.models);
    
    //$$('treetableMytasks_Tasktable').load('TaskData->load'); //!!!!!!!!!!!!!!!!!!!!!
  };

  //***************************************************************************
  //INTERFACE MANIPULATION
  //segmentSelector переключает состояние интерфейса в соответствии с теми сегментами, которые были
  //установлены при обратке роутов в backbone App.Router, смена сегментов всегда сопровождается вызовом
  //следующих функций segmengChange()->опрос состояния сервера->segmentSelector()->перерисовка интерфейса
  var segmentSelector = function() {
    var user = App.State.user;
    var viewedUser = App.State.viewedUser;
    var viewedGroup = App.State.viewedGroup;
    
    //если пользователь залогинился (получаем при опросе состояния сервера)
  	if(user.get('mainUserLogged')) {
  	  if(!$$('toolbarHeader').isVisible()) $$('toolbarHeader').show();
  	  if(!$$('toggle_HeaderOptions').isEnabled()) $$('toggle_HeaderOptions').enable();
  	  
  	  //*Установим видимость пункта меню "Группы"
  	 // $$('tree_SegmentsSelector').unselectAll();
  	 // var item = $$('tree_SegmentsSelector').getItem('SegmentsSelector_Groups');
    //   item.hidden = App.State.getState('segment') === 'group'?true:false;
    //   $$('tree_SegmentsSelector').updateItem('SegmentsSelector_Groups', item);
    //   $$('tree_SegmentsSelector').refresh();

  	  //Отрисовка интерфейса в зависимости от выбранного сегмента
  	  switch(App.State.getState('segment')) {
        case 'user':
       	  $$('tabview_CentralUser').showProgress({
            type:'icon',
            delay:200
          });
  
          //viewedUser.url = '/api/v1/users/' + App.State.segmentUserId;
          viewedUser.url = '/api/v1/users/' + App.State.SelectedSegmentProfile.id;
          viewedUser.fetch({ success: showUserDataAfterSuccess, error: showUserDataAfterError, silent:true });

          break;
        case 'group':
       	  $$('tabview_CentralGroup').showProgress({
            type:'icon',
            delay:200
          });
          
          //viewedGroup.url = '/api/v1/groups/' + App.State.segmentGroupId;
          viewedGroup.url = '/api/v1/groups/' + App.State.SelectedSegmentProfile.id;
          viewedGroup.fetch({ success: showGroupDataAfterSuccess, error: showGroupDataAfterError, silent:true });
          
          break;
        case 'users':
          //Обработаем показ сегмента пользователей, сперва верно выделим пункты меню
          //Само нажатие нам не нужно производить, поэтому блокируем срабатывание события
          //если фильтр по пользователю не выбран, выделяем пункт пользователей в основном меню
          //в противном случае снимаем выделение
          $$('tree_SegmentsSelector').blockEvent();
          //if(App.State.usersFilter.userId === 0) {
            if('SegmentsSelector_Users' != $$('tree_SegmentsSelector').getSelectedId()) {
              $$('tree_SegmentsSelector').select('SegmentsSelector_Users');
            }
          //} else {
          //  $$('tree_SegmentsSelector').unselectAll();
          //}
          $$('tree_SegmentsSelector').unblockEvent();
          
          $$('dataviewCentral_Users').clearAll();
          $$('dataviewCentral_Users').loadNext(4, 0, null, 'api/v1/users');

          $$('frameCentral_Users').show();
          $$('scrollviewRight_UsersFilter').show();
          
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
          
          $$('treetableMyGroups_Groupstable').clearAll();
          var promise = webix.ajax().get('api/v1/groups', { userId: App.State.SelectedSegmentProfile.id }, showGroupsDataAfterSuccess);
          promise.then(function(realdata) {}).fail(showGroupsDataAfterError);

          //$$('treetableMyGroups_Groupstable').load('api/v1/groups');
          //$$('treetableMyGroups_Groupstable').loadNext(10, 0, null, 'api/v1/groups');

          $$('tabviewCentral_Groups').show();
          $$('scrollviewRight_GroupsFilter').show();
          
          break;
        case 'tasks':
          $$('tree_SegmentsSelector').select('SegmentsSelector_Tasks');
          
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
        case 'home':
          App.State.SelectedSegmentProfile = { id: 0, type:'community', name:'Сообщество' };
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
    webix.message({type:'error', text:err.responseText});
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
			'gr:id(/)':'group',
			'users?id=:id(/)':'userUsers',
			'users(/)':'users',
			'home(/)':'home',
			'':'index'
		},
		//home выбрасывает в корень
		home:function() {
		  //this.navigate('', {trigger: true});
		  App.State.segmentChange('/home', 'home');
		},
		//корень приложения
		index:function() {
		  App.State.segmentChange('', undefined);
		},
		groups:function() {
		  App.State.segmentChange('/groups', 'groups');
		},
		tasks:function() {
		  App.State.segmentChange('/tasks', 'tasks');
		},
		users:function() {
		  App.State.usersFilter.userId = 0;
		  App.State.segmentChange('/users', 'users');
		},
		user:function(id) {
		  //App.State.segmentUserId = id;
		  App.State.segmentChange('/id' + id, 'user', id);
		},
		group:function(id) {
		  //App.State.segmentGroupId = id;
		  App.State.segmentChange('/gr' + id, 'group', id);
		},
		userUsers:function(id) {
		  App.State.usersFilter.userId = id;
		  //App.State.segmentUserId = id;
		  App.State.segmentChange('users?id=' + id, 'users', id);
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

  App.State.init();
  
  //вебикс конфигурация основного окна загруженная в экземпляр объекта вебиксового менеджера окон
  var frameBase = new webix.ui({
    id:'frameBase',
    rows:[App.Frame.multiviewToolbar, 
      { cols: [App.Frame.multiview_Left, App.Frame.multiviewCentral, App.Frame.multiview_Right] }
    ]
  });

  offState();

  webix.extend($$('tabview_CentralUser'), webix.ProgressBar);
  webix.extend($$('tabview_CentralGroup'), webix.ProgressBar);

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
        //var selectGroup = App.State.groups.get(App.State.groupstable_ItemEdited);
        //selectGroup.set({ 'name': state.value });
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
    webix.ajax().get('api/v1/users', { start:start, count:count, userId: App.State.usersFilter.userId }, centralUsers_DataRefresh);
    return false;
  });

  $$('upl1').attachEvent('onUploadComplete', function(){
    $$('avatarProfile_user').refresh();
    $$('avatarLoaderFrame').hide();
  });
  
  var dp = webix.dp('treetableMyGroups_Groupstable');
  dp.config.updateFromResponse = true;  
  dp.attachEvent('onAfterSaveError', function(id, status, response, detail) {
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
  dp.attachEvent('onBeforeSaveError', function(id, status, response, detail) {
    return true;//return true to ignore the error and mark item as saved
  });  
  dp.attachEvent('onLoadError', function(text, data, loader) {
    return true;
  });
  dp.attachEvent('onBeforeInsert', function(id, object) {
    $$('treetableMyGroups_Groupstable').showOverlay('Добавление группы...');
    return true;
  });
  dp.attachEvent('onBeforeUpdate', function(id, object) {
    $$('treetableMyGroups_Groupstable').showOverlay('Изменение в группе...');
    return true;
  });  
  dp.attachEvent('onAfterSave', function(response, id, update) {
    $$('treetableMyGroups_Groupstable').hideOverlay();
    return true;
  });

  webix.i18n.parseFormatDate = webix.Date.strToDate('%Y/%m/%d');
  webix.event(window, 'resize', function() { frameBase.adjust(); });
  //Backbone.history.start({pushState: true, root: "/"});
  Backbone.history.start( { pushState: true } );
});