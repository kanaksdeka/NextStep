const mongoose = require('mongoose');

const elasticSchema = new mongoose.Schema({
  filename: String,
  ec2path: String,
  awsurl: String,
  filetype:String,
  isindexed: Boolean,
  indexPeriod:String,
  period:String,
  grade:String

}, { timestamps: true });

const Elastic = mongoose.model('Elastic', elasticSchema);

module.exports = Elastic;
