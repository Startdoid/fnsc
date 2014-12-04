var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var taskSchema = mongoose.Schema({
  id: Number,
  parent_id: Number,
  description : String,
  done : Number
});

taskSchema.plugin(autoIncrement.plugin, { model: 'task', field: 'id' });
var taskModel = mongoose.model('task', taskSchema);

module.exports = {
  model:taskModel
};