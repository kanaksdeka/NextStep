const mongoose = require('mongoose');

const refSchema = new mongoose.Schema({
    insert_ref: {type:String},
    key:{type:String},
},{ timestamps: true });

const InsertRef = mongoose.model('insertref', refSchema);

module.exports = InsertRef;

