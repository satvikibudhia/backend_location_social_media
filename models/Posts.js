const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "groups",
  },
  img: {
    type: String,
    required: [true, "Image is required."],
  },
  imgdesc: {
    type: String,
    required: [true, "Image description is required."],
  },
  likeCounter: {
    type: Number,
    default: 0,
  },
  likedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required."],
      },
      comment: {
        type: String,
        required: [true, "Comment is required."],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  fromSameLocation: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.index({ groupId: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
