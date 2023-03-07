import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const USER_TYPES = {
  STUDENT: "student",
  TEACHER: "teacher",
};

/*const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    firstName: String,
    lastName: String,
    type: String,
  },
  {
    timestamps: true,
    collection: "users",
  }
);*/
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
    assignment: Array
  },
  notifications: Array,
  profile: {
    // firstName: String,
    //  lastName: String,
    fullName: String,
    phoneNumber: Number,
    class: Array,
    period: Array,
    rollNumber: { type: Number, default: 0 },
    address: {
      address: String,
      zipcode: String,
      state: String
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
}, { 

    timestamps: true,
    collection: "users",
});

/**
 * @param {String} firstName
 * @param {String} lastName
 * @returns {Object} new user object created
 */
/*userSchema.statics.createUser = async function (firstName, lastName, type) {
  try {
    const user = await this.create({ firstName, lastName, type });
    return user;
  } catch (error) {
    throw error;
  }
}*/

/**
 * @param {String} id, user id
 * @return {Object} User profile object
 */
userSchema.statics.getUserById = async function (id) {
  try {
    const user = await this.findOne({ _id: id },{_id:1,'profile.fullName':1});
    if (!user) throw ({ error: 'No user with this id found' });
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * @return {Array} List of all users
 */
userSchema.statics.getUsers = async function () {
  try {
    const users = await this.find({},{_id:1,'profile.fullName':1});
    return users;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Array} ids, string of user ids
 * @return {Array of Objects} users list
 */
userSchema.statics.getUserByIds = async function (ids) {
  try {
    const users = await this.find({ _id: { $in: ids } },{_id:1,'profile.fullName':1});
    return users;
  } catch (error) {
    throw error;
  }
}

userSchema.statics.getUserByToken = async function (token) {
  try {
    const users = await this.find({ "token.token": token});
    //console.log("Users-"+JSON.stringify(users))
    return users[0];
  } catch (error) {
    throw error;
  }
}



/**
 * @param {String} id - id of user
 * @return {Object} - details of action performed
 */
/*userSchema.statics.deleteByUserById = async function (id) {
  try {
    const result = await this.remove({ _id: id });
    return result;
  } catch (error) {
    throw error;
  }
}*/

export default mongoose.model("User", userSchema);
