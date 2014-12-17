App.Models.User = Backbone.Model.extend({
  defaults: {
    id: 0,
    groupId: 0,
    username: 'try-user',
    password: '',
    country: 'Выбор страны',
    city: 'Выбор города',
    dateofbirth: new Date(),
    gender: 0,
    familystatus: 'Выбор статуса',    
    thisTry: false,
    thisSegment: 'users', //groups, tasks, templates, finances, process, files, notes
    thisGroup: 0, //Выбранная группа, по которой фильтруются задачи
    usrLogged: false,
    //флаги состояния приложения this_view_action
    this_ingrid_groupframe_ItemSelected: 0, //выделенный элемент в области конструктора групп
    this_ingrid_groupframe_ItemEdited: null, //редактируемый элемент в области конструктора групп
    this_ingrid_taskframe_ItemSelected: 0, //выделенный элемент в области конструктора задач
    this_ingrid_taskframe_ItemEdited: null //редактируемый элемент в области конструктора задач
  },
 
  urlRoot: '/api/users'
});