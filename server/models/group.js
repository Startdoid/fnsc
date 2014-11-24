var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var groupSchema = mongoose.Schema({
  id: Number,
  parent_id: Number,
  name: String,
  picId: Number,
  numUsers: Number, 
  numTask: Number  
});

groupSchema.plugin(autoIncrement.plugin, { model: 'group', field: 'id' });
var groupModel = mongoose.model('group', groupSchema);

module.exports = groupModel;