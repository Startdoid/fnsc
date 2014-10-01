collectionGroups = Backbone.Collection.extend({
  model: App.Models.Group,
  url:"/groups",
  newGroup: function(selectedId) {
    var newId = 0;
    for (var i = this.models.length - 1; i >= 0; i--) {
      if(this.models[i].id >= newId) {
        newId = this.models[i].id + 1;
      }
    }

    this.add({ 
      id:newId, 
      parent_id:selectedId,
      name:'New group'} );
  }
});