const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  className: String,
  subject: String,
  section: String,
  semester:String,
  period: String,
  user: String,
  day: String,
  timestamp: Date,
  isPresent: Boolean
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
