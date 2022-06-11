const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: String,
    nickname: String,
    password: String,
    salt: String, 
    likes: [],
});

module.exports = mongoose.model('User', UserSchema);
