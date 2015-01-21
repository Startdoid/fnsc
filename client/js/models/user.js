App.Models.User = Backbone.Model.extend({
  defaults: {
    id: 0,
    groupId: 0,
    username: 'try-user',
    password: '',
    country: 'Выбор страны',
    city: 'Выбор города',
    dateofbirth: new Date(),
    gender: 0,
    familystatus: 'Выбор статуса',    
    thisTry: false,
    usrLogged: false,
  },
 
  urlRoot: '/api/v1/users'
});