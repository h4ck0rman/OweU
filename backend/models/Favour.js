const mongoose = require('mongoose');

const FavourSchema = new mongoose.Schema({
    user: {
        type: UserSchema,
        required: true,
    },
    startTime: {
        type: Date, 
        required: false,
        default: Date.now,
    }, 
    endTime: {
        type: Date, 
        required: false,
    }, 
    partner: {
        type: UserSchema,
        required: false,
    }
});

module.exports = mongoose.model('Favour', FavourSchema);