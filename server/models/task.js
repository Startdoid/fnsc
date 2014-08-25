var mongoose = require('mongoose');

var taskSchema = mongoose.Schema({
  id: Number,
  text : String,
  done : Number
});

var taskModel = mongoose.model('task', taskSchema);

module.exports = taskModel;