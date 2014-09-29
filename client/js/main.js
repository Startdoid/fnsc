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
			    
			    //Меняем окно приветствия, на окно конфигурации групп
			    webix.ui(App.Frame.groupframe, $$('greetingframe'));

			    //console.log(masterframe.getChildViews()[1].getChildViews()23);
			    //console.log(top.getChildViews()[1]);
			    //webix.ui( App.Frame.workframe, $$('masterframe'), top.getChildViews()[1].getChildViews()[1]);
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

  //объект организует работу с деревьями, для того что бы линейную бэкбоновскую коллекцию
  //разворачивать в древовидную структуру и выводить в webix-овые вьюхи
	var treeManager = function (collection) {
	  //древовидный массив
	  var tree = [];
	  var views = [];

    //рекурсивный перебор
    var treeRecursively = function(branch, list) {
      if (typeof branch == 'undefined') return null;
      var tr = [];
      for(var i=0; i<branch.length; i++)      
      {
          branch[i].data = treeRecursively(list[ branch[i].id ], list);
          tr.push(branch[i]);
      }
      return tr;
    };

    var someFunct = function(element, index, array) {
      if(element.parent_id === this.parent_id) {
        element.data.push(this);
        return true;
      } else {
        if(typeof element.data === 'object') {
          if(Array.isArray(element.data)) {
            element.data.some(someFunct, this);
          }
        }
      }
  	  //var hatiko = $$("ingrid_groupframe");
  	  //hatiko.add(grp.attributes);
    };
    
    var addRecursively = function(branch, element) {
      if (typeof branch == 'undefined') return null;
      if (element.parent_id === branch.parent_id) {
        
      } else {
        for (var data in branch) {
          Things[data]
        }
      }
    };

    this.treeBuild = function(collection) {
	    //преобразуем в линейный массив бэкбоновскую коллекцию (разворачиваем атрибуты объекта)
      var maplist = collection.map(function(object) { return object.attributes });
      //сгруппируем элементы массива по родителю
      var list = _.groupBy(maplist, 'parent_id');
      //рекурсивно перебирая сгруппированный массив построим дерево
      tree = treeRecursively(list[0], list);
    };
    
    //добавление элемента в дерево, автоматическое обновление элементов во вьюхах из массива views
    this.treeAdd = function(element) {
      //tree.some(someFunct, element.attributes);
      addRecursively(tree, element.attributes);
      console.log(JSON.stringify(tree));
    };
    
    //добавление вьюхи в массив для датабиндинга
    this.viewsAdd = function(view) {
      console.log('view add');
      if (typeof view === 'object')
      {
        //добавим в массив, если нет такой
        if(views.indexOf(view) === -1) {
          views.push(view);
          
          //обновим вновь добавленную информацией из дерева
          view.clearAll();
          view.parse(JSON.stringify(tree));
        };
      };
    };
    
    //удаление вьюхи из массива датабиндинга
    this.viewsDelete = function(view) {
      console.log('view delete');
    };
    
    //если при создании объекта передан не пустой параметр, то формируется дерево
	  if (typeof collection !== 'undefined')
	  {
	    this.treeBuild(collection);
	  };
  };

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
	
  //Создаем коллекцию групп
	App.Collections.Groups = new collectionGroups(collect);

  //Обработка события добавления в коллекцию групп
	App.Collections.Groups.on('add', function(grp) {
	  App.Trees.GroupTree.treeAdd(grp);
	  webix.message(" collection add " + grp.get("name"));
	});

	//Создаем на основе коллекции менеджер дерева групп
	App.Trees.GroupTree = new treeManager(App.Collections.Groups.models);
	console.log(JSON.stringify(App.Trees.GroupTree.tree));

  //вебикс конфигурация основного окна загруженная в экземпляр объекта вебиксового менеджера окон
  //описание внизу модуля
  var masterframe = new webix.ui({
    id:"masterframe",
    container:"masterframe",
    rows:[App.Frame.headerframe, 
      {cols:[App.Frame.sliceframe, App.Frame.greetingframe, App.Frame.optionsframe]}
    ]
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