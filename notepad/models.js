var mongoose = require('mongoose');

var documentSchema = mongoose.Schema({
    properties: ['title', 'data', 'tags'],
    indexes: ['title']
});

mongoose.model('Document', documentSchema);

exports.Document = function(db) {
  return db.model('Document');
};