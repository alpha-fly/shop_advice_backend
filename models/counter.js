const mongoose = require('mongoose');

const countersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
    },
});
module.exports = mongoose.model('Counters', countersSchema);