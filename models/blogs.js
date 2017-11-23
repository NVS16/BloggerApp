var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user' },
    posts: [{type: Schema.Types.ObjectId, ref: 'post'}],
    name: String,
    description: String,
    category: { type: String, enum: [ "Science and Technology", "Education", "Sports", "Miscellaneous",
       "Food and Travel", "Art and Architecture", "Creative", "Health and Fitness", "Spiritual"  ] }
});

var blogModel = mongoose.model('blog', blogSchema);

module.exports = blogModel;