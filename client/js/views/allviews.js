var App = window.App;
var webix = window.webix;

/**
* ui: profilePopup
*   конфигурация интерфейса для меню последних просмотренных профилей, первая часть (list_InnerProfile) 
* содержит профиль осн. пользователя и публичный профиль в котором отображается вся публичная информация. 
* Вторая часть (list_lastProfile) заполняется функцией main.addLastProfileList, и представляет несколько
* последних просмотренных профилей
*****************************************************************************/
webix.ui({
	view: 'popup', id: 'profilePopup',
	width: 300,	padding: 0,
	css:'list_popup',
//	on:{ 'onShow': function() { $$('tree_SegmentsSelector').blockEvent(); },
//	  'onHide': function() { $$('tree_SegmentsSelector').unblockEvent(); }
//	},
	body:{
		type: 'clean',
		borderless:true,
		rows:[
			{
				view: 'list', id: 'list_InnerProfile',
				autoheight: true,
				data: [],
				type:{
					height: 45,
					template: function(obj) {
					  var html = '';
					  if(obj.type === 'community') {
					    html = "<img class='photo' src='img/globe40.png'";
					    html +="' /><span class='text'>"+obj.name+"</span><span class='name'>"+obj.segment+"</span>";
					  } else {
					    html = "<img class='photo' src='img/avatars/40/avtr"+obj.profile_id+".png?refresh="+Math.random();
					    html +="' /><span class='text'>"+obj.name+"</span><span class='name'>"+obj.segment+"</span>";
					  }
					  return html;
					}
				},
				on:{
				  onItemClick: function(id) {
				    var itm = this.getItem(id);
				    if(itm.type === 'myprofile')
				      App.Router.navigate('id' + itm.profile_id, {trigger:true} );
            else
				      App.Router.navigate('home', {trigger:true} ); 
				    
				    $$('profilePopup').hide();
				  }}
			},		  
			{	css: 'show_all', height: 40, template: "Последние просмотренные профили <span class='webix_icon fa-angle-double-right'></span>"	},
			{
				view: 'list', id: 'list_lastProfile',
				autoheight: true,
				data: [],
				type:{
					height: 45,
					template: function(obj) {
					  if(obj.type === 'userprofile')
					    return "<img class='photo' src='img/avatars/40/avtr"+obj.id+".png?refresh="+Math.random()+"' /><span class='text'>"+obj.name+"</span><span class='name'>"+obj.segment+"</span>";
					   else if(obj.type === 'groupprofile')
					    return "<img class='photo' src='img/gravatars/40/avtr"+obj.id+".png?refresh="+Math.random()+"' /><span class='text'>"+obj.name+"</span><span class='name'>"+obj.segment+"</span>";
					}
				},
				on:{
				  onItemClick:function(id) {
				    var itm = this.getItem(id);
				    if(itm.type === 'userprofile')
				      App.Router.navigate('id' + itm.id, {trigger:true} );
				    else if(itm.type === 'groupprofile')
				      App.Router.navigate('gr' + itm.id, {trigger:true} );

				    $$('profilePopup').hide();
				  }
				}
			}
		]
	}
});

var toggle_HeaderMenu = {
	view:'toggle', id:'toggle_HeaderMenu',
	type:'icon', icon:'bars', 
	width:30,	//height:30,
	on:{
		'onItemClick': function() {
		  if($$('multiview_Left').isVisible()) {
		    $$('multiview_Left').hide();
		  } else {
		    $$('multiview_Left').show();
		    $$('tree_SegmentsSelector').show();
		    $$('tree_SegmentsSelector').refresh();
		  }	
		}
	}
};

var label_HeaderInTask = {
	view: 'label', id: 'label_HeaderInTask',
	width: 175, align: 'center',
	label: "<span class='headerLabel'>InTask.me</span>",
	on:{
		'onItemClick': function() { 
		  App.Router.navigate('home', {trigger:true} ); 
		}
	}
};

var toggle_HeaderOptions = {
	view: 'toggle',  id: 'toggle_HeaderOptions',
	type: 'icon', icon: 'tasks',
	width: 30,	//height: 30,
	on:{
		'onItemClick': function() { 
		  if($$('multiview_Right').isVisible()) {
		    $$('multiview_Right').hide();
		  } else {
		    $$('multiview_Right').show();
		  }	
		}
	}	
};

// var search_HeaderMaster = {
// 	view:'search', id: 'search_HeaderMaster',
// 	placeholder:'Найти тут всё...'
// };

App.Frame.toolbarHeader = {
	view:'toolbar', id: 'toolbarHeader',
	//height:32, //maxWidth:App.WinSize.windowWidth / 100 * 80,
	elements:[toggle_HeaderMenu,
	          label_HeaderInTask,
	          {},
	          //popup_HeaderProfile,
	          //search_HeaderMaster,
	          toggle_HeaderOptions
	         ]
};

// icon button with count marker
webix.protoUI({
	name:'icon',
	$skin:function() {
		this.defaults.height = webix.skin.$active.inputHeight;
	},
	defaults:{
		template:function(obj) {
			var html = "<button style='height:100%;width:100%;line-height:"+obj.aheight+"px' class='webix_icon_button'>";
			html += "<span class='webix_icon fa-"+obj.icon+"'></span>";
			if(obj.value)
				html += "<span class='webix_icon_count'>"+obj.value+"</span>";
			html += "</button>";
			return html;
		},
		width:33
	},
	_set_inner_size:function() {
	}
}, webix.ui.button);

// Type for left menu
webix.type(webix.ui.tree, {
	name:'menuTree',
	height: 20,
	icon:function(obj, common) {
		var html = '';
		var open = '';
		for (var i = 1; i <= obj.$level; i++) {
			if (i === obj.$level && obj.$count) {
				  var dir = obj.open?'down':'right';
				  html+="<span class='"+open+" webix_icon fa-angle-"+dir+"'></span>";
		    }
		}
		return html;
	},
	folder:function(obj, common) {
		if(obj.icon)
			return "<span class='webix_icon icon fa-"+obj.icon+"'></span>";
		return '';
	}
});

var tree_SegmentsSelector = {
	width: 220,
	rows:[
		{
			view: 'tree',	id: 'tree_SegmentsSelector',
			type: 'menuTree',	css: 'menu',
			activeTitle: true,
			select: 'multiselect',
  		template: function(obj, common) {
  		  if(obj.id === 'SegmentsSelector_Profile') {
  		    var html;
  		    html = "<span class='webix_icon fa-angle-down' onclick='$$(\"profilePopup\").show(this)' style='float:right;margin-top:10px'></span>";					
  		    if(App.State.SelectedProfile.type === 'community') {
					  html += "<img class='photo' src='img/globe40.png' /><span class='name'> "+App.State.SelectedProfile.name+"</span>";
  		    } else if(App.State.SelectedProfile.type === 'groupprofile'){
  		      html += "<img class='photo' src='img/gravatars/40/avtr"+App.State.SelectedProfile.id+".png?refresh="+Math.random()+"' /><span class='pop'> "+App.State.SelectedProfile.name+"</span>";
  		    } else {
					  html += "<img class='photo' src='img/avatars/40/avtr"+App.State.SelectedProfile.id+".png?refresh="+Math.random()+"' /><span class='pop'> "+App.State.SelectedProfile.name+"</span>";
  		    }
					
					return html;
  		  }
  		  else
  			  return ""+(common.icon?common.icon.apply(this, arguments):"")+" "+(common.folder?common.folder.apply(this, arguments):"")+" <span class='grow'>"+(obj.value)+"</span>";
  		},
			tooltip: {
				template: function(obj){
					return obj.$count?"":obj.details;
				}
			},
			on:{
				onBeforeSelect:function(id){
					return !this.getItem(id).$count;
				},
				onAfterSelect:function(id) {
          switch(id) {
            case 'SegmentsSelector_Profile':
              if(App.State.SelectedProfile.type === 'community') {
                App.Router.navigate('home', { trigger:true } );
              } else if(App.State.SelectedProfile.type === 'groupprofile') {
                App.Router.navigate('gr' + App.State.SelectedProfile.id, { trigger:true } );
              } else {
                App.Router.navigate('id' + App.State.SelectedProfile.id, { trigger:true } );
              }
              break;
            case 'SegmentsSelector_Users':
              switch(App.State.SelectedProfile.type) {
                case 'community':
                  App.Router.navigate('users', { trigger:true } );
                  break;
                case 'userprofile':
                  App.Router.navigate('users?id=' + App.State.SelectedProfile.id, { trigger:true } );
                  break;
                case 'myprofile':
                  App.Router.navigate('users?id=' + App.State.SelectedProfile.id, { trigger:true } );
                  break;
                case 'groupprofile':
                  App.Router.navigate('users?gr=' + App.State.SelectedProfile.id, { trigger:true } );
                  break;
              }

              break;
            case 'SegmentsSelector_Groups':
              switch(App.State.SelectedProfile.type) {
                case 'community':
                  App.Router.navigate('groups', {trigger:true} );
                  break;
                case 'userprofile':
                  App.Router.navigate('groups?id=' + App.State.SelectedProfile.id, {trigger:true} );
                  break;
                case 'myprofile':
                  App.Router.navigate('groups?id=' + App.State.SelectedProfile.id, {trigger:true} );
                  break;
              }

              break;
            case 'SegmentsSelector_Tasks':
              App.Router.navigate('tasks', {trigger:true} );
              break;
  		      case 'SegmentsSelector_LogOut':
              App.Router.navigate('logout', {trigger:true} );
              break;
      		}
				}
			},
			data:[
			  { id: 'SegmentsSelector_Profile', value: 'Мой профиль', hidden:false, icon: 'globe', $css: 'user', details:'Подробная информация профиля' },
				{ id: 'SegmentsSelector_Segments', value: 'Cегменты', hidden:false, open: true, data:[
					{ id: 'SegmentsSelector_Users', value: 'Друзья', hidden:false, icon: 'users', $css: 'user', details:'Список пользователей профиля' },
					{ id: 'SegmentsSelector_Groups', value: 'Группы', hidden:false, icon: 'sitemap', $css: 'products', details:'Список групп профиля' },
					{ id: 'SegmentsSelector_Tasks', value: 'Задачи', hidden:false, icon: 'check-square-o', $css: "orders", details:'Список задач профиля' },
				 	{ id: 'SegmentsSelector_Projects', value:'Проекты', hidden:false, icon: 'briefcase', details:'Список проектов профиля' },
       		{ id: 'SegmentsSelector_Templates', value:'Шаблоны', hidden:false, icon: 'star', details:'Подборка шаблонов' },
       		{ id: 'SegmentsSelector_Events', value:'События', hidden:false, icon: 'bell' },
       		{ id: 'SegmentsSelector_Messages', value:'Сообщения', hidden:false, icon: 'envelope' }
				]},
				{ id: 'SegmentsSelector_More', open: false, hidden:false, value:'...', data:[
					{ id: 'SegmentsSelector_Prefences', value: 'Настройки', hidden:false, icon: 'gear', details: 'Персональные настройки пользователя' },
					{ id: 'SegmentsSelector_LogOut', value: 'Завершить сеанс', hidden:false, icon: 'sign-out', details: 'Закончить сеанс' }
				]}
			]
		}
	]
};

App.Frame.multiview_Left = {
  view:'multiview', id:'multiview_Left',
	autowidth:true,
	borderless: false,
	cells:[tree_SegmentsSelector]
};

//Фильтр в панели опции
var scrollview_UsersFilter = {
  view:'scrollview', id:'scrollview_UsersFilter', container:'scrollview_UsersFilter',
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

var scrollview_RightUserFilter = {
  view:'scrollview', id:'scrollview_RightUserFilter',
  borderless: false, scroll:'y',
  $init: function(config) { },
  body:{
    rows:[
      { view:'template', template:'Видимость профиля', type:'section', align:'center' },
      { view:'richselect', id:'richselectUserFilter_VisibleProfile', options:[ {id:0, value: 'Только мне'}, {id:1, value: 'Только друзьям'}, {id:2, value: 'Всем'} ], on:{'onChange': saveUserPermission } }
    ]
  }
};

var scrollview_RightGroupFilter = {
  view:'scrollview', id:'scrollview_RightGroupFilter',
  borderless: false, scroll:'y',
  $init: function(config) { },
  body:{
    rows:[
      { view:'template', template:'Группа', type:'section', align:'center' }
    ]
  }
};

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

App.Frame.multiview_Right = {
  view:'multiview', id:'multiview_Right',
	width:250, animate: false,
  cells:[scrollview_UsersFilter,
  scrollview_RightUserFilter,
  scrollview_RightGroupFilter,
  scrollviewRight_GroupsFilter ]
};

//webix.protoUI({ name:"edittree"}, webix.EditAbility, webix.ui.tree);

//**************************************************************************************************
//section: GROUPS frames
var treetable_Groups_loadSuccess = function(data) {
  $$('treetable_Groups').parse(data.json());
};

var treetable_Groups = {
  view:'treetable', id:'treetable_Groups',
  css:'treetable',
	editable:true, editaction:'dblclick',
	rowHeight:47,
	select: true,
	drag:true,
	updateFromResponse:true,
  save:{
    'insert':'api/v1/groups',
    'update':'api/v1/groups',
    //'delete':'api/v1/groups',
    updateFromResponse:true
  },	
	columns:[
		{ id:'id', header:'&nbsp;', css:{'text-align':'center'}, width:40 },
		{ id:'grIcoView', header:'&nbsp;', width:56, template:"<img class='photointable' src='img/gravatars/40/avtr1.png' />"},//"<span style='cursor:pointer;' class='webix_icon fa-eye'></span>" },
		{ id:'grIcoUsers', header:'&nbsp;', width:35, template:"<span style='cursor:pointer;' class='webix_icon fa-users'></span>" },
		{ id:'name', editor:'text', header:'Имя групы', width:250, template:'{common.treetable()} #name#' },
		{ id:'user_type', header:'Отношение к групп', width:100 },
		{ id:'order', header:'отладочая', width:50 }
	],
	onClick:{
		'photointable': function(e, id, node) {
		  App.Router.navigate('gr' + id, { trigger:true } );
		},
		'fa-users': function(e, id, node) {
		  webix.message('users');
		},
		'fa-angle-down': function(e, id) {
			this.close(id);
		},
		'fa-angle-right': function(e, id) {
			this.open(id);
		}
	},
	on: {
	  onItemClick: function() { 
	    //App.State.groupstable_ItemSelected = this.getSelectedId().id; 
	  },
    onBeforeDrop: function(context, event) {
      // var id_conf = context.to.config.id;
      // if(id_conf === 'treetable_Groups') {
      //   App.State.groups.moveGroup(context.start, 'jump', context.index, context.parent);
      // }
  	 },
		onBeforeLoad: function() {
			this.showOverlay('Загрузка данных...');
		},
		onAfterLoad: function() {
			this.hideOverlay();
		},
    // onBeforeOpen:function(id) {
    //   if(this.getItem(id).$count===-1)
    //     this.loadBranch(id);
    // },
    onDataRequest: function (id) {
      webix.ajax().get('api/v1/groups?continue=true&parent='+id, { userId: App.State.SelectedProfile.id }).then(treetable_Groups_loadSuccess);
      //cancelling default behaviour
      return false;
    }    
	},
	//url: 'GroupData->load'
	type: {
		icon:function(obj,common){
			if (obj.$count){
				if (obj.open)
					return "<span class='webix_icon fa-angle-down'></span>";
				else
					return "<div class='webix_icon fa-angle-right'></div>";
			} else
				return "<div class='webix_tree_none'></div>";
		},
		folder:function(obj, common){
		// 	if (obj.$count){
		// 		if (obj.open)
		// 			return "<span class='webix_icon fa-tree'></span>";
		// 		else
		// 			return "<span class='webix_icon fa-tree'></span>";
		// 	}
		// 	return "<div class='webix_icon fa-leaf'></div>";
		//return "<img class='photo' src='img/gravatars/40/avtr1.png' />";
		  return '';
		}
	},
};

/**
* ui: button_Groups_New
* ui.tree: multiview_Central.frame_Groups.button_Groups_New
*   конфигурация интерфейса для кнопки создания корневой группы
* Содержит: обработчик события нажатия на кнопку, где передается временное название группы, которое 
* будет отображаться в дереве, пока клиент дожидается ответа от сервера. Далее управление передается
* обработчикам событий для dataprocessor (groups_dp), где до передачи на сервер создается оверлей
* окна загрузки, а после получения данных оверлей уничтожается
*****************************************************************************/
var button_Groups_New = {
  view:'button', id:'button_Groups_New',
  css:'itsk_button',
  label:'Группа',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { 
    $$('treetable_Groups').add({ name: 'Новая группа' }, 0, 0);
	} }  
};

var button_Groups_Add = {
  view:'button', id:'button_Groups_Add',
  css:'itsk_button',
  label:'Подгруппа',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() {
	  var selectedId = $$('treetable_Groups').getSelectedId();
    var row_id = $$('treetable_Groups').add({ }, 0, selectedId);
    if(!$$('treetable_Groups').isBranchOpen(selectedId))
      $$('treetable_Groups').open(selectedId);
  } }  
};

var button_Groups_Delete = {
  view:'button', id:'button_Groups_Delete',
  css:'itsk_button',
  label:'Удалить',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() {
	  webix.ajax().del('api/v1/groups', { webix_operation: 'delete', id: $$('treetable_Groups').getSelectedId().id }).then(function() {
      $$("treetable_Groups").remove($$('treetable_Groups').getSelectedId());
    });
	} }  
};

var button_Groups_Up = {
  view:'button', id:'button_Groups_Up',
  css:'itsk_button',
  label:'Вверх',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }  
};

var button_Groups_Down = {
  view:'button', id:'button_Groups_Down',
  css:'itsk_button',
  label:'Вниз',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }  
};

var button_Groups_UpLevel = {
  view:'button', id:'button_Groups_UpLevel',
  css:'itsk_button',
  label:'Ур. вверх',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }  
};

var button_Groups_DownLevel = {
  view:'button', id:'button_Groups_DownLevel',
  css:'itsk_button',
  label:'Ур. вниз',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }  
};

var button_Groups_Back = {
  view:'button', id:'button_Groups_Back',
  css:'itsk_button',
  label:'Назад',
  height:28,
  gravity:1,
	on:{
		'onItemClick': function() { 
		  App.Router.navigate(App.State.getState('clientRoute', -1), {trigger:true} ); 
		}
	}  
};

var toggle_Groups_Filter = {
  view:'toggle', id:'toggle_Groups_Filter',
  css:'itsk_button',
  label:'Фильтр Групп',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }
};

var toggleGroups_Property = {
  view:'toggle', id:'toggleGroups_Property',
  css:'itsk_button',
  label:'Свойства Группы',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }
};

var search_Groups = {
  view:'search', id:'search_Groups',
  css:'search_Users',
  align:'center', 
  height:28,
  placeholder:'Для поиска по группам введите любое имя, название или слово'
};

var frame_Groups = {
  id: 'frame_Groups',
  css:'frame_Users',
  rows:[
    { cols:[ button_Groups_New, button_Groups_Add, button_Groups_Delete, 
             button_Groups_Up, button_Groups_Down, button_Groups_UpLevel, button_Groups_DownLevel,
             { gravity:10 }, button_Groups_Back], css:{ 'border-bottom':'2px solid white;' } }, //toolbar
    { cols:[ { gravity:10 }, toggle_Groups_Filter, toggleGroups_Property] }, //view toggle
    {
      cols:[
        {
          rows:[ search_Groups, treetable_Groups ]
        }, //view - tasks tree
        { css:{ 'border-left':'2px solid white;' }, hidden:true }, //view - filters
        { css:{ 'border-left':'2px solid white;' }, hidden:true }  //view - task property
      ]
    } //views
  ]
};
//end section: GROUPS frames
//**************************************************************************************************

//**************************************************************************************************
//section: TASKS frames

var treetable_Tasks_loadSuccess = function(data) {
  $$('treetable_Tasks').parse(data.json());
};

var load_Task = function(model, response, options) {
  var obj = data.json();
  
};

var er_load_Task = function(err) {
  webix.message(err);
  //заглушечка
};

App.Func.bind_Task = function() {
  var selItem = $$('treetable_Tasks').getSelectedItem();
  var onToggle = $$('toggleTasks_Property').getValue();
  
  if(selItem !== undefined && onToggle) {
    App.State.viewedTask.url = '/api/v1/tasks/' + selItem.id;
    App.State.viewedTask.fetch({ success: load_Task, error: er_load_Task, silent:true });
  }
};

var treetable_Tasks = {
  id:'treetable_Tasks',
	view:'treetable', 
	editable:true, editaction:'dblclick',
  rowHeight:37,
	select: true,
	drag:true,
	updateFromResponse:true,
	gravity: 2,
  save:{
    'insert':'api/v1/tasks',
    'update':'api/v1/tasks',
    updateFromResponse:true
  },	
	columns:[
		{ id:'id',       header:'&nbsp;', css:{'text-align':'center'}, template:'{common.treetable()} #id#' },
		{ id:'status',   header:'&nbsp;', width:36, css:{'text-align':'center'}, template:'{common.status()}' },
		{ id:'priority', header:'&nbsp;', width:36, css:{'text-align':'center'}, template:'{common.priority()}' },
		{ id:'title',    header:'Заголовок задачи', editor:'text', width:250, template:'#title#' },
		{ id:'createMoment', header:'Создано', width:150, template: function (obj) { 
		  var m = moment(obj.createMoment);
      return '<div class="createMoment_1">'+m.format('YYYY-MM-DD')+'</div> \
			  <div class="createMoment_2">'+m.format('HH:mm:ss')+'</div> \
			  <div class="createMoment_3">'+moment(m).fromNow(true)+' назад</div>'; 
		} }
	],
	onClick:{
		'fa-angle-down': function(e, id) {
			this.close(id);
		},
		'fa-angle-right': function(e, id) {
			this.open(id);
		},
		'fa-square-o': function(e, id, node) {
		  webix.message(id.toString());
		},
		'fa-check-square-o': function(e, id, node) {
		  webix.message(id.toString());
		}
	},
	on: {
	  onItemClick: function() { App.Func.bind_Task(); },
    onBeforeDrop: function(context, event) {},
		onBeforeLoad: function() { this.showOverlay('Загрузка данных...'); },
		onAfterLoad: function() {	this.hideOverlay();	},
    onDataRequest: function (id) {
      webix.ajax().get('api/v1/tasks?continue=true&parent='+id, { userId: App.State.SelectedProfile.id }).then(treetable_Tasks_loadSuccess);
      //cancelling default behaviour
      return false;
    }    
	},
	type: {
		icon:function(obj, common) {
			if (obj.$count) {
				if (obj.open)
					return "<span class='webix_icon fa-angle-down'></span>";
				else
					return "<div class='webix_icon fa-angle-right'></div>";
			} else
				return "<div class='webix_tree_none'></div>";
		},
    status:function(obj, common) {
      switch (obj.status) {
        case 0:
          return "<div class='webix_icon fa-square-o'></div>";
        case 1:
          return "<div class='webix_icon fa-exclamation'></div>";
        case 2:
          return "<div class='webix_icon fa-square'></div>";
        case 3:
          return "<div class='webix_icon fa-check-square-o'></div>";
      }
    },
    priority:function(obj, common) {
      switch (obj.priority) {
        case 'A':
          return "<img class='img_priority' src='img/a_grey_24.png' />";
        case 'B':
          return "<img class='img_priority' src='img/b_grey_24.png' />";
        case 'C':
          return "<img class='img_priority' src='img/c_grey_24.png' />";
      }
    }
	}
};

var frame_Task_Description = {
  id:'frame_Task_Description',
  rows:[{
    cols:[
      { view:'text', name:'title', label:'Заголовок', gravity:3, css:{ 'padding-left':'5px' } },
      { view:'segmented', label:'Приоритет', labelWidth:90, value:1, gravity:1, options:[
        { id:'1', value:'A' },
        { id:'2', value:'B' }, 
        { id:'3', value:'C' }]
      }
    ]
  }, {
    view:'template', autoheight:true,
    template: function (obj) { 
		  var m = moment(obj.createMoment);
      return '<div style="display: inline-block"><span>Задача создана: </span>'+m.format('YYYY-MM-DD')+' '+m.format('HH:mm:ss')+' \
			  '+moment(m).fromNow(true)+' назад</div> \
			  <div style="display: inline-block"><b>Задача ожидает завершения</b></div>'; 
		},
    data: { createMoment: moment() }
  }]
};

var frame_DatesPropTask = {
  id:'frame_DatesPropTask',
  cols:[{},{
    view:'calendar',
    date:new Date(2012,3,16),
    weekHeader:true,
    events:webix.Date.isHoliday, 
    calendarDateFormat: '%Y-%m-%d',
    width:300,
    height:250
  }]
};

var frame_Task_Property = {
  view:'accordion', 
  id: 'frame_Task_Property',
  css:{ 'border-left':'2px solid white;' }, 
  hidden:true,
  gravity:1,
  multi:false,
  rows:[
    { header:'Описание задачи', headerHeight:20, headerAltHeight:20, body:frame_Task_Description, collapsed:false },
    { header:'Расписание и хронометраж', headerHeight:20, headerAltHeight:20, body:frame_DatesPropTask, collapsed:true },
    { header:'Управление правами и доступом', headerHeight:20, headerAltHeight:20, body:'Права', collapsed:true },
    {}
  ]
};

var button_Tasks_New = {
  view:'button', id:'button_Tasks_New',
  css:'itsk_button',
  label:'Задача',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }  
};

var button_Tasks_Add = {
  view:'button', id:'button_Tasks_Add',
  css:'itsk_button',
  label:'Подзадача',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }  
};

var button_Tasks_Delete = {
  view:'button', id:'button_Tasks_Delete',
  css:'itsk_button',
  label:'Удалить',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }  
};

var button_Tasks_Up = {
  view:'button', id:'button_Tasks_Up',
  css:'itsk_button',
  label:'Вверх',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }  
};

var button_Tasks_Down = {
  view:'button', id:'button_Tasks_Down',
  css:'itsk_button',
  label:'Вниз',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }  
};

var button_Tasks_UpLevel = {
  view:'button', id:'button_Tasks_UpLevel',
  css:'itsk_button',
  label:'Ур. вверх',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }  
};

var button_Tasks_DownLevel = {
  view:'button', id:'button_Tasks_DownLevel',
  css:'itsk_button',
  label:'Ур. вниз',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }  
};

var button_Tasks_Back = {
  view:'button', id:'button_Tasks_Back',
  css:'itsk_button',
  label:'Назад',
  height:28,
  gravity:1,
	on:{
		'onItemClick': function() { 
		  App.Router.navigate(App.State.getState('clientRoute', -1), {trigger:true} ); 
		}
	}  
};

var toggle_Tasks_Filter = {
  view:'toggle', id:'toggle_Tasks_Filter',
  css:'itsk_button',
  label:'Фильтр задач',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { 
	  if($$('activity_Tasks').isVisible()) {
	    $$('activity_Tasks').hide(); 
	  } else {
	    $$('activity_Tasks').show(); 
	  } }
	}
};

var toggleTasks_Property = {
  view:'toggle', id:'toggleTasks_Property',
  css:'itsk_button',
  label:'Свойства задачи',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { 
	  if($$('frame_Task_Property').isVisible()) {
	    $$('frame_Task_Property').hide(); 
	  } else {
	    $$('frame_Task_Property').show(); 
	    App.Func.bind_Task();
	  } }
	}
};

var toggleTasks_Calendar = {
  view:'toggle', id:'toggleTasks_Calendar',
  css:'itsk_button',
  label:'Календарь',
  height:28,
  gravity:1,
	on:{ 'onItemClick': function() { } }
};

var search_Tasks = {
  view:'search', id:'search_Tasks',
  css:'search_Users',
  align:'center', 
  height:28,
  placeholder:'Для поиска по задачам введите любое имя, название или слово'
};

    var color_options = [
        {id:1, value:"red"},
        {id:2, value:"blue"},
        {id:3, value:"green"},
        {id:4, value:"orange"},
        {id:5, value:"grey"},
        {id:6, value:"yellow"}
    ];

    var position_options = [
        {id:1, value:"left"},
        {id:2, value:"right"},
        {id:3, value:"top"},
        {id:4, value:"bottom"}
    ];
	var propertysheet_1 = {
		view:"property",  id:"sets", width:300,
		elements:[
			{ label:"Layout", type:"label" },
			{ label:"Width", type:"text", id:"width", value: 250},
			{ label:"Height", type:"text", id:"height"},
            { label:"Password", type:"password", id:"pass"},
			{ label:"Data loading", type:"label" },
			{ label:"Data url", type:"text", id:"url", value:"http://webix.com/data"},
            { label:"Type", type:"select", options:["json","xml","csv"], id:"type"},
            { label:"Position", type:"select", options:position_options, id:"position"},
            { label:"Date", type:"date", id:"date", format:webix.i18n.dateFormatStr},
            { label:"Color", type:"combo", options:color_options, id:"color"},
			{ label:"Use JSONP", type:"checkbox", id:"jsonp"}
		],
		data:{
        width:250,
        height:480,
        url:"http://webix.com/data",
        type:"json",
        position:2,
        date:new Date(),
        color:1

    }
	};
	
var frame_Tasks = {
  id: 'frame_Tasks',
  css:'frame_Users',
  //autoheight:true, autowidth:true,
  rows:[
    { cols:[ button_Tasks_New, button_Tasks_Add, button_Tasks_Delete, 
             button_Tasks_Up, button_Tasks_Down, button_Tasks_UpLevel, button_Tasks_DownLevel,
             { gravity:10 }, button_Tasks_Back], css:{ 'border-bottom':'2px solid white;' } }, //toolbar
    { cols:[ { gravity:10 }, toggle_Tasks_Filter, toggleTasks_Property, toggleTasks_Calendar] }, //view toggle
    {
      cols:[
        {
          rows:[ search_Tasks, treetable_Tasks ]
        }, //view - tasks tree
        frame_Task_Property  //view - task property
      ]
    } //views
  ]
};
//end section: TASKS frames
//**************************************************************************************************

//**************************************************************************************************
//section AVATAR user
var click_User_AvatarUpload_Cancel = function() {
	var id = $$('uploader_User_Avatar').files.getFirstId();
	while (id) {
		$$('uploader_User_Avatar').stopUpload(id);
		id = $$('uploader_User_Avatar').files.getNextId(id);
	}
	$$('window_User_Uploader_Avatar').hide();
};

var form_User_Uploader_Avatar = {
	view:'form', id:'form_User_Uploader_Avatar', borderless:true,
	elements: [
		{ view:'template', template:'<span>Было бы замечательно, если бы ваш профиль имел аватарку! Сейчас у вас замечательная возможность её выбрать!</span>' },
		{ view:'uploader', id:'uploader_User_Avatar', 
		  value: 'Загрузить фото',
		  height:37, align:'center', 
      miltiple:false, autosend:true, 
		  formData:{ formname:'form_User_Uploader_Avatar' },
		  upload:'api/v1/upload',
		  accept:'image/png, image/gif, image/jpg',
		  on:{
		    onUploadComplete:function() {
          $$('window_User_Uploader_Avatar').hide();
          $$('img_User_Avatar').refresh();
          $$('list_InnerProfile').refresh();
          $$('list_lastProfile').refresh();
          $$('tree_SegmentsSelector').refresh();
        }
		  }
		},
		{ view:'button', type:'iconButton', label:'Отмена', icon:'cancel-circle', click:'click_User_AvatarUpload_Cancel()', align:'center', labelAlign:'center' }
	],
	elementsConfig:{
		labelPosition:'top',
	}
};

webix.ui({
  view:'window',
  id:'window_User_Uploader_Avatar',
  width:450,
  height:250,
  position:'center',
  modal:true,
  head:'Загрузка новой фотографии',
  body:webix.copy(form_User_Uploader_Avatar)
});

var click_User_ChangeAvatar = function() {
  $$('window_User_Uploader_Avatar').getBody().clear();
  $$('window_User_Uploader_Avatar').show();
  $$('window_User_Uploader_Avatar').getBody().focus();
};
//end section: AVATAR user
//**************************************************************************************************

//**************************************************************************************************
//section: USER frames
var _ignoreSaveUserAttributes;
App.Func.loadUserAttributes = function() {
  var mydate = new Date();
  
  if($$('frame_User').isVisible()) {
    mydate = strIsoToDate(App.State.user.get('dateofbirth'));
    $$('label_User_Name').setValue(App.State.viewedUser.get('username'));

    $$('img_User_Avatar').setValues({src:'avtr'+App.State.user.get('id')+'.png'}, true);
    
    _ignoreSaveUserAttributes = true;
    $$('text_User_Attributes_Name').setValue(App.State.user.get('username'));
    $$('text_User_Attributes_Email').setValue(App.State.user.get('email'));
    $$('richselect_User_Attributes_Country').setValue(App.State.user.get('country'));
    $$('richselect_User_Attributes_City').setValue(App.State.user.get('city'));
    $$('datepicker_User_Attributes_Dateofbirth').setValue(mydate);
    $$('radio_User_Attributes_Gender').setValue(App.State.user.get('gender'));
    $$('richselect_User_Attributes_Familystatus').setValue(App.State.user.get('familystatus'));
    _ignoreSaveUserAttributes = false;
  } else {
    mydate = strIsoToDate(App.State.user.get('dateofbirth'));
    $$('label_ViewedUser_Name').setValue(App.State.viewedUser.get('username'));

    $$('avatarProfile_vieweduser').setValues({src:'avtr'+App.State.viewedUser.get('id')+'.png'}, true);
    
    $$('label_ViewedUser_Attributes_Name').setValue(App.State.viewedUser.get('username'));
    $$('label_ViewedUser_Attributes_Email').setValue(App.State.viewedUser.get('email'));
    $$('label_ViewedUser_Attributes_Country').setValue($$('suggestCountry').getItemText(App.State.viewedUser.get('country')));
    $$('label_ViewedUser_Attributes_City').setValue($$('suggestCity').getItemText(App.State.viewedUser.get('city')));
    $$('label_ViewedUser_Attributes_Dateofbirth').setValue(mydate);
    if(App.State.viewedUser.get('gender') === 0) {
      $$('label_ViewedUser_Attributes_Gender').setValue('Пол не выбран');
    } else if(App.State.viewedUser.get('gender') === 1) {
      $$('label_ViewedUser_Attributes_Gender').setValue('Мужской');
    } else if(App.State.viewedUser.get('gender') === 2) {
      $$('label_ViewedUser_Attributes_Gender').setValue('Женский');
    }
    $$('label_ViewedUser_Attributes_Familystatus').setValue($$('suggestFamilyStatus').getItemText(App.State.viewedUser.get('familystatus')));
  }
};

var saveUserAttributes = function(newv, oldv) {
  if(_ignoreSaveUserAttributes) return;
  //получаем идентификатор атрибута в котором изменились данные
  var atrID = this.config.id;
  
  //произведем валидацию атрибута
  try {
    switch (atrID) {
      case 'text_User_Attributes_Name':
        check(newv, 'Имя пользователя должно содержать от 1 до 20 символов').len(1, 20);
        check(newv, 'Такое имя пользователя не подходит').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
        
        App.State.user.set('username', newv);
        $$('label_User_Name').setValue(App.State.viewedUser.get('username'));

        break;
      case 'richselect_User_Attributes_Country':
        App.State.user.set('country', newv);

        break;
      case 'richselect_User_Attributes_City':
        App.State.user.set('city', newv);

        break;
      case 'richselect_User_Attributes_Familystatus':
        App.State.user.set('familystatus', newv);

        break;
      case 'datepicker_User_Attributes_Dateofbirth':
        App.State.user.set('dateofbirth', newv);

        break;
      case 'radio_User_Attributes_Gender':
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

var scrollview_User_Attributes = {
  view:'scrollview', id:'scrollview_User_Attributes',
  borderless: true, scroll:'y', autoheight:true,
  body:{
    rows:[
      { view:'template', template:'Персональные', type:'section', align:'center' },
      { view:'text', id:'text_User_Attributes_Name', label:'Имя пользователя', labelWidth:150, on:{'onChange': saveUserAttributes } },
      { view:'text', id:'text_User_Attributes_Email', label:'Email', labelWidth:150, disabled:true },
      { view:'richselect', id:'richselect_User_Attributes_Country', label:'Страна', suggest: 'suggestCountry', labelWidth:150, on:{'onChange': saveUserAttributes } },
      { view:'richselect', id:'richselect_User_Attributes_City', label:'Город', suggest: 'suggestCity', labelWidth:150, on:{'onChange': saveUserAttributes } },
      { view:'datepicker', id:'datepicker_User_Attributes_Dateofbirth', stringResult:true, label:'Дата рождения', labelWidth:150, format:'%d %M %Y', on:{'onChange': saveUserAttributes } },
      { view:'radio', id:'radio_User_Attributes_Gender', label:'Пол', vertical:true, options:[{ value:'Любой', id:0 }, { value:'Мужской', id:1 }, { value:'Женский', id:2 }], labelWidth:150, on:{'onChange': saveUserAttributes } },
      { view:'richselect', id:'richselect_User_Attributes_Familystatus', label:'Семейное положение', suggest:'suggestFamilyStatus', labelWidth:150, on:{'onChange': saveUserAttributes } }
  ]}
};

var scrollview_ViewedUser_Attributes = {
  view:'scrollview', id:'scrollview_ViewedUser_Attributes',
  borderless: true, scroll:'y',
  body:{
    rows:[
      { view:'template', template:'Персональные', type:'section', align:'center' },
      { cols:[ { view:'label', label:'Имя пользователя', width:120}, {view:'label', id:'label_ViewedUser_Attributes_Name'}] },
      { cols:[ { view:'label', label:'Email', width:120}, {view:'label', id:'label_ViewedUser_Attributes_Email'}] },
      { cols:[ { view:'label', label:'Страна', width:120}, {view:'label', id:'label_ViewedUser_Attributes_Country'}] },
      { cols:[ { view:'label', label:'Город', width:120}, {view:'label', id:'label_ViewedUser_Attributes_City'}] },
      { cols:[ { view:'label', label:'Дата рождения', width:120}, {view:'label', id:'label_ViewedUser_Attributes_Dateofbirth'}] },
      { cols:[ { view:'label', label:'Пол', width:120}, {view:'label', id:'label_ViewedUser_Attributes_Gender'}] },
      { cols:[ { view:'label', label:'Семейное положение', width:120}, {view:'label', id:'label_ViewedUser_Attributes_Familystatus'}] }
  ]}
};

var label_User_Name = {
  view:'label', id:'label_User_Name', css:{ 'padding-left':'5px;' }
};

var button_User_Back = {
  view:'button',id:'button_User_Back',css:'itsk_button',label:'Назад',height:28,gravity:1,on:{
		'onItemClick': function() { App.Router.navigate(App.State.getState('clientRoute', -1), {trigger:true} ); } }  
};

var frame_User = {
  id: 'frame_User',
  rows:[
    { cols:[ label_User_Name, { gravity:10 }, button_User_Back], css:{ 'border-bottom':'2px solid white;', 'background': '#F7F7F7;' } },
    { height:3 },
    { cols:[
      { rows: [
        { view:'template', id:'img_User_Avatar', width:200, height:200, borderless:true, template:function(obj) {
          return '<div class="frAv"> \
            <a href="javascript:click_User_ChangeAvatar()" class="ChangePicture"><span>Изменить аватарку</span></a> \
            <img src="img/avatars/200/'+obj.src+'?refresh='+Math.random()+'"></div>';
          }, //onClick: { frAv: function(e, id) { webix.message('Заглушка для выбора аватарки'); return false; } } //blocks default onclick event 
        },
        {  }
      ]},
      { width:10 },
      scrollview_User_Attributes
    ]}
  ]
};

var label_ViewedUser_Name = {
  view:'label', id:'label_ViewedUser_Name', css:{ 'padding-left':'5px;' }
};

var button_ViewedUser_Back = {
  view:'button',id:'button_ViewedUser_Back',css:'itsk_button',label:'Назад',height:28,gravity:1,on:{
		'onItemClick': function() { App.Router.navigate(App.State.getState('clientRoute', -1), {trigger:true} ); } }  
};

var frame_ViewedUser = {
  id: 'frame_ViewedUser',
  rows:[
    { cols:[ label_ViewedUser_Name, { gravity:10 }, button_ViewedUser_Back], css:{ 'border-bottom':'2px solid white;', 'background': '#F7F7F7;' } },
    { height:3 },
    { cols:[
      { rows: [
        { view:'template', id:'avatarProfile_vieweduser', width:200, height:200, borderless:true, template:function(obj) {
          return '<img src="img/avatars/200/'+obj.src+'">';
        } },
        {  }
      ]},
      { width:10 },
      scrollview_ViewedUser_Attributes
    ]}
  ]
};

var multiview_User = {
  view:'multiview', id:'multiview_User', container:'multiview_User',
  borderless:false, animate:false,
  cells:[ frame_User, frame_ViewedUser]
};

var frame_User_Albums = {
  id:'frame_User_Albums',
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

var frame_User_Achievements = {
  id:'frame_User_Achievements',
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

var tabview_User = {
  view:'tabview', id:'tabview_User',
  autoheight:true, autowidth:true,
  animate:true,
  tabbar : { optionWidth:200, height:28 },
  cells:[
    {
      header: 'Профиль',
      body: multiview_User
    },
    {
      header: 'Альбомы',
      body: frame_User_Albums
    },
    {
      header: 'Достижения',
      body: frame_User_Achievements
    }
  ]
};
//end section: USER frames
//**************************************************************************************************

//**************************************************************************************************
//section GROUP avatar
var click_Group_AvatarUpload_Cancel = function() {
	var id = $$('uploader_Group_Avatar').files.getFirstId();
	while (id) {
		$$('uploader_Group_Avatar').stopUpload(id);
		id = $$('uploader_Group_Avatar').files.getNextId(id);
	}
	$$('window_Group_Uploader_Avatar').hide();
};

var form_Group_Uploader_Avatar = {
	view:'form', id:'form_Group_Uploader_Avatar', borderless:true,
	elements: [
		{ view:'template', template:'<span>Было бы замечательно, если бы профиль вашей группы имел аватарку! Сейчас у вас замечательная возможность её выбрать!</span>' },
		{ view:'uploader', id:'uploader_Group_Avatar', 
		  value: 'Загрузить фото',
		  height:37, align:'center', 
      miltiple:false, autosend:true, 
		  formData:{ formname:'form_Group_Uploader_Avatar' },
		  upload:'api/v1/upload',
		  accept:'image/png, image/gif, image/jpg',
		  on:{
		    onUploadComplete:function() {
          $$('window_Group_Uploader_Avatar').hide();
          $$('img_Group_Avatar').refresh();
          $$('list_InnerProfile').refresh();
          $$('list_lastProfile').refresh();
          $$('tree_SegmentsSelector').refresh();
        }
		  }
		},
		{ view:'button', type:'iconButton', label:'Отмена', icon:'cancel-circle', click:'click_Group_AvatarUpload_Cancel()', align:'center', labelAlign:'center' }
	],
	elementsConfig:{
		labelPosition:'top',
	}
};

webix.ui({
  view:'window',
  id:'window_Group_Uploader_Avatar',
  width:450,
  height:250,
  position:'center',
  modal:true,
  head:'Загрузка новой фотографии',
  body:webix.copy(form_Group_Uploader_Avatar)
});

var click_Group_ChangeAvatar = function() {
  $$('window_Group_Uploader_Avatar').getBody().clear();
  $$('window_Group_Uploader_Avatar').show();
  $$('window_Group_Uploader_Avatar').getBody().focus();
};
//end section: AVATAR user
//**************************************************************************************************

//**************************************************************************************************
//section: GROUP frames
var _ignoreSaveGroupAttributes;
App.Func.loadGroupAttributes = function() {
  //if($$('frame_Group').isVisible()) {
    $$('label_Group_Name').setValue(App.State.viewedGroup.get('name'));
    $$('img_Group_Avatar').setValues({src:'avtr'+App.State.viewedGroup.get('id')+'.png'}, true);
    
    _ignoreSaveGroupAttributes = true;
    $$('text_Group_Attributes_Name').setValue(App.State.viewedGroup.get('name'));
    $$('text_Group_Attributes_Email').setValue(App.State.viewedGroup.get('email'));
    $$('text_Group_Attributes_Description').setValue(App.State.viewedGroup.get('description'));
    _ignoreSaveGroupAttributes = false;
  // } else {
  //   $$('bar_ViewedGroupProfile').data.value = App.State.viewedGroup.get('name');
  //   $$('bar_ViewedGroupProfile').refresh();
    
  //   $$('avatar_ViewedGroupProfile').setValues({src:'avtr'+App.State.viewedGroup.get('id')+'.png'}, true);
    
  //   $$('label_GroupProfile_Attributes_Name').setValue(App.State.viewedGroup.get('name'));
  //   $$('label_GroupProfile_Attributes_Email').setValue(App.State.viewedGroup.get('email'));
  //   $$('label_GroupProfile_Attributes_Description').setValue(App.State.viewedGroup.get('description'));
  // }
};

var saveGroupAttributes = function(newv, oldv) {
  if(_ignoreSaveGroupAttributes) return;
  //получаем идентификатор атрибута в котором изменились данные
  var atrID = this.config.id;
  
  //произведем валидацию атрибута
  try {
    switch (atrID) {
      case 'text_Group_Attributes_Name':
        check(newv, 'Имя группы должно содержать от 1 до 20 символов').len(1, 20);
        check(newv, 'Такое имя группы не подходит').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
        
        $$('label_Group_Name').setValue(App.State.viewedGroup.get('name'));
        break;
      case 'text_Group_Attributes_Email':
        App.State.viewedGroup.set('email', newv);

        break;
      case 'text_Group_Attributes_Description':
        App.State.viewedGroup.set('description', newv);

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

var scrollview_Group_Attributes = {
  view:'scrollview', id:'scrollview_Group_Attributes',
  borderless: true, scroll:'y',
  body:{
    rows:[
      { view:'template', template:'Персональные', type:'section', align:'center' },
      { view:'text', id:'text_Group_Attributes_Name', label:'Название группы', labelWidth:150, on:{'onChange': saveGroupAttributes } },
      { view:'text', id:'text_Group_Attributes_Email', label:'Email', labelWidth:150, disabled:true },
      { view:'text', id:'text_Group_Attributes_Description', label:'Описание группы', labelWidth:150, on:{'onChange': saveGroupAttributes } },
  ]}
};

var scrollview_ViewedGroup__Attributes = {
  view:'scrollview', id:'scrollview_ViewedGroup__Attributes',
  borderless: true, scroll:'y',
  body:{
    rows:[
      { view:'template', template:'Персональные', type:'section', align:'center' },
      { cols:[ { view:'label', label:'Название группы', width:120}, { view:'label', id:'label_ViewedGroup_Attributes_Name' }] },
      { cols:[ { view:'label', label:'Email', width:120 }, { view:'label', id:'label_ViewedGroup_Attributes_Email' }] },
      { cols:[ { view:'label', label:'Описание группы', width:120 }, { view:'label', id:'label_ViewedGroup_Attributes_Description' }] }
  ]}
};

var label_Group_Name = {
  view:'label', id:'label_Group_Name', css:{ 'padding-left':'5px;' }
};

var button_Group_Back = {
  view:'button',id:'button_Group_Back',css:'itsk_button',label:'Назад',height:28,gravity:1,on:{
		'onItemClick': function() { App.Router.navigate(App.State.getState('clientRoute', -1), {trigger:true} ); } }  
};

var frame_Group = {
  id: 'frame_Group',
  rows:[
    { cols:[ label_Group_Name, { gravity:10 }, button_Group_Back], css:{ 'border-bottom':'2px solid white;', 'background': '#F7F7F7;' } },
    { height:3 },
    { cols:[
      { rows: [
        { view:'template', id:'img_Group_Avatar', width:200, height:200, borderless:true, template:function(obj) {
          return '<div class="frAv"> \
            <a href="javascript:click_Group_ChangeAvatar()" class="ChangePicture"><span>Изменить аватарку</span></a> \
            <img src="img/gravatars/200/'+obj.src+'?refresh='+Math.random()+'"></div>';
          }
        },
        {  }
      ]},
      { width:10 },
      scrollview_Group_Attributes
    ]}
  ]
};

var label_ViewedGroup_Name = {
  view:'label', id:'label_ViewedGroup_Name', css:{ 'padding-left':'5px;' }
};

var button_ViewedGroup_Back = {
  view:'button',id:'button_ViewedGroup_Back',css:'itsk_button',label:'Назад',height:28,gravity:1,on:{
		'onItemClick': function() { App.Router.navigate(App.State.getState('clientRoute', -1), {trigger:true} ); } }  
};

var frame_ViewedGroup = {
  id: 'frame_ViewedGroup',
  rows:[
    { cols:[ label_ViewedGroup_Name, { gravity:10 }, button_ViewedGroup_Back], css:{ 'border-bottom':'2px solid white;', 'background': '#F7F7F7;' } },
    { height:3 },
    { cols:[
      { rows: [
        { view:'template', id:'avatar_ViewedGroupProfile', width:200, height:200, borderless:true, template:function(obj) {
          return '<img src="img/gravatars/200/'+obj.src+'">';
        } },
        {  }
      ]},
      { width:10 },
      scrollview_ViewedGroup__Attributes
    ]}
  ]
};

var multiview_Group = {
  view:'multiview', id:'multiview_Group', container:'multiview_Group',
  borderless:false, animate:false,
  cells:[ frame_Group, frame_ViewedGroup ]
};

var frame_Group_Albums = {
  id:'frame_Group_Albums',
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

var frame_Group_Achievements = {
  id:'frame_Group_Achievements',
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

var tabview_Group = {
  view:'tabview', id:'tabview_Group',
  autoheight:true, autowidth:true,
  animate:true,
  tabbar : { optionWidth:200, height:28 },
  cells:[
    {
      header: 'Профиль',
      body: multiview_Group
    },
    {
      header: 'Альбомы',
      body: frame_Group_Albums
    },
    {
      header: 'Достижения',
      body: frame_Group_Achievements
    }
  ]
};
//end section: GROUP frames
//**************************************************************************************************

//bru: функция вызываемая при нажатии на ссылке с именем пользователя, для перехода на профиль пользователя
var UserRout = function(id) {
  App.Router.navigate('id' + id, {trigger: true});
};

//bru: успешный ответ сервера на запрос добавления друга
var addUserResponse = function(text, data) {
  var btn = document.getElementById('buttonAddUserFriend' + data.json().userId);
  btn.setAttribute('disabled', true);
  btn.innerHTML = 'Добавлен в друзья';
};

//bru: функция вызываемая нажатием кнопки добавления друга
var addUserFriend = function(id) {
  var promise = webix.ajax().put('api/v1/users', { userId: id }, addUserResponse);
  promise.then(function(realdata){}).fail(function(err) {
    //$$('frameCentralRegister_authenticateError').setValues({ src:err.responseText });
  });
};

//bru: успешный ответ сервера на запрос удаления друга
var deleteUserResponse = function(text, data) {
  var btn = document.getElementById('buttonAddUserFriend' + data.json().userId);
  btn.setAttribute('disabled', true);
  btn.innerHTML = 'Удален из друзей';
};

//bru: функция вызываемая нажатием кнопки удаления друга
var deleteUserFriend = function(id) {
  var promise = webix.ajax().del('api/v1/users', { userId: id }, deleteUserResponse);
  promise.then(function(realdata){}).fail(function(err) {
    //$$('frameCentralRegister_authenticateError').setValues({ src:err.responseText });
  });  
};

//bru: фрейм выводящий список пользователей и друзей
var dataview_Users = {
  view:'dataview', id:'dataview_Users',
  borderless:true, scroll:'y', xCount:1,
  type:{ height:120, width:500 },
  //template:'html->dataview_Users_template',
  template:function(obj) {
    //bru: построение элемента в списке друзей
    // var htmlCode = '<div>';
    // htmlCode = htmlCode + '<div class="friend_avatar"><img style="width:100px; height:100px;" src="/img/avatars/100/'+obj.img+'"/></div>';
    // htmlCode = htmlCode + '<div class="friend_info"><a class="itmTextBold" href="javascript:UserRout('+obj.id+')">'+obj.username+'</a>';
    // htmlCode = htmlCode + '<div><span>Email:</span>'+obj.email+'</div></div>';
    
    // //bru: если показываются друзья текущего пользователя, то кнопка "Добавить друга" меняется на "Удалить друга"
    // if(App.State.SelectedProfile.id === App.State.user.get('id') && App.State.SelectedProfile.type === 'myprofile') {
    //   htmlCode = htmlCode + '<button class="buttonAddUserFriend" id="buttonAddUserFriend'+obj.id+'" onclick="deleteUserFriend('+obj.id+');">Убрать из друзей</button>';
    // } else {
    //   //bru: если показываются друзья не текущего пользователся, то кнопка активируется кнопка "Добавить друга"
    //   //в случае если у текущего пользователя уже есть такой друг, на что указывает флаг isFriend, то кнопка добавить в друзья не показывается
    //   if(!obj.isFriend) {
    //     htmlCode = htmlCode + '<button class="buttonAddUserFriend" id="buttonAddUserFriend'+obj.id+'" onclick="addUserFriend('+obj.id+');">Добавить в друзья</button>';
    //   }
    // }
    // htmlCode = htmlCode + '</div>'
    
    var htmlCode = '<div class="user-box"> \
	    <img class="user_avatar" src="/img/avatars/100/'+obj.img+'"/> \
	    <div class="friend_info"><a class="itmTextBold" href="javascript:UserRout('+obj.id+')">'+obj.username+'</a></div> \
	    <div class="friend_info"> <span>Email:</span>'+obj.email+' </div> ';
	    //<img class="user_img_status" src="https://vfs-gce-eu-13-4.c9.io/vfs/938189/oAAIvdZO1pgttW62/workspace/client/img/'+obj.groupRole+'.png"/> \
      
      //bru: если показываются друзья текущего пользователя, то кнопка "Добавить друга" меняется на "Удалить друга"
      if(App.State.SelectedProfile.id === App.State.user.get('id') && App.State.SelectedProfile.type === 'myprofile') {
        htmlCode = htmlCode + '<div class="user_buttons"> \
  	      <button class="user_more_button" id="buttonAddUserFriend'+obj.id+'" onclick="deleteUserFriend('+obj.id+');"> Убрать из друзей </button> \
  	      <button class="user_more_button"> Пригласить в группу </button> \
  	    </div>';
      } else {
        //bru: если показываются друзья не текущего пользователся, то кнопка активируется кнопка "Добавить друга"
        //в случае если у текущего пользователя уже есть такой друг, на что указывает флаг isFriend, то кнопка добавить в друзья не показывается
        if(!obj.isFriend) {
          htmlCode = htmlCode + '<div class="user_buttons"> \
    	      <button class="user_more_button" id="buttonAddUserFriend'+obj.id+'" onclick="addUserFriend('+obj.id+');"> Добавить в друзья </button> \
    	      <button class="user_more_button"> Пригласить в группу </button> \
    	    </div>';
        } else {
          htmlCode = htmlCode + '<img class="user_img_isFriend" src="/img/friends.png"/>';
          htmlCode = htmlCode + '<div class="user_buttons"> \
    	    </div>';
        }
      }
	    htmlCode = htmlCode + '</div>';

    return htmlCode;
  },
	//select:1,
	datafetch:5,
	autowidth:true,
	on:{
	  'onItemDblClick': function(id, e, node) {
      //var item = this.getItem(id);
      App.Router.navigate('id' + id, {trigger: true});
    }
	}
};

var toggle_Users_Members = {
  view:'toggle', id:'toggle_Users_Members',
  label:'Друзья',
  css:'itsk_button',
  height:28,
  gravity:2,
	on:{
		'onItemClick': function() { 
      switch(App.State.SelectedProfile.type) {
        case 'myprofile':
          App.Router.navigate('users?id=' + App.State.SelectedProfile.id, { trigger:true } );
          break;
        case 'groupprofile':
          App.Router.navigate('users?gr=' + App.State.SelectedProfile.id, { trigger:true } );
          break;
      }
		}
	}  
};

var toggle_Users_Request = {
  view:'toggle', id:'toggle_Users_Request',
  label:'Заявки',
  css:'itsk_button',
  height:28,
  gravity:2,
	on:{
		'onItemClick': function() { 
      switch(App.State.SelectedProfile.type) {
        case 'myprofile':
          App.Router.navigate('users?id=' + App.State.SelectedProfile.id + '&request=1', { trigger:true } );
          break;
        case 'groupprofile':
          App.Router.navigate('users?gr=' + App.State.SelectedProfile.id + '&request=1', { trigger:true } );
          break;
      }
		}
	}  
};

var toggle_Users_Invitations = {
  view:'toggle', id:'toggle_Users_Invitations',
  css:'itsk_button',
  label:'Все',
  height:28,
  gravity:2,
	on:{
		'onItemClick': function() { 
		  App.Router.navigate('users', { trigger:true } );
		}
	}  
};

var button_Users_Back = {
  view:'button', id:'button_Users_Back',
  css:'itsk_button',
  label:'Назад',
  height:28,
  gravity:1,
	on:{
		'onItemClick': function() { 
		  App.Router.navigate(App.State.getState('clientRoute', -1), {trigger:true} ); 
		}
	}  
};

var search_Users = {
  view:'search', id:'search_Users',
  css:'search_Users',
  align:'center', 
  height:28,
  placeholder:'Введите любое имя, название или слово'
};

/**
* ui: frame_Users
* ui.tree: multiview_Central.frame_Users
*   конфигурация интерфейса для фрейма со списком пользователей у различных сегментов. 
* Содержит: поле поиска (search_Users), переключатели состава самого списка (toggle_Users_Members,
* toggle_Users_Request, toggle_Users_Invitations), кнопка перехода назад по истории 
* переходов (button_Users_Back), описание выбранного состава (label_UsersHeader), 
* динамический список пользователей запрашиваемый у сервера (dataview_Users)
*****************************************************************************/
var frame_Users = {
  id:'frame_Users',
  css:'frame_Users',
  autoheight:true, autowidth:true,
  cols:[{ css:{ 'background':'white' } }, 
  { rows:[
      search_Users,
      { cols:[ toggle_Users_Members, toggle_Users_Request, toggle_Users_Invitations, { gravity:2 }, button_Users_Back] },
      { id:'label_UsersHeader', template:'#title#', height:38, borderless:true, data: { title: '' } },
      dataview_Users ]
  },
  { css:{ 'background':'white' } }]
};

//**************************************************************************************************
//OTHER frames
var reglogResponse = function(text, data) {
  //App.State.user.set({'mainUserLogged': true}, {silent: true});
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
	//height: 49, 
	elements:[{ view:'toggle', type:'icon', icon:'bars', width:30, height:30, disabled:true },
	          { view: 'label', label: "<span class='headerLabel'>InTask.me</span>", width:175, align: 'center' },
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

App.Frame.multiview_Central = {
  view:'multiview', id:'multiview_Central', container:'multiview_Central',
  cells:[App.Frame.frameBlank,
    App.Frame.frameCentral_Greeting,
    frame_Groups,
    frame_Tasks,
    frame_Users,
    App.Frame.frameCentral_Register,
    App.Frame.frameCentral_Login,
    tabview_User,
    tabview_Group],
  fitBiggest:true,
  animate:false
};