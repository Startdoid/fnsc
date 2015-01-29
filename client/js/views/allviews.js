var App = window.App;
var webix = window.webix;

var toggleHeader_Menu = {
	view:'toggle', id:'toggleHeader_Menu',
	type:'icon', icon:'bars', 
	width:30,	//height:30,
	on:{
		'onItemClick': function() {
		  if($$('multiviewLeft').isVisible()) {
		    $$('multiviewLeft').hide();
		  } else {
		    $$('multiviewLeft').show();
		    $$('scrollviewLeft_Segments').show();
		    $$('listSegments_SegmentsSelector').refresh();
		  }	
		}
	}
};

var labelHeader_InTask = {
	view: 'label', id:'labelHeader_InTask',
	width:100,
	label:'InTask.me',
	on:{
		'onItemClick': function() { 
		  App.Router.navigate('home', {trigger:true} ); 
		}
	}
};

var toggleHeader_Options = {
	view: 'toggle',  id: 'toggleHeader_Options',
	type: 'icon', icon: 'tasks',
	width: 30,	//height: 30,
	on:{
		'onItemClick': function() { 
		  if($$('multiviewRight').isVisible()) {
		    $$('multiviewRight').hide();
		  } else {
		    $$('multiviewRight').show();
		  }	
		}
	}	
};

var searchHeader_Master = {
	view:'search', id: 'searchHeader_Master',
	placeholder:'Найти тут всё...'
};

App.Frame.toolbarHeader = {
	view:'toolbar', id: 'toolbarHeader',
	//height:32, //maxWidth:App.WinSize.windowWidth / 100 * 80,
	elements:[toggleHeader_Menu,
	          labelHeader_InTask,
	          searchHeader_Master,
	          //{},
	          toggleHeader_Options
	         ]
};

var listSegments_SegmentsSelector = { 
  view:'list', id:'listSegments_SegmentsSelector', css:'mainSelector',
	borderless:true,  width:250, scroll:false,
	template:'#value#',
	type:{ height:40 },
	select:true,
	data:[
		{ id:'listitemSegmentsSelector_MyProfile', value:'Мой профиль', count:0 },
		{ id:'listitemSegmentsSelector_AllUsers', value:'Все пользователи', count:0 },
		{ id:'listitemSegmentsSelector_AllGroups', value:'Все группы', count:0 },
		{ id:'listitemSegmentsSelector_AllTasks', value:'Все задачи', count:0 },
		{ id:'listitemSegmentsSelector_AllProjects', value:'Все проекты', count:0 },
		{ id:'listitemSegmentsSelector_Templates', value:'Шаблоны', count:0 },
		{ id:'listitemSegmentsSelector_Finances', value:'Финансы', count:0 },
		{ id:'listitemSegmentsSelector_Notes', value:'Заметки', count:0 },
		{ id:'listitemSegmentsSelector_Events', value:'События', count:1 },
		{ id:'listitemSegmentsSelector_Messages', value:'Сообщения', count:3 }
	],
	on:{"onAfterSelect": function(id){
    switch(id) {
      case 'listitemSegmentsSelector_MyProfile':
        App.Router.navigate('id' + App.State.user.get('id'), {trigger:true} );
        break;
      case 'listitemSegmentsSelector_AllUsers':
        App.Router.navigate('users', {trigger:true} );
        break;
      case 'listitemSegmentsSelector_AllGroups':
        App.Router.navigate('groups', {trigger:true} );
        break;
      case 'listitemSegmentsSelector_AllTasks':
        App.Router.navigate('tasks', {trigger:true} );
        break;
      case 'listitemSegmentsSelector_AllProjects':
        App.Router.navigate('projects', {trigger:true} );
        break;
      case 'listitemSegmentsSelector_Templates':
        App.Router.navigate('templates', {trigger:true} );
        break;
      case 'listitemSegmentsSelector_Finances':
        App.Router.navigate('finances', {trigger:true} );
        break;
      case 'listitemSegmentsSelector_Notes':
        App.Router.navigate('notes', {trigger:true} );
        break;
      case 'listitemSegmentsSelector_Events':
        App.Router.navigate('events', {trigger:true} );
        break;          
      case 'listitemSegmentsSelector_Messages':
        App.Router.navigate('messages', {trigger:true} );
        break;          
    }
	}}
};

var listSegments_OptionsSelector = {
  view:'list', id:'listSegments_OptionsSelector', css:'mainSelector',
	borderless:true,  width:250, scroll:false,
	template:'#value#',
	type:{ height:40 },
	select:true,
	data:[
		{ id:'listSegments_OptionsSelector_PersonalOptions', value:'Персональные настройки' },
		{ id:'listSegments_OptionsSelector_Exit', value:'Выйти' }
	],
	on:{"onAfterSelect": function(id){
    switch(id) {
      case 'listSegments_OptionsSelector_Exit':
      App.Router.navigate('logout', {trigger:true} );
      break;
    }
	}}
};

var scrollviewLeft_Segments = {
  view:'scrollview', id:'scrollviewLeft_Segments',
  borderless: true, scroll:'y', //vertical scrolling
  body:{
		multi:false,
		//view:'accordion',
		//type:'space',
		rows:[//{ body: 'Task pull', autoheight:true,  },
				  //{ view: 'resizer' },
		      { body: listSegments_SegmentsSelector },
		      { view: 'resizer' },
		      { body: listSegments_OptionsSelector }
		]
  }
};

App.Frame.multiviewLeft = {
  view:'multiview', id:'multiviewLeft',
	autowidth:true,
	borderless: false,
	cells:[scrollviewLeft_Segments]
};

//Фильтр в панели опции
var scrollviewRight_UsersFilter = {
  view:'scrollview', id:'scrollviewRight_UsersFilter', container:'scrollviewRight_UsersFilter',
  borderless: false, scroll:'y',
  $init: function(config) { },
  body:{
    rows:[
      { view:'template', template:'Пользователи', type:'section', align:'center' },
      { view:'checkbox', id:'checkboxUsersFilter_MyFriends', labelRight:'Мои друзья', labelWidth:10, value:0 },
      { view:'checkbox', id:'checkboxUsersFilter_Online', labelRight:'Сейчас на сайте', labelWidth:10, value:0 },
      { view:'template', template:'Регион', type:'section', align:'center' },
      { view:'combo', id:'comboUsersFilter_Country', suggest: 'suggestCountry', value:'Выбор страны', relatedView:'comboUsersFilter_City', relatedAction:'snow' },
      { view:'combo', id:'comboUsersFilter_City', suggest: 'suggestCity', value:'Выбор города', hidden:true },
      { view:'template', template:'Возраст', type:'section', align:'center' },
      { cols:[
        { view:'combo', id:'comboUsersFilter_Fromage', suggest: [{id:1, value: 'от'},{id:2, value:'от 14'}], value:'от' },
        {	view:'label', label:'-', width:10 },
        { view:'combo', id:'comboUsersFilter_Toage', suggest: [{id:1, value: 'до'},{id:2, value:'до 14'}], value:'до' }
      ]},
      { view:'template', template:'Пол', type:'section', align:'center' },
      { view:'radio', id:'radioUsersFilter_Gender', vertical:true, options:[{ value:'Любой', id:0 }, { value:'Мужской', id:1 }, { value:'Женский', id:2 }], value:0, autoheight:true },
      { view:'template', template:'Семейное положение', type:'section', align:'center' },
      { view:'richselect', id:'richselectUsersFilter_Familystatus', value:'Выбор статуса', yCount:3, options:'suggestFamilyStatus' }, {}
  ]}
};

//**************************************************************************************************
//USER permission bar
var _ignoreSaveUserPermission;
App.Func.loadUserPermission = function() {
  _ignoreSaveUserPermission = true;
  $$('richselectUserFilter_VisibleProfile').setValue(App.State.user.get('permissionVisibleProfile'));
  _ignoreSaveUserPermission = false;
};

var saveUserPermission = function(newv, oldv) {
  if(_ignoreSaveUserPermission) return;
  //получаем идентификатор разрешения в котором изменились данные
  var atrID = this.config.id;
  
  //произведем валидацию атрибута
  try {
    switch (atrID) {
      case 'richselectUserFilter_VisibleProfile':
        App.State.user.set('permissionVisibleProfile', newv);

        break;
      default:
        // code
    }
  } catch(e) {
    webix.message({type: 'error', text: e.message, expire: 10000});
    this.blockEvent();
    this.setValue(oldv);
    this.unblockEvent();
  }
};

var scrollviewRight_UserFilter = {
  view:'scrollview', id:'scrollviewRight_UserFilter',
  borderless: false, scroll:'y',
  $init: function(config) { },
  body:{
    rows:[
      { view:'template', template:'Видимость профиля', type:'section', align:'center' },
      { view:'richselect', id:'richselectUserFilter_VisibleProfile', options:[ {id:0, value: 'Только мне'}, {id:1, value: 'Только друзьям'}, {id:2, value: 'Всем'} ], on:{'onChange': saveUserPermission } }
    ]
  }
};

//**************************************************************************************************
//GROUPS filter bar
var scrollviewRight_GroupsFilter = {
  view:'scrollview', id:'scrollviewRight_GroupsFilter',
  borderless: false, scroll:'y',
  $init: function(config) { },
  body:{
    rows:[
      { view:'template', template:'Группы', type:'section', align:'center' }
    ]
  }
};

App.Frame.multiviewRight = {
  view:'multiview', id:'multiviewRight',
	width:250, animate: false,
  cells:[scrollviewRight_UsersFilter,
  scrollviewRight_UserFilter,
  scrollviewRight_GroupsFilter ]
};

//webix.protoUI({ name:"edittree"}, webix.EditAbility, webix.ui.tree);

//***************************************************************************
//GROUP frames
App.Frame.toolbarMyGroups_Groupstool = {
  view:'toolbar', id:'toolbarMyGroups_Groupstool',
  cols:[
    { view:'button', id:'buttonGroupstool_AddRoot', value:'Добавить основную', width:140, align:'left', 
      click: function() { App.State.groups.newGroup(0); } },
    { view:'button', id:'buttonGroupstool_Add', value:'Добавить', width:100, align:'left', 
      click: function() { App.State.groups.newGroup(App.State.groupstable_ItemSelected); } },
    { view:'button', id:'buttonGroupstool_Delete', value:'Удалить', width:100, align:'left', 
      click: function() {
        var selectedId = App.State.groupstable_ItemSelected;
        if (selectedId !== 0) {
          var firstModels = App.State.groups.findWhere( { parent_id: selectedId } );
          var text = '';
          if (typeof firstModels === 'undefined') {
            text = 'Вы пожелали удалить выбранную группу?';
          } else {
            text = 'Группа содержит другие группы, вы желаете удалить корневую группу вместе с потомками?';
          }

          webix.confirm({
            title:'Запрос на удаление группы',
            ok:'Да', 
            cancel:'Нет',
            type:'confirm-warning',
            text:text,
            callback: function(result) { 
              if (result) { App.State.groups.removeGroup(App.State.groupstable_ItemSelected); }
              }
          });
        }
      }
    },
    { view:'button', id:'buttonGroupstool_Up', value:'Вверх', width:100, align:'left', 
      click: function() { App.State.groups.moveGroup(App.State.groupstable_ItemSelected, 'up'); } },
    { view:'button', id:'buttonGroupstool_Down', value:'Вниз', width:100, align:'left', 
      click: function() { App.State.groups.moveGroup(App.State.groupstable_ItemSelected, 'down'); } },
    { view:'button', id:'buttonGroupstool_UpLevel', value:'На ур. вверх', width:100, align:'left', 
      click: function() { App.State.groups.moveGroup(App.State.groupstable_ItemSelected, 'uplevel'); } },
    { view:'button', id:'buttonGroupstool_DownLevel', value:'На ур. вниз', width:100, align:'left', 
      click: function() { App.State.groups.moveGroup(App.State.groupstable_ItemSelected, 'downlevel'); } },
    { }
  ]
};

App.Frame.treetableMyGroups_Groupstable = {
  view:'treetable', id:'treetableMyGroups_Groupstable',
	editable:true, 
	autoheight:true, 
	select: true,
	drag:true,
	columns:[
		{ id:'id', header:'', css:{'text-align':'center'}, width:40 },
		{ id:'name', editor:'text', header:'Имя групы', width:250, template:'{common.treetable()} #name#' },
		{ id:'numUsers', header:'Польз.', width:50 }
	],
	on: {
	  onItemClick: function() { App.State.groupstable_ItemSelected = this.getSelectedId().id; },
    onBeforeDrop: function(context, event) {
      var id_conf = context.to.config.id;
      if(id_conf === 'treetableMyGroups_Groupstable') {
        App.State.groups.moveGroup(context.start, 'jump', context.index, context.parent);
      }
  	 }
	},
	url: 'GroupData->load'
};

App.Frame.tabviewCentral_Groups = {
	view:'tabview', id:'tabviewCentral_Groups',
	autowidth: true,
	animate: true,
	tabbar : { optionWidth : 200 },
  cells:[
    {
      header:'Мои группы',
      body:{
        id:'frameGroups_Mygroups',
        rows:[
          App.Frame.toolbarMyGroups_Groupstool,
          App.Frame.treetableMyGroups_Groupstable]
      }
    }, 
    {
      header:'Общественные группы',
      body:{
        id:'frameGroups_Communitygroups',
        rows:[
          {}]        
      }
    }
  ]
};

//***************************************************************************
//TASK frames

App.Frame.toolbarMytasks_Tasktool = {
  view:'toolbar',
  id:'toolbarMytasks_Tasktool',
  cols:[
    { view:'button', id:'buttonTasktool_AddRoot', value:'Добавить основную', width:140, align:'left', 
      click: function() { App.State.tasks.newTask(0); } },
    { view:'button', id:'buttonTasktool_Add', value:'Добавить', width:100, align:'left', 
      click: function() { App.State.tasks.newTask(App.State.tasktable_ItemSelected); } },
    { view:'button', id:'buttonTasktool_Delete', value:'Удалить', width:100, align:'left', 
      click: function() {
        var selectedId = App.State.tasktable_ItemSelected;
        if (selectedId !== 0) {
          var firstModels = App.State.tasks.findWhere( { parent_id: selectedId } );
          var text = '';
          if (typeof firstModels === 'undefined') {
            text = 'Вы пожелали удалить выбранную задачу?';
          } else {
            text = 'Задача содержит подзадачи, вы желаете удалить корневую задачу вместе с потомками?';
          }

          webix.confirm({
            title:'Запрос на удаление задачи',
            ok:'Да', 
            cancel:'Нет',
            type:'confirm-warning',
            text:text,
            callback: function(result) { 
              if (result) { App.State.tasks.removeTask(App.State.tasktable_ItemSelected); }
              }
          });
        }
      }
    },
    { view:'button', id:'buttonTasktool_Up', value:'Вверх', width:100, align:'left', 
      click: function() { App.State.tasks.moveTask(App.State.tasktable_ItemSelected, 'up'); } },
    { view:'button', id:'buttonTasktool_Down', value:'Вниз', width:100, align:'left', 
      click: function() { App.State.tasks.moveTask(App.State.tasktable_ItemSelected, 'down'); } },
    { view:'button', id:'buttonTasktool_UpLevel', value:'На ур. вверх', width:100, align:'left', 
      click: function() { App.State.tasks.moveTask(App.State.tasktable_ItemSelected, 'uplevel'); } },
    { view:'button', id:'buttonTasktool_DownLevel', value:'На ур. вниз', width:100, align:'left', 
      click: function() { App.State.tasks.moveTask(App.State.tasktable_ItemSelected, 'downlevel'); } },
    { }
  ]
};

App.Frame.treetableMytasks_Tasktable = {
  id:'treetableMytasks_Tasktable',
	view:'treetable', 
	editable:true, 
	autoheight:true, 
	select: true,
	drag:true,
	columns:[
		{ id:'id', header:'', css:{'text-align':'center'}, width:40 },
		{ id:'description', editor:'text', header:'Описание задачи', width:250, template:'{common.treetable()} #description#' }
	],
	on: {
	  onItemClick:function() { App.State.tasktable_ItemSelected = this.getSelectedId().id; },
    onBeforeDrop:function(context, event) {
      var id_conf = context.to.config.id;
      if(id_conf === 'treetableMytasks_Tasktable') {
        App.State.tasks.moveTask(context.start, 'jump', context.index, context.parent);
      }
  	 }
	},
	url: 'TaskData->load'
};

App.Frame.tabviewCentral_Task = {
	view:'tabview', id:'tabviewCentral_Task',
	autowidth:true,
	animate:'true',
	tabbar : { optionWidth : 200 },
  cells:[
    {
     header:'Мои',
     body:{
        id:'frameTask_Mytasks',
        rows:[
          App.Frame.toolbarMytasks_Tasktool,
          App.Frame.treetableMytasks_Tasktable]
        }
    },
    {
     header:'Входящие',
     body:{
        id:'frameTask_Incomingtasks',
        rows:[
          {}]        
        }
    },
    {
     header:'Порученные',
     body:{
        id:'frameTask_Outcomingtasks',
        rows:[
          {}]        
        }
    }    
  ]
};

//***************************************************************************
//USER frames
var _ignoreSaveUserAttributes;
App.Func.loadUserAttributes = function() {
  var mydate = new Date();
  
  if($$('frameProfile_user').isVisible()) {
    mydate = strIsoToDate(App.State.user.get('dateofbirth'));
    $$('barProfile_user').data.value = App.State.viewedUser.get('username');
    $$('barProfile_user').refresh();
    
    $$('avatarProfile_user').setValues({src:'avtr'+App.State.user.get('id')+'.png'}, true);
    
    _ignoreSaveUserAttributes = true;
    $$('textUserAttributes_Name').setValue(App.State.user.get('username'));
    $$('textUserAttributes_Email').setValue(App.State.user.get('email'));
    $$('richselectUserAttributes_Country').setValue(App.State.user.get('country'));
    $$('richselectUserAttributes_City').setValue(App.State.user.get('city'));
    $$('datepickerUserAttributes_Dateofbirth').setValue(mydate);
    $$('radioUserAttributes_Gender').setValue(App.State.user.get('gender'));
    $$('richselectUserAttributes_Familystatus').setValue(App.State.user.get('familystatus'));
    _ignoreSaveUserAttributes = false;
  } else {
    mydate = strIsoToDate(App.State.user.get('dateofbirth'));
    $$('barProfile_vieweduser').data.value = App.State.viewedUser.get('username');
    $$('barProfile_vieweduser').refresh();
    
    $$('avatarProfile_vieweduser').setValues({src:'avtr'+App.State.viewedUser.get('id')+'.png'}, true);
    
    $$('labelviewedUserAttributes_Name').setValue(App.State.viewedUser.get('username'));
    $$('labelviewedUserAttributes_Email').setValue(App.State.viewedUser.get('email'));
    $$('labelviewedUserAttributes_Country').setValue($$('suggestCountry').getItemText(App.State.viewedUser.get('country')));
    $$('labelviewedUserAttributes_City').setValue($$('suggestCity').getItemText(App.State.viewedUser.get('city')));
    $$('labelviewedUserAttributes_Dateofbirth').setValue(mydate);
    if(App.State.viewedUser.get('gender') === 0) {
      $$('labelviewedUserAttributes_Gender').setValue('Пол не выбран');
    } else if(App.State.viewedUser.get('gender') === 1) {
      $$('labelviewedUserAttributes_Gender').setValue('Мужской');
    } else if(App.State.viewedUser.get('gender') === 2) {
      $$('labelviewedUserAttributes_Gender').setValue('Женский');
    }
    $$('labelviewedUserAttributes_Familystatus').setValue($$('suggestFamilyStatus').getItemText(App.State.viewedUser.get('familystatus')));
  }
};

var listProfile_UserAttributesSelector = {
  view:'list', id:'listProfile_UserAttributesSelector', css:'mainSelector',
	borderless:true,  width:250, scroll:false,
	template:'#value#',
	type:{ height:50 },
	select:true,
	data:[
		{ id:'listitemUserAtributesSelector_Users', value:'Друзья' },
		{ id:'listitemUserAtributesSelector_Groups',	value:'Группы' },
		{ id:'listitemUserAtributesSelector_Tasks',	value:'Задачи' },
		{ id:'listitemUserAtributesSelector_Projects',	value:'Проекты' },
		{ id:'listitemUserAtributesSelector_Tags',	value:'Теги' }
	],
	on:{'onAfterSelect': function(id) {
    switch(id) {
      case 'listitemUserAtributesSelector_Users':
        App.Router.navigate('users?id=' + App.State.segmentUserId, {trigger:true} );
        break;
      case 'listitemUserAtributesSelector_Groups':
        App.Router.navigate('groups', {trigger:true} );
        break;
      case 'listitemUserAtributesSelector_Tasks':
        App.Router.navigate('tasks', {trigger:true} );
        break;
      case 'listitemUserAtributesSelector_Projects':
        App.Router.navigate('projects', {trigger:true} );
        break;
      case 'listitemUserAtributesSelector_Tags':
        App.Router.navigate('tags', {trigger:true} );
        break;
      }
	  }
	}
};

var listProfile_viewedUserAttributesSelector = {
  view:'list', id:'listProfile_viewedUserAttributesSelector', css:'mainSelector',
	borderless:true,  width:250, scroll:false,
	template:'#value#',
	type:{ height:50 },
	select:true,
	data:[
		{ id:'listitemViewedUserAtributesSelector_Users', value:'Друзья' },
		{ id:'listitemViewedUserAtributesSelector_Groups',	value:'Группы' },
		{ id:'listitemViewedUserAtributesSelector_Tasks',	value:'Задачи' },
		{ id:'listitemViewedUserAtributesSelector_Projects',	value:'Проекты' },
		{ id:'listitemViewedUserAtributesSelector_Tags',	value:'Теги' }
	],
	on:{'onAfterSelect': function(id) {
    switch(id) {
      case 'listitemViewedUserAtributesSelector_Users':
        App.Router.navigate('users?id=' + App.State.segmentUserId, {trigger:true} );
        break;
      case 'listitemViewedUserAtributesSelector_Groups':
        App.Router.navigate('groups', {trigger:true} );
        break;
      case 'listitemViewedUserAtributesSelector_Tasks':
        App.Router.navigate('tasks', {trigger:true} );
        break;
      case 'listitemViewedUserAtributesSelector_Projects':
        App.Router.navigate('projects', {trigger:true} );
        break;
      case 'listitemViewedUserAtributesSelector_Tags':
        App.Router.navigate('tags', {trigger:true} );
        break;
      }
	  }
	}
};

var saveUserAttributes = function(newv, oldv) {
  if(_ignoreSaveUserAttributes) return;
  //получаем идентификатор атрибута в котором изменились данные
  var atrID = this.config.id;
  
  //произведем валидацию атрибута
  try {
    switch (atrID) {
      case 'textUserAttributes_Name':
        check(newv, 'Имя пользователя должно содержать от 1 до 20 символов').len(1, 20);
        check(newv, 'Такое имя пользователя не подходит').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
        
        App.State.user.set('username', newv);
        $$('barProfile_user').data.value = newv;
        $$('barProfile_user').refresh();

        break;
      case 'richselectUserAttributes_Country':
        App.State.user.set('country', newv);

        break;
      case 'richselectUserAttributes_City':
        App.State.user.set('city', newv);

        break;
      case 'richselectUserAttributes_Familystatus':
        App.State.user.set('familystatus', newv);

        break;
      case 'datepickerUserAttributes_Dateofbirth':
        App.State.user.set('dateofbirth', newv);

        break;
      case 'radioUserAttributes_Gender':
        App.State.user.set('gender', newv);

        break;
      default:
        // code
    }
  } catch(e) {
    webix.message({type: 'error', text: e.message, expire: 10000});
    this.blockEvent();
    this.setValue(oldv);
    this.unblockEvent();
  }
};

var scrollviewProfile_UserAttributes = {
  view:'scrollview', id:'scrollviewProfile_UserAttributes',
  borderless: true, scroll:'y',
  body:{
    rows:[
      { view:'template', template:'Персональные', type:'section', align:'center' },
      { view:'text', id:'textUserAttributes_Name', label:'Имя пользователя', labelWidth:150, on:{'onChange': saveUserAttributes } },
      { view:'text', id:'textUserAttributes_Email', label:'Email', labelWidth:150, disabled:true },
      { view:'richselect', id:'richselectUserAttributes_Country', label:'Страна', suggest: 'suggestCountry', labelWidth:150, on:{'onChange': saveUserAttributes } },
      { view:'richselect', id:'richselectUserAttributes_City', label:'Город', suggest: 'suggestCity', labelWidth:150, on:{'onChange': saveUserAttributes } },
      { view:'datepicker', id:'datepickerUserAttributes_Dateofbirth', stringResult:true, label:'Дата рождения', labelWidth:150, format:'%d %M %Y', on:{'onChange': saveUserAttributes } },
      { view:'radio', id:'radioUserAttributes_Gender', label:'Пол', vertical:true, options:[{ value:'Любой', id:0 }, { value:'Мужской', id:1 }, { value:'Женский', id:2 }], labelWidth:150, on:{'onChange': saveUserAttributes } },
      { view:'richselect', id:'richselectUserAttributes_Familystatus', label:'Семейное положение', suggest:'suggestFamilyStatus', labelWidth:150, on:{'onChange': saveUserAttributes } }
  ]}
};

var scrollviewProfile_viewedUserAttributes = {
  view:'scrollview', id:'scrollviewProfile_viewedUserAttributes',
  borderless: true, scroll:'y',
  body:{
    rows:[
      { view:'template', template:'Персональные', type:'section', align:'center' },
      { cols:[ { view:'label', label:'Имя пользователя', width:120}, {view:'label', id:'labelviewedUserAttributes_Name'}] },
      { cols:[ { view:'label', label:'Email', width:120}, {view:'label', id:'labelviewedUserAttributes_Email'}] },
      { cols:[ { view:'label', label:'Страна', width:120}, {view:'label', id:'labelviewedUserAttributes_Country'}] },
      { cols:[ { view:'label', label:'Город', width:120}, {view:'label', id:'labelviewedUserAttributes_City'}] },
      { cols:[ { view:'label', label:'Дата рождения', width:120}, {view:'label', id:'labelviewedUserAttributes_Dateofbirth'}] },
      { cols:[ { view:'label', label:'Пол', width:120}, {view:'label', id:'labelviewedUserAttributes_Gender'}] },
      { cols:[ { view:'label', label:'Семейное положение', width:120}, {view:'label', id:'labelviewedUserAttributes_Familystatus'}] }
  ]}
};

var frameProfile_user = {
  id: 'frameProfile_user',
  rows:[
    { view:'template', id:'barProfile_user', template:'#value#', type:'header', align:'center', data: { value: '' } },
    { height:3 },
    { cols:[
      { rows: [
        { view:'template', id:'avatarProfile_user', width:250, height:250, borderless:true, template:function(obj) {
          return '<div class="frAv"><img src="img/avatars/200/'+obj.src+'"></div>';
        }, onClick: { frAv: function(e, id) { webix.message('Заглушка для выбора аватарки'); return false;//blocks default onclick event
        } } },
        { height:10 },
        listProfile_UserAttributesSelector
      ]},
      { width:10 },
      scrollviewProfile_UserAttributes
    ]}
  ]
};

var frameProfile_viewedUser = {
  id: 'frameProfile_viewedUser',
  rows:[
    { view:'template', id:'barProfile_vieweduser', template:'#value#', type:'header', align:'center', data: { value: '' } },
    { height:3 },
    { cols:[
      { rows: [
        { view:'template', id:'avatarProfile_vieweduser', width:250, height:250, borderless:true, template:function(obj) {
          return '<img src="img/avatars/200/'+obj.src+'">';
        } },
        { height:10 },
        listProfile_viewedUserAttributesSelector
      ]},
      { width:10 },
      scrollviewProfile_viewedUserAttributes
    ]}
  ]
};

var frameUser_Profile = {
  view:'multiview', id:'frameUser_Profile', container:'frameUser_Profile',
  borderless:false, animate:false,
  cells:[ frameProfile_user, frameProfile_viewedUser]
};

var frameUser_Albums = {
  id:'frameUser_Albums',
  rows:[
    {},
    {
      cols:[
      {},
      { view:'template', template:'albums', type:'header', align:'center' },
      {}
      ]
    },
    {}
  ]
};

var frameUser_Achievements = {
  id:'frameUser_Achievements',
  rows:[
    {},
    {
      cols:[
      {},
      { view:'template', template:'achievements', type:'header', align:'center' },
      {}
      ]
    },
    {}
  ]
};

var frameUser_Events = {
  id:'frameUser_Events',
  rows:[
    {},
    {
      cols:[
      {},
      { view:'template', template:'events', type:'header', align:'center' },
      {}
      ]
    },
    {}
  ]
};

var frameUser_Message = {
  id:'frameUser_Message',
  rows:[
    {},
    {
      cols:[
      {},
      { view:'template', template:'message', type:'header', align:'center' },
      {}
      ]
    },
    {}
  ]
};

App.Frame.tabviewCentral_User = {
  view:'tabview', id:'tabviewCentral_User',
  autoheight:true, autowidth:true,
  animate:true,
  tabbar : { optionWidth : 200 },
  cells:[
    {
      header: 'Профиль',
      body: frameUser_Profile
    },
    {
      header: 'Альбомы',
      body: frameUser_Albums
    },
    {
      header: 'Достижения',
      body: frameUser_Achievements
    },
    {
      header: 'События',
      body: frameUser_Events
    },
    {
      header: 'Сообщения',
      body: frameUser_Message
    },    
  ]
};

var UserRout = function(id) {
  App.Router.navigate('id' + id, {trigger: true});
};

var addUserResponse = function(text, data) {
  
};

var addUserFriend = function(id) {
  var promise = webix.ajax().put('api/v1/userlist', { addedUserId: id }, addUserResponse);
  promise.then(function(realdata){}).fail(function(err) {
    //$$('frameCentralRegister_authenticateError').setValues({ src:err.responseText });
  });
};

var dataviewCentral_Users = {
  view:'dataview', id:'dataviewCentral_Users',
  borderless:true, scroll:'y', xCount:1,
  type:{ height:110, width:450 },
  //template:'html->dataviewCentral_Users_template',
  template:function(obj) {
    var htmlCode = '<div class="friend_avatar"><img src="/img/avatars/100/'+obj.img+'"/></div>';
    htmlCode = htmlCode + '<div class="friend_info"><a href="javascript:UserRout('+obj.id+')">'+obj.username+'</a>';
    htmlCode = htmlCode + '<div><span>Email:</span>'+obj.email+'</div></div>';
    htmlCode = htmlCode + '<button onclick="addUserFriend('+obj.id+');">Добавить в друзья</button>';
    //'<a href="javascript:webix.message(0)"  class="select_link">'+'Добавить в друзья'+'</a>';
    //<input type="button" value="Set form" onclick="set_form();" />

    return htmlCode;
  },
	//select:1,
	datafetch:3,
	autowidth:true,
	on:{
	  'onItemDblClick': function(id, e, node) {
      //var item = this.getItem(id);
      App.Router.navigate('id' + id, {trigger: true});
    }
	}
};

var labelToolbarCentral_Users = {
	view: 'label', id:'labelToolbarCentral_Users',
	width:100,
	label:'Назад',
	on:{
		'onItemClick': function() { 
		  App.Router.navigate('home', {trigger:true} ); 
		}
	}
};

var toolbarCentral_Users = {
	view:'toolbar', id: 'toolbarCentral_Users',
	height:32,
	elements:[{}, labelToolbarCentral_Users]
};

App.Frame.frameCentral_Users = {
  id:'frameCentral_Users',
  autoheight:true, autowidth:true,
  cols:[
    {},
    { rows:[toolbarCentral_Users, dataviewCentral_Users] },
    {}
  ]
};

//**************************************************************************************************
//OTHER frames
var reglogResponse = function(text, data) {
  //App.State.user.set({'usrLogged': true}, {silent: true});
  //App.State.user.set({'id': data.json().id}, {silent: true});
  App.Router.navigate('id' + data.json().id, {trigger: true});
};

App.Func.Register = function() {
  var email = $$('textRegistration_Email').getValue();
  var swd = $$('textRegistration_Password').getValue();
  var uname = $$('textRegistration_Username').getValue();
  try {
    check(uname, 'Имя пользователя должно содержать от 1 до 20 символов').len(1, 20);
    check(uname, 'Такое имя пользователя не подходит').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
    check(email, 'Ваш email не корректен, попробуйте ввести повторно').len(4,64).isEmail();
    check(swd, 'Пароль должен быть не короче 5 и не длиннее 60 символов').len(5, 60);
  } catch (e) {
    $$('frameCentralRegister_authenticateError').setValues({ src:e.message });
    return;
  }

  var promise = webix.ajax().post('api/v1/register', { email: email, username: uname, password: swd }, reglogResponse);
  promise.then(function(realdata){}).fail(function(err) {
    $$('frameCentralRegister_authenticateError').setValues({ src:err.responseText });
  });
};

App.Func.Login = function() {
  var email = $$('textLogin_Email').getValue();
  var swd = $$('textLogin_Password').getValue();
  try {
    check(email, 'Ваш email не корректен, попробуйте ввести повторно').len(4,64).isEmail();
    check(swd, 'Пароль должен быть не короче 5 и не длиннее 60 символов').len(5, 60);
  } catch (e) {
    $$('frameCentralLogin_authenticateError').setValues({src:e.message});
    return;
  }
  
  var promise = webix.ajax().post('api/v1/login', { email: email, password: swd }, reglogResponse);
  promise.then(function(realdata){}).fail(function(err) {
    $$('frameCentralLogin_authenticateError').setValues({src:err.responseText});
  });
};

var formRegistration = {
  view:'form', id:'formRegistration',
  width:350,
  elements:[
    { view:'template', template:'Регистрация', type:'header', align:'center' },
    { view:'text', id:'textRegistration_Email', label:'Email' },
    { view:'text', id:'textRegistration_Username', label:'Имя' },
    { view:'text', id:'textRegistration_Password', type:'password', label:'Пароль' },
    { margin:5, cols:[
      { view:'button', id:'buttonRegistration_Enter', value:'Зарегистрировать', type:'form', click: App.Func.Register },
      { view:'button', id:'buttonRegistration_Cancel', value:'Отменить', click: function() { App.Router.navigate('', {trigger: true} ); } }
    ]}          
  ]
};

var formLogin = {
  view:'form', id:'formLogin',
  width:350,
  elements:[
    { view:'template', template:'Вход', type:'header', align:'center' },
    { view:'text', id:'textLogin_Email', label:'Email', placeholder:'email@email.me' },
    { view:'text', id:'textLogin_Password', type:'password', label:'Пароль' },
    { margin:5, cols:[
      { view:'button', id:'buttonLogin_Enter', value:'Войти', type:'form', click: App.Func.Login },
      { view:'button', id:'buttonLogin_Cancel', value:'Отменить', click: function() { App.Router.navigate('', {trigger: true} ); } }
    ]}          
  ]
};

App.Frame.frameCentral_Register = {
  id:'frameCentral_Register',
  autoheight:true, autowidth:true,
  rows:[
    {},
    {
      cols:[
      {},
      formRegistration,
      {}
      ]
    },
    { height:5 },
    { cols:[
      {},
      { view:'template', id:'frameCentralRegister_authenticateError', borderless:true, autoheight: true, width:350, 
        data:{ src:'' }, css:'authenticateError', template:function(obj) {
          return '<span>'+obj.src+'</span>'; 
        } 
      },
      {}
      ]
    },
    {}
  ]
};

App.Frame.frameCentral_Login = {
  id:'frameCentral_Login',
  autoheight:true, autowidth:true,
  rows:[
    {},
    {
      cols:[
      {},
      formLogin,
      {}
      ]
    },
    { height:5 },
    { cols:[
      {},
      { view:'template', id:'frameCentralLogin_authenticateError', borderless:true, autoheight:true, width:350, 
        data:{ src:'' }, css:'authenticateError', template:function(obj) {
          return '<span>'+obj.src+'</span>'; 
        } 
      },
      {}
      ]
    },
    {}
  ]
};

App.Frame.frameCentral_Greeting = {
  id:'frameCentral_Greeting', container:'frameCentral_Greeting',
  view:'htmlform',
  template: 'http->greeting.html'
};

App.Frame.frameBlank = {
  id:'frameBlank'
};

App.Frame.toolbarAutorisation = {
	view:'toolbar', id: 'toolbarAutorisation',
	//height:32, 
	elements:[{ view:'toggle', type:'icon', icon:'bars', width:30, height:30, disabled:true },
	          { view: 'label', label:'InTask.me', width:100 },
	          {},
	          { view:'button', id:'buttonAutorisationLogin', label:'Войти', type:'icon', icon:'sign-in', width: 100, 
	            on:{ 'onItemClick': function(){ App.Router.navigate('login', {trigger:true} ); } } },
	          { view:'button', id:'buttonAutorisationRegister', label:'Регистрация', type:'icon', icon:'user', width: 120,
	            on:{ 'onItemClick': function() { App.Router.navigate('register', {trigger:true} ); } } },
	          {},
	          { width: 100 },
	          { view:'toggle', type:'icon', icon:'tasks',	width:30,	height:30, disabled:true }]
};

App.Frame.multiviewToolbar = {
  view:'multiview', id:'multiviewToolbar', container:'multiviewToolbar',
  cells:[App.Frame.toolbarAutorisation, App.Frame.toolbarHeader],
  animate:false
};

// App.Frame.naviBar = {
//   id:'naviBar',
//   width:70,
//   rows:[{ view:'label', label:'Назад' }, {}],
//   visible:false
// };

App.Frame.multiviewCentral = {
  view:'multiview', id:'multiviewCentral', container:'multiviewCentral',
  cells:[App.Frame.frameBlank,
    App.Frame.frameCentral_Greeting,
    App.Frame.tabviewCentral_Groups,
    App.Frame.tabviewCentral_Task,
    App.Frame.frameCentral_Register,
    App.Frame.frameCentral_Login,
    App.Frame.tabviewCentral_User,
    App.Frame.frameCentral_Users],
  fitBiggest:true,
  animate:false
};