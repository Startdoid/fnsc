var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
  id : String,
  name : String,
  login : String,
  password : String
});