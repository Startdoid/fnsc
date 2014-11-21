App.Models.User = Backbone.Model.extend({
  defaults: {
    id: 0,
    groupId: 0,
    username: 'try-user',
    password: '',
    thisTry: false,
    thisSegment: 'users', //groups, tasks, templates, finances, process, files, notes
    usrLogged: false,
    //флаги состояния приложения this_view_action
    this_ingrid_groupframe_ItemSelected: 0, //выделенный элемент в области конструктора групп
    this_ingrid_groupframe_ItemEdited: null //редактируемый элемент в области конструктора групп
  },
 
  urlRoot: '/api/users'
});