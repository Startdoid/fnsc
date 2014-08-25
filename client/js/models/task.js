App.Models.Task = Backbone.Model.extend({
  defaults: {
    id: 0,
    groupId: 0,
    text: 'Empty task',
    done: false
  },
 
  urlRoot: '/tasks'
});