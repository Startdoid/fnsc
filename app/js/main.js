requirejs.config({
  baseUrl: 'js',
  waitSeconds: 45,
  paths: {
    text: 'lib/text'
  },

  shim: {
    'lib/underscore-min': {
      exports: '_'
    },
    'lib/backbone-min': {
      deps: ['lib/underscore-min']
    , exports: 'Backbone'
    },
    'app': {
      deps: ['lib/underscore-min', 'lib/backbone-min']
    }
  }
});

require(['app'], function(App) {
  console.log("call: app/main.js");
  window.timesline = new App();
});