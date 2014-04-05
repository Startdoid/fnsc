var mongoose = require('mongoose');

module.exports = mongoose.model('Task', {
	text : String,
	done : Boolean
});
