var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reviewSchema = new Schema({
    views: [{type: Schema.Types.ObjectId, ref: 'user'}],
    comments: [
        {
            userDetails: {type: Schema.Types.ObjectId, ref: 'user'},
            comment: String
        }
    ],
    votes: [
        {
            userDetails: {type: Schema.Types.ObjectId, ref: 'user'},
            vote: { type: String, enum: [ 'upvote', 'downvote' ] }
        }   
    ]
});

var reviewModel = mongoose.model('review', reviewSchema);

module.exports = reviewModel;