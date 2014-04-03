define(['views/lists/menuitem'], function(ListMenuItemView) {
  var ListMenuView = Backbone.View.extend({
    el: '.left-nav',
    tagName: 'ul',
    className: 'nav nav-list lists-nav',

    events: {
    },

    initialize: function() {
      this.collection.on('add', this.renderMenuItem, this);
    },

    renderMenuItem: function(model) {
      var item = new ListMenuItemView({ model: model });
      this.$el.append(item.render().el);

      if (!timesline.views.activeListMenuItem) {
        timesline.views.activeListMenuItem = item;
      }

      if (model.get('id') === timesline.views.activeListMenuItem.model.get('id')) {
        item.open();
      }
    },

    render: function() {
      var $el = $(this.el)
        , self = this;

      return this;
    }
  });

  return ListMenuView;
});