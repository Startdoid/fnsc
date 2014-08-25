collectionGroups = Backbone.Collection.extend({
  model: App.Models.Group,
  url:"/groups"
});