define(function() {
  return Backbone.Router.extend({
    routes: {
      'lists/:id': 'openList'
    },

    initialize: function() {
    },

    openList: function(id) {
      if (timesline.collections.lists && timesline.collections.lists.length) {
        var list = timesline.collections.lists.get(id);
        if (list) {
          list.trigger('select');
        } else {
          console.error('List not found:', id);
        }
      }
    }
  });
});