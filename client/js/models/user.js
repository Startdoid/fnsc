App.Models.User = Backbone.Model.extend({
  defaults: {
    id: 0,
    groupId: 0,
    username: 'try-user',
    password: '',
    thisTry: false,
    thisSegment: 'groups', //groups, tasks, templates, finances, process, files, notes
    //флаги состояния приложения this_view_action
    this_ingrid_groupframe_ItemSelected: 0, //выделенный элемент в области конструктора групп
  },
 
  urlRoot: '/user'
});