// Users.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  provider: {
    type: String,
    required: true,
    enum: ["google", "local"],
  },
  type: {
    type: String,
    required: true,
    enum: ["user", "local"],
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    minLength: 3,
  },
  bio: String,
  phone: {
    type: String,
    match: /^(\+\d{1,3}[- ]?)?\d{10}$/,
  },
  dob: Date,
  profilePic: String,
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  groupsJoined: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
