var App = window.App;
var webix = window.webix;

var btnMenu = {
	view:"toggle", id:"btnMenu",
	type:"icon", icon:"bars", 
	width:30,	height:30,
	on:{
		'onItemClick': function() { 
		  if($$("leftframe").isVisible()) {
		    $$("leftframe").hide();
		  } else {
		    $$("leftframe").show();
		    $$("leftframe_views_slice").show();
		  }	
		}
	}
};

var lblInTask = {
	view: "label", id:"lblInTask",
	width:100,
	label:"InTask.me",
	on:{
		'onItemClick': function() { 
		  App.Router.navigate('home', {trigger:true} ); 
		}
	}
};

var mnuSettings = {
	view:'menu', id:'mnuSettings',
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

var btnUser = {
	view: 'toggle', id: 'btnUser',
	type: 'icon', icon: 'group',
	width: 30,	height: 30,
	on:{
		'onItemClick': function() { 
		  if($$("userlist").isVisible()) {
		    $$("userlist").hide();
		  } else {
		    $$("userlist").show();
		    //$$("rightframe_views_userprofile").show();
		  }	
		}
	}
	//label:"Чат",
	//align:"right",
	//value:0,
};

var btnOptions = {
	view: 'toggle',  id: 'btnOptions',
	type: 'icon', icon: 'tasks',
	width: 30,	height: 30,
	on:{
		'onItemClick': function() { 
		  if($$("rightframe").isVisible()) {
		    $$("rightframe").hide();
		  } else {
		    $$("rightframe").show();
		    $$("rightframe_views_userprofile").show();
		  }	
		}
	}	
	//label:"События",
	//value:0,
	//align:"right",
};

var mnuSegments = {
  view: 'richselect', id:'mnuSegments',
	width:300,
	label: 'Сегменты', labelAlign:'right',
	align:"left",
	value:1, options:[
		{ id:1, value:"Профиль" }, 
		{ id:2, value:"Группы" }, 
		{ id:3, value:"Задачи" }, 
		{ id:4, value:"Шаблоны" },
		{ id:5, value:"Финансы" },
		{ id:6, value:"Процессы" },
		{ id:7, value:"Файлы" },
		{ id:8, value:"Заметки" }
	],
	on: {
    'onChange': function(newv, oldv) {
      switch(newv) {
        case 1:
          App.User.set('thisSegment', 'users');
          App.Router.navigate('users', {trigger:true} );
          break;
        case 2:
          App.User.set('thisSegment', 'groups');
          App.Router.navigate('groups', {trigger:true} );
          break;
        case 3:
          App.User.set('thisSegment', 'tasks');
          App.Router.navigate('tasks', {trigger:true} );
          break;
        case 4:
          App.User.set('thisSegment', 'templates');
          break;
        case 5:
          App.User.set('thisSegment', 'finances');
          break;
        case 6:
          App.User.set('thisSegment', 'process');
          break;
        case 7:
          App.User.set('thisSegment', 'files');
          break;
        case 8:
          App.User.set('thisSegment', 'notes');
          break;          
      }
    }
	}
};

var searchMaster = {
	view:"search",
	//maxWidth:400,
	placeholder:"Найти тут всё..."
};

App.Frame.headerframe = {
	view:"toolbar",
	id: 'headerframe',
	height:32,
	maxWidth:App.WinSize.windowWidth / 100 * 80,
	elements:[btnMenu,
	          lblInTask,
	          searchMaster,
	          //{},
	          mnuSegments,
	          btnUser,
	          btnOptions,	          
	          mnuSettings
	         ]
};

App.Frame.slicegroups = {
  id:'slicegroups',
  view:'tree',
  isolate:false, 
  select:true,
  autoheight:true,
	template:'{common.icon()}{common.folder()}<span>#name#</span>',
  url: "GroupData->load"
};

App.Frame.sliceusers = {
  id:'sliceusers',
  view:'tree',
  select:true,
  data: [
    //{ id:'viktor', value:'Виктор' },
    //{ id:'lubov', value:'Любовь' },
    //{ id:'denis', value:'Денис' }
  ]
};

App.Frame.sliceprojects = {
  id:'sliceprojects',
  view:'tree',
  select:'true',
  data: [
    { id:'Default', value:'Default' },
    { id:'InTaskoid', value:'InTask.me' }
    ]
};

App.Frame.slicetags = {
  id:'slicetags',
  view:'tree',
  select:'true',
  data: [
    { id:'InTaskoid', value:'InTask.me' }
  ]
};

var leftframe_views_slice = {
  view:'scrollview', id:'leftframe_views_slice',
  borderless: true, scroll:'y', //vertical scrolling
  body:{
		multi:false,
		//view:'accordion',
		type:'space',
		rows:[{ body: 'Task pull' },
				  { view: 'resizer' },
		      { header:'Группы', body: App.Frame.slicegroups,  autoheight:true},
		      { header:'Люди', body: App.Frame.sliceusers },
		      { header:'Проекты', body: App.Frame.sliceprojects },
		      { header:'Тэги', body: App.Frame.slicetags }
		      ]
  }
};

App.Frame.leftframe = {
  view:'multiview', id:'leftframe',
	width:250, minHeight:App.WinSize.windowHeight / 100 * 85, autoheight:true,
	borderless: false,
	//header:'Срезы',
	cells:[leftframe_views_slice]
};

//Фильтр в панели опции
var rightframe_views_userprofile = {
  view:'scrollview', id:'rightframe_views_userprofile', container:'rightframe_views_userprofile',
  borderless: true, scroll:"y", //vertical scrolling
  $init: function(config) { 
    //$$('userlist_filter_country').hide(); 
  },
  body:{
    rows:[
      { view:'template', template:'Пользователи', type:'section', align:'center' },
      { view:'checkbox', id:'userlist_filter_myfriends', labelRight:'Мои друзья', labelWidth:10, value:0 },
      { view:'checkbox', id:'userlist_filter_online', labelRight:'Сейчас на сайте', labelWidth:10, value:0 },
      { view:'template', template:'Регион', type:'section', align:'center' },
      { view:'combo', id:'userlist_filter_country', suggest: 'api/country', value:'Выбор страны', relatedView:'userlist_filter_city', relatedAction:'snow' },
      { view:'combo', id:'userlist_filter_city', value:'Выбор города', hidden:true },
      { view:'template', template:'Возраст', type:'section', align:'center' },
      { cols:[
        { view:'combo', id:'userlist_filter_fromage', suggest: [{id:1, value: 'от'},{id:2, value:'от 14'}], value:'от' },
        {	view:'label', label:'-', width:10 },
        { view:'combo', id:'userlist_filter_toage', suggest: [{id:1, value: 'до'},{id:2, value:'до 14'}], value:'до' }
      ]},
      { view:'template', template:'Пол', type:'section', align:'center' },
      { view:"radio", id:'userlist_filter_gender', vertical:true, options:[{ value:"Любой", id:1 }, { value:"Мужской", id:2 }, { value:"Женский", id:3 }], value:1, autoheight:true },
      { view:'template', template:'Семейное положение', type:'section', align:'center' },
      { view:'richselect', id:'userlist_filter_familystatus', value:1, yCount:3, options:'api/familystatus' }
  ]}
};

var rightframe_views_groups = {
  
};

var rightframe_views_tasks = {
  
};

App.Frame.rightframe = {
  view:'multiview', id:"rightframe",
	width:250, minHeight:App.WinSize.windowHeight / 100 * 85,	autoheight:true,
	//borderless: true,
	//header:"Опции",
  cells:[rightframe_views_userprofile,
  rightframe_views_groups,
  rightframe_views_tasks ]
};

App.Frame.userlist = {
  view:'dataview', id:'userlist',	container:'userlist',
  width:300, minHeight:App.WinSize.windowHeight / 100 * 85, autoheight:false,
  borderless:false, scroll:'y', yCount:9, xCount:1,
  type:{ height: 80, width:300 },
  template:'html->userlist_template',
	//select:1,
	autowidth:true,
	url:'api/userlist'
};

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
//webix.protoUI({ name:"edittree"}, webix.EditAbility, webix.ui.tree);

//***************************************************************************
//GROUP frames

App.Frame.grouptoolframe = {
  view:'toolbar',
  id:'grouptoolframe',
  cols:[
    { view:'button', id:'grtlbtnAddMaster', value:'Добавить основную', width:140, align:'left', on:{
      'onItemClick':function() { App.Collections.Groups.newGroup(0); }
    } },
    { view:'button', id:'grtlbtnAdd', value:'Добавить', width:100, align:"left", on:{
		  'onItemClick':function() { App.Collections.Groups.newGroup(App.User.get('this_ingrid_groupframe_ItemSelected')); }
    } },
    { view:'button', id:'grtlbtnDlt', value:'Удалить', width:100, align:"left", on:{
      'onItemClick':function() {
        var selectedId = App.User.get('this_ingrid_groupframe_ItemSelected');
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
              if (result) { App.Collections.Groups.removeGroup(App.User.get('this_ingrid_groupframe_ItemSelected')); }
              //App.Collections.Groups.get(selectedId)
              }
          });
        }
      }
    } },
    { view:'button', id:'grtlbtnUp', value:'Вверх', width:100, align:"left", on:{
      'onItemClick':function() { App.Collections.Groups.moveGroup(App.User.get('this_ingrid_groupframe_ItemSelected'), 'up'); }
    } },
    { view:'button', id:'grtlbtnDown', value:'Вниз', width:100, align:"left", on:{
      'onItemClick':function() { App.Collections.Groups.moveGroup(App.User.get('this_ingrid_groupframe_ItemSelected'), 'down'); }
    } },
    { view:'button', id:'grtlbtnUpLevel', value:'На ур. вверх', width:100, align:"left", on:{
      'onItemClick':function() { App.Collections.Groups.moveGroup(App.User.get('this_ingrid_groupframe_ItemSelected'), 'uplevel'); }
    } },
    { view:'button', id:'grtlbtnDownLevel', value:'На ур. вниз', width:100, align:"left", on:{
      'onItemClick':function() { App.Collections.Groups.moveGroup(App.User.get('this_ingrid_groupframe_ItemSelected'), 'downlevel'); }
    } },
    { }
  ]
};

App.Frame.ingrid_groupframe = {
  id:'ingrid_groupframe',
	view:'treetable', 
	editable:true, 
	autoheight:true, 
	select: true,
	drag:true,
	columns:[
		{ id:'id', header:'', css:{"text-align":"center"}, width:40 },
		{ id:'name', editor:"text", header:'Имя групы', width:250, template:'{common.treetable()} #name#' },
		{ id:'numUsers', header:'Польз.', width:50 }
	],
	on: {
	  onItemClick:function() {
	    App.User.set('this_ingrid_groupframe_ItemSelected', this.getSelectedId().id);
    },
    onBeforeDrop:function(context, event) {
      var id_conf = context.to.config.id;
      if(id_conf === 'ingrid_groupframe') {
        App.Collections.Groups.moveGroup(context.start, 'jump', context.index, context.parent);
      }
  	 }
	},
	url: "GroupData->load"
};

App.Frame.groupframe = {
	id:'groupframe',
	view:'tabview',
	//minWidth:App.WinSize.windowWidth / 100 * 80,
	autowidth:true,
	animate:'true',
	tabbar : { optionWidth : 200 },
  cells:[
    {
     header:'Мои группы',
     body:{
        id:'mygroups_groupframe',
        rows:[
          App.Frame.grouptoolframe,
          App.Frame.ingrid_groupframe]
        }
    },
    {
     header:'Общественные группы',
     body:{
        id:'communitygroups_groupframe',
        rows:[
          //App.Frame.grouptoolframe,
          {}]        
        }
    }
  ]
};

//***************************************************************************
//TASK frames

App.Frame.tasktoolframe = {
  view:'toolbar',
  id:'tasktoolframe',
  cols:[
    { view:'button', id:'tsktlbtnAddMaster', value:'Добавить основную', width:140, align:'left', on:{
      'onItemClick':function() { App.Collections.Tasks.newTask(0); }
    } },
    { view:'button', id:'tsktlbtnAdd', value:'Добавить', width:100, align:"left", on:{
		  'onItemClick':function() { App.Collections.Tasks.newTask(App.User.get('this_ingrid_taskframe_ItemSelected')); }
    } },
    { view:'button', id:'tsktlbtnDlt', value:'Удалить', width:100, align:"left", on:{
      'onItemClick':function() {
        var selectedId = App.User.get('this_ingrid_taskframe_ItemSelected');
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
              if (result) { App.Collections.Tasks.removeTask(App.User.get('this_ingrid_taskframe_ItemSelected')); }
              }
          });
        }
      }
    } },
    { view:'button', id:'tsktlbtnUp', value:'Вверх', width:100, align:"left", on:{
      'onItemClick':function() { App.Collections.Tasks.moveTask(App.User.get('this_ingrid_taskframe_ItemSelected'), 'up'); }
    } },
    { view:'button', id:'tsktlbtnDown', value:'Вниз', width:100, align:"left", on:{
      'onItemClick':function() { App.Collections.Tasks.moveTask(App.User.get('this_ingrid_taskframe_ItemSelected'), 'down'); }
    } },
    { view:'button', id:'tsktlbtnUpLevel', value:'На ур. вверх', width:100, align:"left", on:{
      'onItemClick':function() { App.Collections.Tasks.moveTask(App.User.get('this_ingrid_taskframe_ItemSelected'), 'uplevel'); }
    } },
    { view:'button', id:'tsktlbtnDownLevel', value:'На ур. вниз', width:100, align:"left", on:{
      'onItemClick':function() { App.Collections.Tasks.moveTask(App.User.get('this_ingrid_taskframe_ItemSelected'), 'downlevel'); }
    } },
    { }
  ]
};

App.Frame.ingrid_taskframe = {
  id:'ingrid_taskframe',
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
	  onItemClick:function() {
	    App.User.set('this_ingrid_taskframe_ItemSelected', this.getSelectedId().id);
    },
    onBeforeDrop:function(context, event) {
      var id_conf = context.to.config.id;
      if(id_conf === 'ingrid_taskframe') {
        App.Collections.Tasks.moveTask(context.start, 'jump', context.index, context.parent);
      }
  	 }
	},
	url: "TaskData->load"
};

App.Frame.taskframe = {
	id:'taskframe',
	view:'tabview',
	autowidth:true,
	animate:'true',
	tabbar : { optionWidth : 200 },
  cells:[
    {
     header:'Мои',
     body:{
        id:'mytasks_taskframe',
        rows:[
          App.Frame.tasktoolframe,
          App.Frame.ingrid_taskframe]
        }
    },
    {
     header:'Входящие',
     body:{
        id:'incomingtasks_taskframe',
        rows:[
          {}]        
        }
    },
    {
     header:'Порученные',
     body:{
        id:'outcomingtasks_taskframe',
        rows:[
          {}]        
        }
    }    
  ]
};

//***************************************************************************
//USER frames

var userframe_profile_selector = {
  view:"list", id:"userframe_profile_selector", css:"mainSelector",
	borderless:true, yCount:4, width:250,
	template:"#value#",
	type:{ height:50 },
	select:true,
	data:[
		{ id:"all", 		value:"Все", count:0 },
		{ id:"personal",	value:"Персональные", count:0 }
	]
	//on:{"onAfterSelect": function(){
		//app.trigger("filterIssues");
	//}
};

var userframe_profile_section = {
  view:"scrollview", id:"userframe_profile_section",
  borderless: true, scroll:"y", //vertical scrolling
  body:{
    rows:[
      { view:'template', template:'Персональные', type:'section', align:'center' },
      { view:"text", value:'bru', label:"Имя пользователя", labelWidth:120 },
      { view:"text", value:'bru@bru.bru', label:"Email", labelWidth:120 }
  ]}
};

var userframe_profile = {
  id:'userframe_profile',
  borderless:false,
  cols:[
    { rows:[
        { height:1 },
        { view:'template', template:'bru', type:'header', align:'center' },
        { cols:[
            { view:'template', template:"<img src='img/avatars/2.png'>", width: 250 },
            { width:10 },
            { view:'template', template:"carousel" }
          ], height:250
        },
        { height:10 },
        { cols:[
            userframe_profile_selector,
            { width:10 },
            userframe_profile_section
          ]
        }
      ]
    }//,
    // { width:10 },
    // { rows:[
    //     { height:5 },
    //     {type:"header", template:"Друзья"},
    //     userframe_profile_friendlist
    //   ]
    // }
  ]  
};

var userframe_albums = {
  id:'userframe_albums',
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

var userframe_achievements = {
  id:'userframe_achievements',
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

var userframe_events = {
  id:'userframe_events',
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

var userframe_message = {
  id:'userframe_message',
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

App.Frame.userframe = {
  id:'userframe',
  view:'tabview',
  autoheight:true,
  autowidth:true,
  animate:true,
  tabbar : { optionWidth : 200 },
  cells:[
    {
      header: 'Профиль',
      body: userframe_profile
    },
    {
      header: 'Альбомы',
      body: userframe_albums
    },
    {
      header: 'Достижения',
      body: userframe_achievements
    },
    {
      header: 'События',
      body: userframe_events
    },
    {
      header: 'Сообщения',
      body: userframe_message
    },    
  ]
};

//***************************************************************************
//OTHER frames
var registrationForm = {
  view:'form',
  width:350,
  elements:[
    { view:'template', template:'Регистрация', type:'header', align:'center' },
    { view:'text', label:'Email', id:'reg_email'},
    { view:'text', label:'Имя пользователя', id:'reg_username'},
    { view:'text', type:'password', label:'Пароль', id:'reg_password'},
    { margin:5, cols:[
      { view:'button', value:'Зарегистрировать', type:'form', hotkey: "enter", on:{
	      'onItemClick':function() {
	        var promise = webix.ajax().post('api/register', { email:$$('reg_email').getValue(), 
	                                                      username:$$('reg_username').getValue(), 
	                                                      password:$$('reg_password').getValue()}, function(text, data)
	        {
	          App.User.set('usrLogged', true);
	          App.User.set('id', data.json().id);
	          App.Router.navigate('', {trigger: true});
	        });
	        
          promise.then(function(realdata){}).fail(function(err){
            webix.message({type:"error", text:err.responseText});
          });
        }
      }},
      { view:'button', value:'Отменить', on:{
        'onItemClick':function() {
          App.Router.navigate('', {trigger: true});
        }
      }}
    ]}          
  ]
};

var loginForm = {
  id:'loginForm',
  view:'form',
  width:350,
  elements:[
    { view:'template', template:'login', type:'header', align:'center' },
    { view:'text', label:'Email', id:'log_email'},
    { view:'text', type:'password', label:'Пароль', id:'log_password'},
    { margin:5, cols:[
      { view:'button', value:'Войти', type:'form', click:function() {

	        var promise = webix.ajax().post('api/login', { email:$$('log_email').getValue(), 
	                                                   password:$$('log_password').getValue()}, function(text, data)
	        {
	          App.User.set('usrLogged', true);
	          App.User.set('id', data.json().id);
	          App.Router.navigate('', {trigger: true});
	        });
	        
          promise.then(function(realdata){}).fail(function(err){
            webix.message({type:"error", text:err.responseText});
          });
        }
      },
      { view:'button', value:'Отменить', on:{
        'onItemClick':function() {
          App.Router.navigate('', {trigger: true});
        }
      }}
    ]}          
  ]
};

App.Frame.registerframe = {
  id:'registerframe',
  autoheight:true,
  autowidth:true,
  rows:[
    {},
    {
      cols:[
      {},
      registrationForm,      
      {}
      ]
    },
    {}
  ]
};

App.Frame.loginframe = {
  id:'loginframe',
  autoheight:true,
  autowidth:true,
  rows:[
    {},
    {
      cols:[
      {},
      loginForm,      
      {}
      ]
    },
    {}
  ]
};

App.Frame.greetingframe = {
  id:'greetingframe',
  container:'greetingframe',
  //minHeight:600,
  //maxWidth:1500,
  autoheight:true,
  autowidth:true,
  rows:[
  {
    view:'htmlform',
    template: 'http->greeting.html'
  },
  { 
    cols:[{},
    {
      id:'btnTry',
	    view:'button', 
	    value:'Попробовать',
	    height: 45,
	    width: 100,
	    on:{
	      'onItemClick':function() {
	        App.User.set('thisTry', true);
        }
      }
    },
    {
      id:"btnRegister",
	    view:"button",
	    value:"Зарегистрировать",
	    height: 45,
	    width: 130,
	    on:{
		    'onItemClick': function() { 
		      App.Router.navigate('register', {trigger:true} );
		    }
      }
    },
    {
      id:"btnLogin",
	    view:"button",
	    value:"Войти",
	    height: 45,
	    width: 100,
	    on:{
		    'onItemClick': function(){ App.Router.navigate('login', {trigger:true} ); }
      }
    },{}]
  }
  ]
};

App.Frame.centralframe = {
  id:'centralframe',
  container:'centralframe',
  autoheight:true,
  autowidth:true,
  view:"multiview", 
  cells:[App.Frame.greetingframe,
  App.Frame.groupframe,
  App.Frame.taskframe,
  App.Frame.registerframe,
  App.Frame.loginframe,
  App.Frame.userframe],
  fitBiggest:true
};