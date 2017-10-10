var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
    reviews: {type: Schema.Types.ObjectId, ref: 'review'},
    title: String,
    body: String
});

var postModel = mongoose.model('post', postSchema);

module.exports = postModel;