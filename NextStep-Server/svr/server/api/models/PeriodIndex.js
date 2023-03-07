const mongoose = require('mongoose');

const indexperiodSchema = new mongoose.Schema({
  class: String,
  class_name: String,
  subject: String,
  subject_name: String,
  section: String,
  section_name: String,
  semester:String,
  semester_name: String,
  days: Array,
  starttime:String,
  endtime:String,
  startdate:Date,
  enddate:Date,
  mainteacher:String,
  substituteteacher:String,
  record:{
      documents:Array,
      chathistory:String,
      weblink:Object,
      assignment:Array
  },
  perioduniqueindex:String,
  mainteacherindex:String,
  substituteteacherindex:String,
  active:Boolean,
  clouddrive:String
}, { timestamps: true });

const PeriodIndex = mongoose.model('PeriodIndex', indexperiodSchema);

module.exports = PeriodIndex;
