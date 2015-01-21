App.Models.Task = Backbone.Model.extend({
  defaults: {
    id: 0,
    parent_id: 0,
    description: 'Empty task',
    done: false
  },
 
  urlRoot: '/api/v1/tasks'
});