const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: String,
    nickname: String,
    password: String,
    salt: String, // 암호화를 위한 salt
    likes: [],
});

module.exports = mongoose.model('User', UserSchema);
