define(['text!templates/app.html'], function(template) {
  console.log("call: views/app.js begin");
  var AppView = Backbone.View.extend({
    id: 'main',
    tagName: 'div',
    className: 'container-fluid',
    el: 'body',
    template: _.template(template),

    events: {
    },

    initialize: function() {
      console.log("call: views/app.js initialize");
    },

    render: function() {
      console.log("call: views/app.js render");
      this.$el.html(this.template());
      return this;
    }
  });

  console.log("call: views/app.js return");
  return AppView;
});