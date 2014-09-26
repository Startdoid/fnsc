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
			  webix.message(App.User.get('username') + " :index ");
			  
			  if((App.User.get('id') === 0) && (!App.User.get('thisTry')))
	      {
      	  $$("sliceframe").define("collapsed", true);
      		$$("sliceframe").disable();
      		$$("sliceframe").refresh();
      			  
      		$$("optionsframe").define("collapsed", true);
      		$$("optionsframe").disable();
      		$$("optionsframe").refresh();
    	  } else {
      		$$("sliceframe").enable();
      		$$("sliceframe").refresh();
      			  
      		$$("optionsframe").enable();
      		$$("optionsframe").refresh();
    	  }
			  
			  if(App.User.get('thisTry')) {
			    webix.message(App.User.get('username') + " :thisTry ");
			    webix.ui(App.Frame.groupframe, $$('greetingframe'));

        	App.WebixViews.SliceGroups = new (WebixView.extend({
            id:"slicegroupsframe",
            el: $$("slicegroups"),
            collection: App.Collections.Groups,
            config: {
    					isolate:false, 
              view:"tree",
						  id:"inslicegroups",
							template:'{common.icon()}{common.folder()}<span>#name#</span>',
							select:true 
            },
            initialize: function() {
              //_.bindAll(this, "render");what is it?
              this.listenTo(this.collection, "add", this.afterRender);
              console.log('init render');
            },
            afterRender: function(){
					    //this.getChild("mylist").attachEvent("onAfterSelect", _.bind(this.listSelected,this));
					    //console.log(JSON.stringify(App.Collections.Groups));
					    $$("inslicegroups").clearAll();
					    $$("inslicegroups").parse(JSON.stringify(App.Trees.GroupTree.tree));
					    //this.getChild("inslicegroups").parse( this.collection.first().toJSON());
					    //$$("inslicegroups").sync(this.collection);
					    //console.log(JSON.stringify(App.Collections.Groups));
				    }
          }));
          
          App.WebixViews.GridGroups = new (WebixView.extend({
            id:"gridgroupsframe",
            el: $$("grid_groupframe"),
            config: App.Frame.ingrid_groupframe,
            afterRender: function(){
				    }
          }));
          
          App.WebixViews.SliceUsers = new (WebixView.extend({
            id:"sliceusersframe",
            el: $$("sliceusers"),
            config: {
              view:'tree',
              select:true,
                data: [
                  { id:'viktor', value:'Виктор' },
                  { id:'lubov', value:'Любовь' },
                  { id:'denis', value:'Денис' }
                ]
            }
          }));
          
          App.WebixViews.SliceProjects = new (WebixView.extend({
            id:"sliceprojectsframe",
            el: $$("sliceprojects"),
            config: {
              view:'tree',
                data: [
                  { id:'Default', value:'Default' },
                  { id:'InTaskoid', value:'InTask.me' }
                ]
            }
          }));
          
          App.WebixViews.SliceCategory = new (WebixView.extend({
            id:"slicecategoryframe",
            el: $$("slicecategory"),
            config: {
              view:'tree',
                data: [
                  { id:'Default', value:'Default' }
                ]
            }
          }));
          
          App.WebixViews.SliceTags = new (WebixView.extend({
            id:"slicetagsframe",
            el: $$("slicetags"),
            config: {
              view:'tree',
                data: [
                  { id:'InTaskoid', value:'InTask.me' }
                ]
            }
          }));
          
          //console.log($$("sliceprojects"));

          App.WebixViews.SliceGroups.render();
          App.WebixViews.SliceUsers.render();
          App.WebixViews.SliceProjects.render();
          App.WebixViews.SliceCategory.render();
          App.WebixViews.SliceTags.render();
          App.WebixViews.GridGroups.render();
			    //console.log(masterframe.getChildViews()[1].getChildViews()23);
			    //console.log(top.getChildViews()[1]);
			    //webix.ui( App.Frame.workframe, $$('masterframe'), top.getChildViews()[1].getChildViews()[1]);
          
          // top.define("rows", [App.Frame.headerframe, 
          //     {cols:[App.Frame.groupingframe, App.Frame.workframe, App.Frame.optionsframe]}
          //   ]
          // );
  		  } else {
			  }
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

  //вебикс конфигурация основного окна загруженная в экземпляр объекта вебиксового менеджера окон
  //описание внизу модуля
  var masterframe = new webix.ui({
    id:"masterframe",
    container:"masterframe",
    rows:[App.Frame.headerframe, 
      {cols:[App.Frame.sliceframe, App.Frame.greetingframe, App.Frame.optionsframe]}
    ]
  });

	//Инициализируем глобальный объект пользователя со всеми настройками приложения
	//пробуем получить рест запросом с сервера
	App.User = new App.Models.User();
	App.User.fetch();
	 
	//Привязываем события которые будут обрабатываться User model
	App.User.on('change:thisSegment', function() {
	  webix.message(App.User.get('thisSegment') + " segment select");
	  App.Router.navigate('groups', {trigger:true} );
	});

	App.User.on('change:thisTry', function() {
	  webix.message(App.User.get('thisSegment') + " segment select");
	  App.Router.navigate('home', {trigger:true} );
	});

  //объект организует работу с деревьями
	var treeBuilder = function (collection) {
	  this.tree = [];

	  this.treeRecursively = function(branch, list) {
      //recursively builds tree from list with parent-child dependencies
      if (typeof branch == 'undefined') return null;
      var tree = [];
      for(var i=0; i<branch.length; i++)      
      {
          branch[i].data = this.treeRecursively( list[ branch[i].id ], list);
          tree.push(branch[i]);
      }
      return tree;
    };

    this.treeBuild = function(collection) {
      var maplist = collection.map(function(object) { return object.attributes });
      var list = _.groupBy(maplist, 'parent_id');
      this.tree = this.treeRecursively(list[0], list);
    };
    
	  if (typeof collection !== 'undefined')
	  {
      var maplist = collection.map(function(object) { return object.attributes });
      var list = _.groupBy(maplist, 'parent_id');
      this.tree = this.treeRecursively(list[0], list);
	  };
  };
	
	//Это пример данных в коллекции. Бакбоновские коллекции не организуют иерархически данные
	//поэтому выше создан объект, экземпляры которого позволяют строить дерево из бакбоновской 
	//коллекции и хранить в себе древовидный массив
	var collect = [
    {id:1, parent_id:0, name: "My organization", numUsers: 5},
    {id:2, parent_id:1, name: "Administrations", numUsers: 2},
    {id:3, parent_id:2, name: "CEO", numUsers: 1},
    {id:55, parent_id:2, name: "Vice CEO", numUsers: 1},
    {id:425, parent_id:55, name: "financical departament", numUsers: 2},
    {id:4, parent_id:0, name: "investors", numUsers: 1}
  ];

  //Collections init
	App.Collections.Groups = new collectionGroups(collect);
	
	App.Trees.GroupTree = new treeBuilder(App.Collections.Groups.models);
	//App.Trees.GroupTree.treeBuild(App.Collections.Groups.models);
	
	console.log(JSON.stringify(App.Trees.GroupTree.tree));

	//App.Collections.SliceGroups = new collectionGroups();
	//App.Collections.SliceGroups.fetch();
	//if(App.Collections.SliceGroups.length === 0) {
    //addDefaultGroupsModel();
	//} else {
	//  var defaultModels = App.Collections.SliceGroups.where({name: 'Default'});
	//  if(defaultModels.length === 0) {
	//    addDefaultGroupsModel();
	//  }
	//};

	App.Collections.Groups.on('add', function() {
	  $$("ingrid_groupframe").clearAll();
	  $$("ingrid_groupframe").parse(JSON.stringify(App.Trees.GroupTree.tree));
	  webix.message(" collection add ");
	});

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
// ->slicegroups
// ->sliceusers
// ->sliceprojects
// ->slicecategory
// ->slicetags
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
//  ->|grid_groupframe|->(поиск по id и замена на)->[WebixView]GridGroups|gridgroupsframe
//   ->ingrid_groupframe|ingrid_groupframe|treetable
// ->|communitygroups_groupframe|
//  ->grouptoolframe|grouptoolframe|toolbar
//   ->||button
//   ->||button
//  ->
//]
//->optionsframe|optionsframe|accordion