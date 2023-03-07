const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  class: String,
  subject: String,
  section: String,
  semester:String,
  days: Array,
  starttime:String,
  endtime:String,
  startdate:Date,
  enddate:Date,
  mainteacher:String,
  substituteteacher:String,
  periodindex:String,
  record:{
      documents:Array,
      weblink:Object,
      chathistory:String,
      assignment:Array
  }

}, { timestamps: true });

const Period = mongoose.model('Period', periodSchema);


module.exports = Period;
