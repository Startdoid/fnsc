var implementFunction = (function() {
	App.Router = new (Backbone.Router.extend({
		routes:{
			"login(/)":"login",
			"logout(/)":"logout",
			"register(/)":"register",
			"groups(/)":"groups",
			"films/:id":"details",
			'home(/)':"home",
			'':"index"
		},
		home:function() {
		  this.navigate('', {trigger: true});
		},
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
            collection: App.Collections.SliceGroups,
            config: {
    					isolate:true, 
              view:"tree",
						  id:"inslicegroups",
							template:'{common.icon()}{common.folder()}<span>#name#</span>',
							select:true 
            },
            afterRender: function(){
					    //this.getChild("mylist").attachEvent("onAfterSelect", _.bind(this.listSelected,this));
					    //console.log(this.collection);
					    //$$("inslicegroups").parse(this.collection.toJSON());
					    //this.getChild("inslicegroups").parse( this.collection.first().toJSON());
					    $$("inslicegroups").sync(this.collection);
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
		groups:function() {
		  
		},
		login:function() {
		  webix.message(App.User.get('username') + " login ");
		},
		logout:function() {
		},
		register:function() {
  	},
		details:function(id) {
			//template.render();
		}
	}));

  var masterframe = new webix.ui({
    id:"masterframe",
    container:"masterframe",
    rows:[App.Frame.headerframe, 
      {cols:[App.Frame.sliceframe, App.Frame.greetingframe, App.Frame.optionsframe]}
    ]
  });

	//var template = new App.Views.DView();
	
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

  //Collections init
	App.Collections.Groups = new collectionGroups();

  var addDefaultGroupsModel = function() {
    App.Collections.SliceGroups.add(new App.Models.Group({ 
      id: 0,
      parentId: 0,
      name: 'Default',
      picId: 0,
      numUsers: 1,
      numTask: 0
    }));
    
    App.Collections.SliceGroups.add(new App.Models.Group({ 
      id: 1,
      parentId: 0,
      name: 'Default try',
      picId: 0,
      numUsers: 1,
      numTask: 0
    }));
  };

	App.Collections.SliceGroups = new collectionGroups();
	App.Collections.SliceGroups.fetch();
	if(App.Collections.SliceGroups.length === 0) {
    addDefaultGroupsModel();
	} else {
	  var defaultModels = App.Collections.SliceGroups.where({name: 'Default'});
	  if(defaultModels.length === 0) {
	    addDefaultGroupsModel();
	  }
	};

	App.Collections.SliceGroups.on('change', function() {
	  webix.message(" collection change ");
	});

  webix.i18n.parseFormatDate = webix.Date.strToDate("%m/%d/%Y");
  webix.event(window, "resize", function(){ masterView.adjust(); })
	Backbone.history.start({pushState: true, root: "/"});
});