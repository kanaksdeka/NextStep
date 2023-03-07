const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');


/*const Token = new mongoose.Schema({
  token: { type: String },
  date_created: { type: Date, default: Date.now },
});*/

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  userId: Number,
  record: {
    documents: Array,
    weblink: Object,
    chathistory: String,
    assignment: Array,
    mynotes:Array
  },
  grade:Array,
  gradingmarks:Array,
  notifications: Array,
  profile: {
    // firstName: String,
    //  lastName: String,
    fullname: String,
    birthDay:String,
    birthMonth:String,
    gurdianName:String,
    phoneNumber: String,
    class: Array,
    period: Array,
    rollNumber: String,
    profilephoto:String,
    address: {
      address: String,
      zipcode: String,
      state: String,
      apartmentNumber:String
    }
  },
  status: {
    profilestat: Boolean
  },
  category: {
    categoryType: String
  },
  token: {
    token: String,
    createdOn: Date
  }
}, { timestamps: true });


/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword_org = function comparePassword(candidatePassword, cb) {
  console.log('Current User Password-' + this.password);
  console.log('Login  User Password-' + candidatePassword);

  var testHash = this.generateHashedPassword(candidatePassword);
  console.log('Test password before comapring -' + testHash);

  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (candidatePassword === this.password)
    return true;
  else
    return false;
};

userSchema.methods.generateHashedPassword = function (unhashedPassword) {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return err; }
    bcrypt.hash(unhashedPassword, salt, null, (err, hash) => {
      if (err) { return err; }
      console.log('generateHashedPassword -' + hash);

      return hash;
    });
  });
}


//const TokenModel = mongoose.model('Token', Token);
const User = mongoose.model('User', userSchema);

module.exports = User;
