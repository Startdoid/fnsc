App.Models.Group = Backbone.Model.extend({
  defaults: {
    id: 0,
    parentId: 0,
    name: 'Default try',
    picId: 0,
    numUsers: 1,
    numTask: 0
  },
  
  urlRoot: '/groups'
});