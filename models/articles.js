const mongoose = require("mongoose");

const articlesSchema = mongoose.Schema({
  articleId: {
    type: Number,    
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
    type: String,
    default: new Date(),
  },
  likes:{
    type: Number,
  }
});


module.exports = mongoose.model("Articles", articlesSchema);
