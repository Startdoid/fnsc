App.Models.Group = Backbone.Model.extend({
  defaults: {
    id: 0,
    parent_id: 0,
    owner_id: 0,
    name: 'Default try',
    picId: 0,
    numUsers: 1,
    numTask: 0
  },
  urlRoot: '/api/groups'
  // initialize: function(data) {
  //   this.data = new collectionGroups();
  //   this.parse(data);
  // },
  // parse: function(data) {
  //   if(data.data) {
  //     this.data.reset(data.data);
  //   }
  //   return _.omit(data, 'data');
  // }
});