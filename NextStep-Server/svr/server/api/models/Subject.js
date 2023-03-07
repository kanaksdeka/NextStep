const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    subject: {type:String},
},{ timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;

