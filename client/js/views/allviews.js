var App = window.App;
var webix = window.webix;

var toggleHeader_Menu = {
	view:'toggle', id:'toggleHeader_Menu',
	type:'icon', icon:'bars', 
	width:30,	height:30,
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
	width: 30,	height: 30,
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
	view:"toolbar", id: 'toolbarHeader',
	height:32, maxWidth:App.WinSize.windowWidth / 100 * 80,
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
  borderless: false, scroll:"y",
  $init: function(config) { },
  body:{
    rows:[
      { view:'template', template:'Пользователи', type:'section', align:'center' },
      { view:'checkbox', id:'checkboxUserFilter_MyFriends', labelRight:'Мои друзья', labelWidth:10, value:0 },
      { view:'checkbox', id:'checkboxUserFilter_Online', labelRight:'Сейчас на сайте', labelWidth:10, value:0 },
      { view:'template', template:'Регион', type:'section', align:'center' },
      { view:'combo', id:'comboUserFilter_Country', suggest: 'suggestCountry', value:'Выбор страны', relatedView:'comboUserFilter_City', relatedAction:'snow' },
      { view:'combo', id:'comboUserFilter_City', suggest: 'suggestCity', value:'Выбор города', hidden:true },
      { view:'template', template:'Возраст', type:'section', align:'center' },
      { cols:[
        { view:'combo', id:'comboUserFilter_Fromage', suggest: [{id:1, value: 'от'},{id:2, value:'от 14'}], value:'от' },
        {	view:'label', label:'-', width:10 },
        { view:'combo', id:'comboUserFilter_Toage', suggest: [{id:1, value: 'до'},{id:2, value:'до 14'}], value:'до' }
      ]},
      { view:'template', template:'Пол', type:'section', align:'center' },
      { view:'radio', id:'radioUserFilter_Gender', vertical:true, options:[{ value:'Любой', id:0 }, { value:'Мужской', id:1 }, { value:'Женский', id:2 }], value:0, autoheight:true },
      { view:'template', template:'Семейное положение', type:'section', align:'center' },
      { view:'richselect', id:'richselectUserFilter_Familystatus', value:'Выбор статуса', yCount:3, options:'suggestFamilyStatus' }, {}
  ]}
};

var scrollviewRight_UserFilter = {
  view:'scrollview', id:'scrollviewRight_UserFilter',
  borderless: false, scroll:"y",
  $init: function(config) { },
  body:{
    rows:[
      { view:'template', template:'Пользователь', type:'section', align:'center' }
    ]
  }
};

var scrollviewRight_GroupsFilter = {
  view:'scrollview', id:'scrollviewRight_GroupsFilter',
  borderless: false, scroll:"y",
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
		{ id:'name', editor:"text", header:'Имя групы', width:250, template:'{common.treetable()} #name#' },
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
		{ id:'id', header:'', css:{"text-align":"center"}, width:40 },
		{ id:'description', editor:"text", header:'Описание задачи', width:250, template:'{common.treetable()} #description#' }
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
	url: "TaskData->load"
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

App.Func.fillUserAttributes = function() {
  if($$('frameProfile_user').isVisible()) {
    $$('barProfile_user').data.value = App.State.viewedUser.get('username');
    $$('barProfile_user').refresh();
    
    $$('textUserAttributes_Name').setValue(App.State.user.get('username'));
    $$('textUserAttributes_Email').setValue(App.State.user.get('email'));
    $$('comboUserAttributes_Country').setValue(App.State.user.get('country'));
    $$('comboUserAttributes_City').setValue(App.State.user.get('city'));
    $$('datepickerUserAttributes_Dateofbirth').setValue(webix.i18n.dateFormatStr(App.State.user.get('dateofbirth')));
    $$('radioUserAttributes_Gender').setValue(App.State.user.get('gender'));
    $$('richselectUserAttributes_Familystatus').setValue(App.State.user.get('familystatus'));
  } else {
    $$('barProfile_vieweduser').data.value = App.State.viewedUser.get('username');
    $$('barProfile_vieweduser').refresh();
    
    $$('labelviewedUserAttributes_Name').setValue(App.State.viewedUser.get('username'));
    $$('labelviewedUserAttributes_Email').setValue(App.State.viewedUser.get('email'));
    $$('labelviewedUserAttributes_Country').setValue(App.State.viewedUser.get('country'));
    $$('labelviewedUserAttributes_City').setValue(App.State.viewedUser.get('city'));
    $$('labelviewedUserAttributes_Dateofbirth').setValue(webix.i18n.dateFormatStr(App.State.viewedUser.get('dateofbirth')));
    $$('labelviewedUserAttributes_Gender').setValue(App.State.viewedUser.get('gender'));
    $$('labelviewedUserAttributes_Familystatus').setValue(App.State.viewedUser.get('familystatus'));
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
	on:{"onAfterSelect": function(id) {
    switch(id) {
      case 'listitemUserAtributesSelector_Users':
        App.Router.navigate('users', {trigger:true} );
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
	on:{"onAfterSelect": function(id) {
    switch(id) {
      case 'listitemViewedUserAtributesSelector_Users':
        App.Router.navigate('users', {trigger:true} );
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

var scrollviewProfile_UserAttributes = {
  view:'scrollview', id:'scrollviewProfile_UserAttributes',
  borderless: true, scroll:'y', //vertical scrolling
  body:{
    rows:[
      { view:'template', template:'Персональные', type:'section', align:'center' },
      { view:'text', id:'textUserAttributes_Name', label:'Имя пользователя', labelWidth:120, on:{'onChange': function() { App.State.user.set('username', this.getValue()) } } },
      { view:'text', id:'textUserAttributes_Email', label:'Email', labelWidth:120, on:{'onChange': function() { App.State.user.set('email', this.getValue()) } } },
      { view:'combo', id:'comboUserAttributes_Country', label:"Страна", suggest: 'suggestCountry', labelWidth:120 },
      { view:'combo', id:'comboUserAttributes_City', label:'Город', suggest: 'suggestCity', labelWidth:120 },
      { view:'datepicker', id:'datepickerUserAttributes_Dateofbirth', label:'Дата рождения', labelWidth:120 },
      { view:"radio", id:'radioUserAttributes_Gender', label:'Пол', vertical:true, options:[{ value:"Любой", id:0 }, { value:"Мужской", id:1 }, { value:"Женский", id:2 }], labelWidth:120 },
      { view:'richselect', id:'richselectUserAttributes_Familystatus', label:'Семейное положение', suggest:'suggestFamilyStatus', labelWidth:120 }
  ]}
};

var scrollviewProfile_viewedUserAttributes = {
  view:'scrollview', id:'scrollviewProfile_viewedUserAttributes',
  borderless: true, scroll:'y', //vertical scrolling
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
        { view:'template', template:"<img src='img/avatars/2.png'>", width:250, height:250, borderless:true },
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
        { view:'template', template:"<img src='img/avatars/2.png'>", width:250, height:250, borderless:true },
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

var dataviewCentral_Users = {
  view:'dataview', id:'dataviewCentral_Users',
  borderless:false, scroll:'y', xCount:1,
  type:{ height: 80, width:450 },
  template:'html->dataviewCentral_Users_template',
	//select:1,
	autowidth:true,
	url:'api/userlist'
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
	view:"toolbar", id: 'toolbarCentral_Users',
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
  var promise = webix.ajax().post('api/register', { email:$$('textRegistration_Email').getValue(), 
	                                                  username:$$('textRegistration_Username').getValue(), 
	                                                  password:$$('textRegistration_Password').getValue()}, reglogResponse);
	        
  promise.then(function(realdata){}).fail(function(err) {
    webix.message({type:"error", text:err.responseText});
  });
};

App.Func.Login = function() {
  var promise = webix.ajax().post('api/login', { email:$$('textLogin_Email').getValue(), 
	                                               password:$$('textLogin_Password').getValue()}, reglogResponse);
	        
  promise.then(function(realdata){}).fail(function(err){
    webix.message({type:"error", text:err.responseText});
  });
};

var formRegistration = {
  view:'form', id:'formRegistration',
  width:350,
  elements:[
    { view:'template', template:'Регистрация', type:'header', align:'center' },
    { view:'text', id:'textRegistration_Email', label:'Email' },
    { view:'text', id:'textRegistration_Username', label:'Имя пользователя' },
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
    { view:'template', template:'login', type:'header', align:'center' },
    { view:'text', id:'textLogin_Email', label:'Email' },
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
    {}
  ]
};

App.Frame.frameCentral_Greeting = {
  id:'frameCentral_Greeting', container:'frameCentral_Greeting',
  rows:[
  {
    view:'htmlform',
    template: 'http->greeting.html'
  },
  { 
    cols:[{},
    {
      view:'button', id:'buttonGreeting_Try',
	    height: 45, width: 100,
	    value:'Попробовать',
	    on:{ 'onItemClick':function() { App.State.user.set({'thisTry': true}); } }
    },
    {
      view:"button", id:"buttonGreeting_Register",
      height: 45, width: 130,
	    value:"Зарегистрировать",
	    on:{ 'onItemClick': function() { App.Router.navigate('register', {trigger:true} ); } }
    },
    {
      view:"button", id:"buttonGreeting_Login",
	    height: 45, width: 100,
	    value:"Войти",
	    on:{ 'onItemClick': function(){ App.Router.navigate('login', {trigger:true} ); } }
    }, {}]
  }
  ]
};

App.Frame.frameBlank = {
  id:'frameBlank'
};

App.Frame.multiviewCentral = {
  view:"multiview", id:'multiviewCentral', container:'multiviewCentral',
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