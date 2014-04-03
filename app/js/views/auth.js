define(['text!templates/auth.html'], function(template) {
  console.log("call: views/auth.js begin");
  var AuthView = Backbone.View.extend({
    el: '#sign-in-container',
    template: _.template(template),

    events: {
      'click #authorize-button': 'auth'
    },

    initialize: function(app) {
      console.log("call: views/auth.js initialize");
      this.app = app;
    },

    render: function() {
      console.log("call: views/auth.js render");
      this.$el.html(this.template());
      return this;
    },

    auth: function() {
      console.log("call: views/auth.js auth");
      this.app.apiManager.checkAuth();
      return false;
    }
  });

  console.log("call: views/auth.js return");
  return AuthView;
});