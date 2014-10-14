//блок, который исполнит вебикс когда все загрузит
var implementFunction = (function() {
  //создадим экземпляр бакбоновского роутера, который будет управлять навигацией на сайте
	App.Router = new (Backbone.Router.extend({
	  //слева роут, косая в скобках означает, что роут может быть как с косой чертой на конце, так и без нее
	  //справа функция, которая вызовется для соответствующего роута
		routes:{
			"login(/)":"login",
			"logout(/)":"logout",
			"register(/)":"register",
			"groups(/)":"groups",
			"films/:id":"details",
			'home(/)':"home",
			'':"index"
		},
		//home выбрасывает в корень
		home:function() {
		  this.navigate('', {trigger: true});
		},
		//корень приложения
		index:function() {
			if(App.User) {
			};
			
			//$$("mylist").attachEvent("onAfterSelect", function(id){
				//Router.navigate("films/"+id, { trigger:true });
		  //});
		},
		//раздел группы
		groups:function() {
		  
		},
		login:function() {
		  webix.message(App.User.get('username') + " login ");
		},
		logout:function() {
		},
		register:function() {
  	},
  	//тестовая заглушка, закрою её нахуй, как доберуться руки
		details:function(id) {
			//template.render();
		}
	}));
	
	//Это пример данных в коллекции. Бакбоновские коллекции не организуют иерархически данные
	//поэтому создан объект treeManager, экземпляры которого позволяют строить дерево из бакбоновской 
	//коллекции и хранить в себе древовидный массив
	var collect = [
    {id:1, parent_id:0, name: "My organization", numUsers: 5},
    {id:2, parent_id:1, name: "Administrations", numUsers: 2},
    {id:3, parent_id:2, name: "CEO", numUsers: 1},
    {id:55, parent_id:2, name: "Vice CEO", numUsers: 1},
    {id:425, parent_id:55, name: "financical departament", numUsers: 2},
    {id:4, parent_id:0, name: "investors", numUsers: 1}
  ];

	//Инициализируем глобальный объект пользователя со всеми настройками приложения
	//пробуем получить рест запросом с сервера
	App.User = new App.Models.User();
	App.User.fetch();

  //Создаем коллекцию групп (инициализируя тестовыми данными)
	App.Collections.Groups = new collectionGroups(collect);

  //Обработка события добавления в коллекцию групп
	App.Collections.Groups.on('add', function(grp) {
	});
	
	App.Collections.Groups.on('remove', function(ind) {
	});

  App.Collections.Groups.on('change', function(model, options) {
  });
  
	//Создаем на основе коллекции менеджер дерева групп
	//App.Store = new webix.TreeCollection();

  var grouptoolframe = {
    view:'toolbar',
    id:'grouptoolframe',
    cols:[
      { view:'button', value:'Добавить основную', width:140, align:'left', on:{
        'onItemClick':function() {  }
      } },
      { view:'button', value:'Добавить', width:100, align:"left", on:{
  		  'onItemClick':function() {  }
      } },
      { view:'button', value:'Удалить', width:100, align:"left", on:{
        'onItemClick':function() {
        }
      } },
      { }
    ]
  };

  webix.proxy.myData = {
    $proxy:true,
    init:function(){
      //webix.extend(this, webix.proxy.offline);
    },
    load: function(view, callback) {
      //Добавляем id вебиксовых вьюх для синхронизации с данными
  	  //важно добавлять уже после создания всех вьюх, иначе будут добавлены пустые объекты
    
      if(view.config.id === 'ingrid_groupframe') {
        //$$('ingrid_groupframe').data.sync(App.Store);
        //App.Trees.GroupTree.viewsAdd($$('ingrid_groupframe'));
        //var datoid = $$('ingrid_groupframe').data;
        //datoid.sync(App.Store);
      //App.Store.sync($$('ingrid_groupframe'));
      }
      
      if(view.config.id === 'slicegroups') {
        //App.Trees.GroupTree.viewsAdd($$('slicegroups'));
      }
    }
  };

  var ingrid_groupframe = {
    id:'ingrid_groupframe',
  	view:'treetable', 
  	editable:true, 
  	autoheight:true, 
  	select: true,
  	columns:[
  		{ id:'id', header:'', css:{"text-align":"center"}, width:40 },
  		{ id:'name', editor:"text", header:'Имя групы', width:250, template:'{common.treetable()} #name#' },
  		{ id:'numUsers', header:'Польз.', width:50 }
  		],
  	on: {
  	  'onItemClick':function() {

  	  }
  	},
  	url: "myData->load"
  };

  var groupframe = {
  	id:'groupframe',
  	view:'tabview',
  	animate:'true',
  	tabbar : { optionWidth : 200 },
    cells:[
      {
       header:'Мои группы',
       body:{
          id:'mygroups_groupframe',
          rows:[
            grouptoolframe,
            ingrid_groupframe]
          }
      },
      {
       header:'Общественные группы',
       body:{
          id:'communitygroups_groupframe',
          rows:[
            //grouptoolframe,
            {}]        
          }
      }
    ]
  };

  var masterframe = new webix.ui({
    id:"masterframe",
    container:"masterframe",
    rows:[groupframe]
  });
  
  var Store = new webix.TreeCollection();
  //Store.add({id:1, parent_id:0, name: "My organization", numUsers: 5});
  $$('ingrid_groupframe').data.sync(Store);
  
	webix.i18n.parseFormatDate = webix.Date.strToDate("%m/%d/%Y");
  webix.event(window, "resize", function(){ masterframe.adjust(); })
	Backbone.history.start({pushState: true, root: "/"});
});

//(frame)(id)(view)
//masterframe|
//->headerframe||toolbar
// ->btnHome|btnHome|button
// ->lblInTask|lblInTask|label
// ->searchMaster||search
// ->btnChat||toggle-iconButton
// ->btnEvents||toggle-iconButton
// ->mnuSegments||richselect
// ->btnSettings|btnSettings|button
//->sliceframe|sliceframe|accordion
// ->slicegroups|slicegroups|tree
// ->sliceusers|sliceusers|tree
// ->sliceprojects|sliceprojects|tree
// ->slicecategory|slicecategory|tree
// ->slicetags|slicetags|tree
//[ container:'centralframe' - в контейнере замещаются фреймы
//->greetingframe|greetingframe|
// ->||htmlform|http->greeting.html
// ->|btnTry|button
// ->|btnRegister|button
// ->|btnLogin|button
//->groupframe|groupframe|tabview
// ->|mygroups_groupframe|
//  ->grouptoolframe|grouptoolframe|toolbar
//   ->||button
//   ->||button
//  ->ingrid_groupframe|ingrid_groupframe|treetable
// ->|communitygroups_groupframe|
//  ->grouptoolframe|grouptoolframe|toolbar
//   ->||button
//   ->||button
//  ->
//]
//->optionsframe|optionsframe|accordion

//throw new TypeError('Array.prototype.some called on null or undefined')
	//console.log(JSON.stringify(App.Trees.GroupTree.tree));