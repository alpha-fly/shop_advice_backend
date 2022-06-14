const mongoose = require("mongoose");

const articlesSchema = mongoose.Schema({
  articleId: {
    type: String,    
  },
  
  nickname:{
    type:String,
  },

  title: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  shopUrl: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category:{
    type: String
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  likes:{
    type: Number,
    default: 0,
  }
});


module.exports = mongoose.model("Articles", articlesSchema);
