App.Frame.lblInTask = {
	id:"lblInTask",
	width:100,
	view: "label",
	label:"InTask.me",
	on:{
		'onItemClick': function(){ webix.message("onGoHome"); }
	}
};

App.Frame.btnHome = {
	id:"btnHome",
	view:"button", 
	type:"icon", 
	icon:"home", 
	width:25,
	on:{
		'onItemClick': function() { App.Router.navigate('home', {trigger:true} ); }
	}
};

App.Frame.btnSettings = {
	id:"btnSettings",
	view:"button", 
	type:"icon", 
	icon:"cogs", 
	width:25,
	align:"right",
	on:{
		'onItemClick': function(){ webix.message("onGoHome"); }
	}
};

App.Frame.btnChat = {
	view:"toggle", 
	type:"iconButton",
	name:"s1",
	icon:"envelope",
	label:"Чат",
	align:"right",
	value:0,
	width: 100
};

App.Frame.btnEvents = {
	view:"toggle", 
	type:"iconButton",
	name:"s1",
	icon:"info",
	label:"События",
	value:0,
	align:"right",
	width: 100
};

App.Frame.mnuSegments = {
	view:"richselect", 
	width:300,
	label: 'Сегменты', 
	labelAlign:"right",
	align:"right",
	value:1, options:[
		{ id:1, value:"Группы" }, 
		{ id:2, value:"Задачи" }, 
		{ id:3, value:"Шаблоны" },
		{ id:4, value:"Финансы" },
		{ id:5, value:"Процессы" },
		{ id:6, value:"Файлы" },
		{ id:7, value:"Заметки" }
	],
	on: {
    'onChange': function(newv, oldv) {
      switch(newv) {
        case 1:
          App.User.set('thisSegment', 'groups');
          break;
        case 2:
          App.User.set('thisSegment', 'tasks');
          break;
        case 3:
          App.User.set('thisSegment', 'templates');
          break;
        case 4:
          App.User.set('thisSegment', 'finances');
          break;
        case 5:
          App.User.set('thisSegment', 'process');
          break;
        case 6:
          App.User.set('thisSegment', 'files');
          break;
        case 7:
          App.User.set('thisSegment', 'notes');
          break;          
      }
    }
	}
};

App.Frame.searchMaster = {
	view:"search",
	maxWidth:400,
	placeholder:"Найти тут всё..."
};

App.Frame.headerframe = {
	view:"toolbar", height:25,
	elements:[App.Frame.btnHome,
	          App.Frame.lblInTask,
	          App.Frame.searchMaster,
	          {},
	          App.Frame.btnChat,
	          App.Frame.btnEvents,
	          App.Frame.mnuSegments,
	          App.Frame.btnSettings
	         ]
};

App.Frame.sliceframe = {
  id:'sliceframe',
	width:250,
	header:'Срезы',
	height:600,
	body:{
		multi:true,
		view:'accordion',
		type:'space',
		rows:[{ body: 'Task pull' },
		      { header:'Группы', body: { id:'slicegroups' } },
		      { header:'Люди', body: { id:'sliceusers' } },
		      { header:'Проекты', body: { id:'sliceprojects' } },
		      { header:"Категории", body: { id:'slicecategory' } },
		      { header:"Тэги", body: { id:'slicetags' } }
		      ]
	}
};

App.Frame.optionsframe = {
  id:"optionsframe",
	width:250,
	header:"Опции",
	height:600,
	collapsed:true,
	body:{
		multi:true,
		view:"accordion",
		type:"space",
		rows:[{ body:"First options" }
		      ]
	}
};

users = {
		 "0" : "",
		 "1" : "Carl Lager",
		 "2" : "Ken Ford",
		 "3" : "Mindy Resin",
		 "4" : "Ben Sardonis",
		 "5" : "Barbara Liston"
	};
  	
App.Frame.workframe = {
	id:"workgrid",
	view:"treetable", 
	editable:true, 
	autoheight:true, 
	leftSplit:5,
	columns:[
		{id:"num", 		header:"", width:40, css:"shade"},
		{id:"blank",	header:"", width:40},
		{id:"attach",	header:"", width:40, css:"myicon", template:function(obj){
			if (!obj.attach) return "";
			return "<span class='webix_icon icon-attach'></span>";
		}},
		{id:"comments", header:"", width:40, css:"myicon", template:function(obj){
			if (!obj.comments) return "";
			return "<span class='webix_icon icon-docs'></span>";
		}},
		{id:"category", header:"Category", width:300, template:"{common.space()} {common.icon()} &nbsp;#value#", editor:"text", sort:"string"},
		{id:"status", 	header:"Status", width:60, template:function(obj)
			{
				if (!obj.status) return "";
					return "<img style='padding:2px 10px' src='imgs/status_"+obj.status+".png'>";
			}
		},
		{id:"owner", 	header:"Assigned To", editor:"select",	options:users },
		{id:"cert", 	header:"Certified", width:60, css:"mystar", template:function(obj){
			if (obj.cert == "yes") return "<span class='webix_icon icon-star'></span>";
			if (obj.cert == "no") return "<span class='webix_icon icon-star-empty'></span>";
			return "";
		}},
		{id:"certby", 	header:"Cert. By", editor:"select",	options:users },
		{id:"start", 	header:"Start date", map:"(date)#start#", editor:"date", sort:"int"},
		{id:"end",	 	header:"End date", map:"(date)#end#", editor:"date", sort:"int"}
		],
	//url:"js/data.json?v=4",
	url:"/datagrid",
	onClick:{
		"webix_icon" : function(ev, id, trg){
			if (id.column == "attach")
				webix.message("Attach call for row: "+this.getItem(id.row).num);
			if (id.column == "comments")
				webix.message("Comments call for row: "+this.getItem(id.row).num);
			if (id.column == "cert"){
				var item = this.getItem(id.row);
				if (item.cert){
					item.cert = item.cert == "yes" ? "no" : "yes";
					this.updateItem(id.row);
				}
			}
		}
	},
	on:{
		"onbeforeeditstart":function(cell){
			return !this.getItem(cell.row).notedit;
		}
	}
};

App.Frame.grouptoolframe = {
  view:'toolbar',
  id:'grouptoolframe',
  cols:[
    { view:'button', value:'Добавить', width:100, align:"left", 	      on:{
		      'onItemClick':function() {
		        $$("ingrid_groupframe").parse(datatab2);
		        //App.User.set('thisTry', true);
		      }
	      } },
    { view:'button', value:'Удалить', width:100, align:"left" },
    { }
  ]
};

datatab = [	{ "id":"1", "name":"Default", "numUsers":"1", data:[
					{ "id":"1.1", "name":"Defaultoid", "numUsers":"1" },
					{ "id":"1.2", "name":"Part 2", "numUsers":"2" }
				]}];
				
				datatab2 = [	{ "id":"2", "name":"Def2", "numUsers":"1", data:[
					{ "id":"2.1", "name":"Defa2", "numUsers":"1" },
					{ "id":"2.2", "name":"Part 2", "numUsers":"2" }
				]}];

webix.proxy.myData = {
  $proxy:true,
  init:function(){
    //webix.extend(this, webix.proxy.offline);
    console.log("here i am: init");
  },
  load: function(view, callback) {
    console.log("here i am");
    view.clearAll();
    view.parse(datatab);
    // var db = new PouchDB(this.source, config);
    // var doc = db.get(view.config.id, function(){
    //       view.parse(doc.data); //load data in component
    //});
  }
};

App.Frame.ingrid_groupframe = {
  id:'ingrid_groupframe',
	view:'treetable', 
	editable:true, 
	autoheight:true, 
	columns:[
		{ id:'id', 	header:'', width:40 },
		{ id:'name',	header:'Имя групы', width:250, template:'{common.treetable()} #name#' },
		{ id:'numUsers', header:'Польз.', width:50 }
		],
	data:	datatab
	//url: "myData->load"
};

App.Frame.groupframe = {
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
          App.Frame.grouptoolframe,
          { id:'grid_groupframe'}]
        }
    },
    {
     header:'Общественные группы',
     body:{
        id:'communitygroups_groupframe',
        rows:[
          App.Frame.grouptoolframe,
          {}]        
        }
    }
  ]
};

App.Frame.greetingframe = {
    id:'greetingframe',
    container:'centralframe',
    rows:[
    {
      view:"htmlform",
      template: "http->greeting.html"
    },
    { 
      cols:[{},
      {
     	  id:"btnTry",
	      view:"button", 
	      value:"Попробовать",
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
	      disabled:true,
	      value:"Зарегистрировать",
	      height: 45,
	      width: 130,
	      on:{
		      'onItemClick': function(){ webix.message("Заглушка"); }
	      }
      },
      {
     	  id:"btnLogin",
	      view:"button",
	      disabled:true,
	      value:"Войти",
	      height: 45,
	      width: 100,
	      on:{
		      'onItemClick': function(){ webix.message("Заглушка"); }
	      }
      },{}]
    }
  ]
};

App.Frame.centralframe = {
  id:'centralframe',
  container:"centralframe"
};

App.Frame.leftframe = {
  id:'leftframe',
  container:"leftframe"
};

App.Frame.rightframe = {
  id:'rightframe',
  container:"rightframe"
};

// App.WebixViews.MasterView = WebixView.extend({
// 	afterRender: function() {
// 	  if((App.User.get('id') === 0) && (!App.User.get('thisTry')))
// 	  {
//   	  $$("groupingframe").define("collapsed", true);
//   		$$("groupingframe").disable();
//   		$$("groupingframe").refresh();
  			  
//   		$$("optionsframe").define("collapsed", true);
//   		$$("optionsframe").disable();
//   		$$("optionsframe").refresh();
// 	  } else {
//   		$$("groupingframe").enable();
//   		$$("groupingframe").refresh();
  			  
//   		$$("optionsframe").enable();
//   		$$("optionsframe").refresh();
// 	  }
// 	}
// });