// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  passwordHash: String,
  email: String,
  profilePicture: String,
  bio: String,
  joinedGroups: [String],
  createdAt: { type: Date, default: Date.now },
  googleAuthId: String,
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
