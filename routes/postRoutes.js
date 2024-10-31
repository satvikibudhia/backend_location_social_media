const express = require("express");
const Post = require("../models/Posts");
const Group = require("../models/Group");
const Users = require("../models/Users");
const router = express.Router();

router.post("/create-post", async (req, res) => {
  const { userId, groupId, img, imgdesc } = req.body;
  console.log("Received request body:", req.body);
  if (!userId || !groupId || !img || !imgdesc) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    console.log("reached:");
    const newPost = new Post({
      userId,
      groupId,
      img,
      imgdesc,
      likeCounter: 0,
      comments: [],
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error saving post:", error);
    res
      .status(500)
      .json({ message: "An error occurred while saving the post." });
  }
});

router.post("/getAllPost", async (req, res) => {
  const allPosts = await Post.find();
  console.log("posts", allPosts);
  try {
    res.status(200).json({
      message: "Posts fetched successfully",
      data: allPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
