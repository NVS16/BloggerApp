var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    dob: String,
    email: String,
    contact: Number,
    password: String
});


userSchema.index({name: 'text'});

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
