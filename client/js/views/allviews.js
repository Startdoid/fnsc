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
		    $$('listSegments_SegmentsSelector').select('listitemSegmentsSelector_MyProfile');
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

var menuHeader_Settings = {
	view:'menu', id:'menuHeader_Settings',
	width:35,
	borderless: true,
	align:'right',
  data:[
    { id:'1', value: 'Настройки', submenu:[
    	{id: '1.1', value: 'Персональные настройки'},
    	{id: '1.2', value: 'Регистрация'},
      {id: '1.3', value: 'Сменить учетную запись'},
      {id: '1.4', value: 'Выйти'}]},
  ],
  on:{
        onMenuItemClick:function(id) {
          switch(id) {
            case '1.4':
              App.Router.navigate('logout', {trigger:true} );
              break;
          }
        }
      },
  template:function(obj) {
    return "<span class='webix_icon fa-cogs'"+obj.value+"</span>";
  }
};

var toggleHeader_User = {
	view: 'toggle', id: 'toggleHeader_User',
	type: 'icon', icon: 'group',
	width: 30,	height: 30,
	on:{
		'onItemClick': function() { 
		  if($$('frameUserList').isVisible()) {
		    $$('frameUserList').hide();
		  } else {
		    $$('frameUserList').show();
		    //$$("scrollviewRight_UserFilter").show();
		  }	
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
		    $$('scrollviewRight_UserFilter').show();
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
	          toggleHeader_User,
	          toggleHeader_Options,
	          menuHeader_Settings
	         ]
};

var listSegments_SegmentsSelector = { 
  view:'list', id:'listSegments_SegmentsSelector', css:'mainSelector',
	borderless:true,  width:250, scroll:true,
	template:'#value#',
	type:{ height:50 },
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
        App.State.segment = 'users';//profile
        App.Router.navigate('users', {trigger:true} );
        break;
      case 'listitemSegmentsSelector_AllUsers':
        App.State.segment = 'users';
        App.Router.navigate('users', {trigger:true} );
        break;
      case 'listitemSegmentsSelector_AllGroups':
        App.State.segment = 'groups';
        App.Router.navigate('groups', {trigger:true} );
        break;
      case 'listitemSegmentsSelector_AllTasks':
        App.State.segment = 'tasks';
        App.Router.navigate('tasks', {trigger:true} );
        break;
      case 'listitemSegmentsSelector_AllProjects':
        App.State.segment = 'projects';
        break;
      case 'listitemSegmentsSelector_Templates':
        App.State.segment = 'templates';
        break;
      case 'listitemSegmentsSelector_Finances':
        App.State.segment = 'finances';
        break;
      case 'listitemSegmentsSelector_Notes':
        App.State.segment = 'notes';
        break;
      case 'listitemSegmentsSelector_Events':
        App.State.segment = 'events';
        break;          
      case 'listitemSegmentsSelector_Messages':
        App.State.segment = 'messages';
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
		type:'space',
		rows:[{ body: 'Task pull' },
				  { view: 'resizer' },
		      { body: listSegments_SegmentsSelector }
		]
  }
};

App.Frame.multiviewLeft = {
  view:'multiview', id:'multiviewLeft',
	width:250,
	borderless: false,
	cells:[scrollviewLeft_Segments]
};

//Фильтр в панели опции
var scrollviewRight_UserFilter = {
  view:'scrollview', id:'scrollviewRight_UserFilter', container:'scrollviewRight_UserFilter',
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

var frameRight_views_groups = {
  
};

var frameRight_views_tasks = {
  
};

App.Frame.multiviewRight = {
  view:'multiview', id:'multiviewRight',
	width:250,
  cells:[scrollviewRight_UserFilter,
  frameRight_views_groups,
  frameRight_views_tasks ]
};

App.Frame.frameUserList = {
  view:'dataview', id:'frameUserList',
  width:300,
  borderless:false, scroll:'y',  xCount:1,
  type:{ height: 80, width:300 },
  template:'html->frameUserList_template',
	//select:1,
	autowidth:true,
	url:'api/userlist'
};

//webix.protoUI({ name:"edittree"}, webix.EditAbility, webix.ui.tree);

//***************************************************************************
//GROUP frames

App.Frame.toolbarMyGroups_Groupstool = {
  view:'toolbar', id:'toolbarMyGroups_Groupstool',
  cols:[
    { view:'button', id:'buttonGroupstool_AddRoot', value:'Добавить основную', width:140, align:'left', 
      click: function() { App.Collections.Groups.newGroup(0); } },
    { view:'button', id:'buttonGroupstool_Add', value:'Добавить', width:100, align:'left', 
      click: function() { App.Collections.Groups.newGroup(App.State.groupstable_ItemSelected); } },
    { view:'button', id:'buttonGroupstool_Delete', value:'Удалить', width:100, align:'left', 
      click: function() {
        var selectedId = App.State.groupstable_ItemSelected;
        if (selectedId !== 0) {
          var firstModels = App.Collections.Groups.findWhere( { parent_id: selectedId } );
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
              if (result) { App.Collections.Groups.removeGroup(App.State.groupstable_ItemSelected); }
              }
          });
        }
      }
    },
    { view:'button', id:'buttonGroupstool_Up', value:'Вверх', width:100, align:'left', 
      click: function() { App.Collections.Groups.moveGroup(App.State.groupstable_ItemSelected, 'up'); } },
    { view:'button', id:'buttonGroupstool_Down', value:'Вниз', width:100, align:'left', 
      click: function() { App.Collections.Groups.moveGroup(App.State.groupstable_ItemSelected, 'down'); } },
    { view:'button', id:'buttonGroupstool_UpLevel', value:'На ур. вверх', width:100, align:'left', 
      click: function() { App.Collections.Groups.moveGroup(App.State.groupstable_ItemSelected, 'uplevel'); } },
    { view:'button', id:'buttonGroupstool_DownLevel', value:'На ур. вниз', width:100, align:'left', 
      click: function() { App.Collections.Groups.moveGroup(App.State.groupstable_ItemSelected, 'downlevel'); } },
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
        App.Collections.Groups.moveGroup(context.start, 'jump', context.index, context.parent);
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
      click: function() { App.Collections.Tasks.newTask(0); } },
    { view:'button', id:'buttonTasktool_Add', value:'Добавить', width:100, align:'left', 
      click: function() { App.Collections.Tasks.newTask(App.State.tasktable_ItemSelected); } },
    { view:'button', id:'buttonTasktool_Delete', value:'Удалить', width:100, align:'left', 
      click: function() {
        var selectedId = App.State.tasktable_ItemSelected;
        if (selectedId !== 0) {
          var firstModels = App.Collections.Tasks.findWhere( { parent_id: selectedId } );
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
              if (result) { App.Collections.Tasks.removeTask(App.State.tasktable_ItemSelected); }
              }
          });
        }
      }
    },
    { view:'button', id:'buttonTasktool_Up', value:'Вверх', width:100, align:'left', 
      click: function() { App.Collections.Tasks.moveTask(App.State.tasktable_ItemSelected, 'up'); } },
    { view:'button', id:'buttonTasktool_Down', value:'Вниз', width:100, align:'left', 
      click: function() { App.Collections.Tasks.moveTask(App.State.tasktable_ItemSelected, 'down'); } },
    { view:'button', id:'buttonTasktool_UpLevel', value:'На ур. вверх', width:100, align:'left', 
      click: function() { App.Collections.Tasks.moveTask(App.State.tasktable_ItemSelected, 'uplevel'); } },
    { view:'button', id:'buttonTasktool_DownLevel', value:'На ур. вниз', width:100, align:'left', 
      click: function() { App.Collections.Tasks.moveTask(App.State.tasktable_ItemSelected, 'downlevel'); } },
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
        App.Collections.Tasks.moveTask(context.start, 'jump', context.index, context.parent);
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

App.Func.fillUserAttributes = function(user_id) {
  if(user_id === App.User.get('id')) {
    $$('textUserAttributes_Name').setValue(App.User.get('username'));
    $$('textUserAttributes_Email').setValue(App.User.get('email'));
    $$('comboUserAttributes_Country').setValue(App.User.get('country'));
    $$('comboUserAttributes_City').setValue(App.User.get('city'));
    $$('datepickerUserAttributes_Dateofbirth').setValue(webix.i18n.dateFormatStr(App.User.get('dateofbirth')));
    $$('radioUserAttributes_Gender').setValue(App.User.get('gender'));
    $$('richselectUserAttributes_Familystatus').setValue(App.User.get('familystatus'));
  }
};

var listProfile_UserAttributesSelector = {
  view:'list', id:'listProfile_UserAttributesSelector', css:'mainSelector',
	borderless:true,  width:250, scroll:false,
	template:'#value#',
	type:{ height:50 },
	select:true,
	data:[
		{ id:'all', 		value:'Все', count:0 },
		{ id:'personal',	value:'Персональные', count:0 }
	]
	//on:{"onAfterSelect": function(){
		//app.trigger("filterIssues");
	//}
};

var scrollviewProfile_UserAttributes = {
  view:"scrollview", id:"scrollviewProfile_UserAttributes",
  borderless: true, scroll:"y", //vertical scrolling
  body:{
    rows:[
      { view:'template', template:'Персональные', type:'section', align:'center' },
      { view:'text', id:'textUserAttributes_Name', label:'Имя пользователя', labelWidth:120, on:{'onChange': function() { App.User.set('username', this.getValue()) } } },
      { view:'text', id:'textUserAttributes_Email', label:'Email', labelWidth:120, on:{'onChange': function() { App.User.set('email', this.getValue()) } } },
      { view:'combo', id:'comboUserAttributes_Country', label:"Страна", suggest: 'suggestCountry', labelWidth:120 },
      { view:'combo', id:'comboUserAttributes_City', label:'Город', suggest: 'suggestCity', labelWidth:120 },
      { view:'datepicker', id:'datepickerUserAttributes_Dateofbirth', label:'Дата рождения', labelWidth:120 },
      { view:"radio", id:'radioUserAttributes_Gender', label:'Пол', vertical:true, options:[{ value:"Любой", id:0 }, { value:"Мужской", id:1 }, { value:"Женский", id:2 }], labelWidth:120 },
      { view:'richselect', id:'richselectUserAttributes_Familystatus', label:'Семейное положение', suggest:'suggestFamilyStatus', labelWidth:120 }
  ]}
};

var frameUser_Profile = {
  id:'frameUser_Profile',
  borderless:false,
  cols:[
    { rows:[
        { view:'template', template:'bru', type:'header', align:'center' },
        { cols:[
            { view:'template', template:"<img src='img/avatars/2.png'>", width: 250 },
            { width:10 },
            { view:'template', template:"carousel" }
          ], height:250
        },
        { height:10 },
        { cols:[
            listProfile_UserAttributesSelector,
            { width:10 },
            scrollviewProfile_UserAttributes
          ]
        },
      ]
    }
  ]  
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

//**************************************************************************************************
//OTHER frames
var reglogResponse = function(text, data) {
  App.User.set({'usrLogged': true}, {silent: true});
  App.User.set({'id': data.json().id}, {silent: true});
  App.Router.navigate('', {trigger: true});
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
	    on:{ 'onItemClick':function() { App.User.set({'thisTry': true}); } }
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

App.Frame.multiviewCentral = {
  view:"multiview", id:'multiviewCentral', container:'multiviewCentral',
  cells:[App.Frame.frameCentral_Greeting,
  App.Frame.tabviewCentral_Groups,
  App.Frame.tabviewCentral_Task,
  App.Frame.frameCentral_Register,
  App.Frame.frameCentral_Login,
  App.Frame.tabviewCentral_User],
  fitBiggest:true
};