const mongoose = require('mongoose');
const articlesSchema =  mongoose.Schema({
    articleId:{
        type: Number,
        trim: true,
        required: true,
        default:0,
    },
    title:{
        type: String,
        required: true,
        trim:true,
        
    },
    imageUrl:{
        type: String,
        required: true,

    },
    shopUrl:{
        type: String,
        required: true,

    },
    content:{
        type: String,
        required: true,
    },
    price:{
        type: Number,
        required: true,
    },
    date:{
        type: Date,
        default: new Date(),
    }
      
});

module.exports = mongoose.model('Articles',articlesSchema)