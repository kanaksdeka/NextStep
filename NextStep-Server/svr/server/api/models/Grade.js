const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    grade: {type:String},
},{ timestamps: true });

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;