const mongoose = require('mongoose');

const sequence = new mongoose.Schema({
    _id: {type: String},
    sequence_value: {type: Number, default: 1}
});

const Sequence = mongoose.model('sequence', sequence);

module.exports = Sequence;