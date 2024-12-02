const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: [true, 'Username is required!'],
        unique: true,
        minlength: 3, 
        maxlength: 30,
    },
    password_hash: {
        type: String, 
        required: [true, 'Password is required!'],
    }
});


module.exports = mongoose.model('User', UserSchema);