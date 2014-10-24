var mongoose = require('mongoose');

var groupSchema = mongoose.Schema({
  id: Number,
  parent_id: Number,
  name: String,
  picId: Number,
  numUsers: Number,
  numTask: Number  
});

var groupModel = mongoose.model('group', groupSchema);

module.exports = groupModel;