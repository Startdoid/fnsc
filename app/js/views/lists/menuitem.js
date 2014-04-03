define(['text!templates/lists/menuitem.html', 'views/tasks/index', 'collections/tasks'], function(template, TasksIndexView, Tasks) {
  var ListMenuItemView = Backbone.View.extend({
    tagName: 'li',
    className: 'list-menu-item',

    template: _.template(template),

    events: {
      'click': 'open'
    },

    initialize: function() {
      this.model.on('change', this.render, this);
      this.model.on('destroy', this.remove, this);
      this.model.on('select', this.open, this);
    },

    render: function() {
      var $el = $(this.el);
      $el.html(this.template(this.model.toJSON()));
      return this;
    },

    open: function() {
      if (timesline.views.activeListMenuItem) {
        timesline.views.activeListMenuItem.$el.removeClass('active');
      }

      timesline.views.activeListMenuItem = this;
      this.$el.addClass('active');

      // Render the tasks
      if (timesline.views.tasksIndexView) {
        timesline.views.tasksIndexView.remove();
      }

      var tasks = new Tasks({ tasklist: this.model.get('id') });
      timesline.collections.tasks = tasks;
      timesline.views.tasksIndexView = new TasksIndexView({ collection: tasks, model: this.model });
      timesline.views.app.$el.find('#tasks-container').html(timesline.views.tasksIndexView.render().el);
      timesline.routes.navigate('lists/' + this.model.get('id'));

      return false;
    }
  });

  return ListMenuItemView;
});