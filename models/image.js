const mongoose = require('mongoose');

const imagesSchema = mongoose.Schema({
    image:{
        data:Buffer,
        contentType:String
    }
})

module.exports = mongoose.model('Images',imagesSchema)