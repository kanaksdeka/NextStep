const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    section: {type:String},
},{ timestamps: true });

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;