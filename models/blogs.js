var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
    posts: [{type: Schema.Types.ObjectId, ref: 'post'}],
    name: String,
    description: String
});

var blogModel = mongoose.model('blog', blogSchema);

module.exports = blogModel;