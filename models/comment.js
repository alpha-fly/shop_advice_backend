const mongoose = require('mongoose');
const commentsSchema = mongoose.Schema({
    commentId: {
        type: String,
        required: true,
        unique: true,
        default: 0,
    },
    articleId: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
        unique: false,
    },
    nickname: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});
module.exports = mongoose.model('Comments', commentsSchema);
