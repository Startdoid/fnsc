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
  },
  removeGroup: function(selectedId) {
    //var maplist = collection.map(function(object) { return object.attributes });
    //var list = _.groupBy(maplist, 'parent_id');
    var listGroup = [this.get(selectedId)];
    for (var i = 0; i < this.models.length; i++) {
      for (var c = 0; c < listGroup.length; c++){
        if (this.models[i].get('parent_id') === listGroup[c].id) {
          listGroup.push(this.models[i]);
        }
      }
    }
    
    for (var i = listGroup.length - 1; i >= 0; i--) {
      this.remove(listGroup[i]);
    }
  }
});