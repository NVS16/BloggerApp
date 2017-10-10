var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    blogs: [{type: Schema.Types.ObjectId, ref: 'blog'}],
    name: String,
    dob: String,
    email: String,
    contact: Number,
    password: String
});

var userModel = mongoose.model('user', userSchema);

module.exports = userModel;

module.exports.createUser = function(newUser, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            // Store hash in your password DB.
            newUser.password = hash;
            newUser.save(callback);  
        });
    });
};
