const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    semester: {type:String},
    startdate:Date,
    enddate:Date,
    isactive:Boolean
},{ timestamps: true });

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;