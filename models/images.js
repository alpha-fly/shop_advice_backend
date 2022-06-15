const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({    
    imageUrl: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});
module.exports = mongoose.model('Images', imageSchema);