App.Models.User = Backbone.Model.extend({
  defaults: {
    id: 0,
    groupId: 0,
    username: 'try-user',
    password: '',
    thisTry: false,
    thisSegment: 'groups' //groups, tasks, templates, finances, process, files, notes
  },
 
  urlRoot: '/user'
});