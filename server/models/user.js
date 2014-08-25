var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  id: Number,
  groupId: Number,
  username : String,
  password : String
});

var userModel = mongoose.model('user', userSchema);

module.exports = userModel;