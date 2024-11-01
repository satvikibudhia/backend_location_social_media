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

router.post("/getAllPostByGroupId", async (req, res) => {
  const { groupId } = req.body;
  const allPosts = await Post.find({ groupId });
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

router.post("/getAllPostByUserId", async (req, res) => {
  const { userId } = req.body;
  const allPosts = await Post.find({ userId });
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

router.post("/likeOnPost", async (req, res) => {
  const { postId, userId } = req.body;

  try {
    // Find the post by postId
    const post = await Post.findById(postId);

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already liked the post
    if (post.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User has already liked this post" });
    }

    // Increment the 'likeCounter' and add userId to 'likedBy'
    post.likeCounter += 1;
    post.likedBy.push(userId);

    // Save the updated post
    const updatedPost = await post.save();

    res.status(200).json({
      message: "Like added successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Error adding like:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.post("/addComment", async (req, res) => {
  const { postId, userId, comment } = req.body;

  try {
    // Find the post and add the comment to the 'comments' array
    const updatedPost = await Post.findByIdAndUpdate(postId, {
      $push: {
        comments: {
          userId,
          comment,
          createdAt: new Date(),
        },
      },
    }).populate("comments.userId", "username");

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Comment added successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
