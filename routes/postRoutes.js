const express = require("express");
const Post = require("../models/Posts");
const Group = require("../models/Group");
const Users = require("../models/Users");
const router = express.Router();

router.post("/create-post", async(req, res) => {
    const { userId, groupId, img, imgdesc, latitude, longitude } = req.body;
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
        console.log(user);
        const distance = calculateDistance(
            latitude,
            longitude,
            group.coordinates.latitude,
            group.coordinates.longitude
        );

        const fromSameLocation = distance <= 1;
        console.log(latitude,
            longitude,
            group.coordinates.latitude,
            group.coordinates.longitude);
        const newPost = new Post({
            userId,
            groupId,
            img,
            imgdesc,
            likeCounter: 0,
            comments: [],
            fromSameLocation,
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

router.post("/getAllPost", async(req, res) => {
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

router.post("/getAllPostByGroupId", async(req, res) => {
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

router.post("/getAllPostByUserId", async(req, res) => {
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

router.post("/deletePost", async(req, res) => {
    const { postId } = req.body;
    try {
        const updatedPost = await Post.deleteOne({_id: postId});

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({
            message: "Post deleted successfully",
            data: updatedPost,
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
});

router.post("/likeOnPost", async(req, res) => {
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

router.post("/addComment", async(req, res) => {
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

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

router.post("/getAllPostByDistance", async(req, res) => {
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
        return res
            .status(400)
            .json({ message: "Latitude and longitude are required." });
    }

    try {
        // Fetch all posts and their associated group details
        const allPosts = await Post.find().populate("groupId");

        // Calculate the distance for each post's group location from user's location
        const postsWithDistance = allPosts
            .map((post) => {
                const groupLocation = post.groupId.coordinates;
                const distance = calculateDistance(
                    latitude,
                    longitude,
                    groupLocation.latitude,
                    groupLocation.longitude
                );
                return {...post.toObject(), distance };
            })
            .sort((a, b) => a.distance - b.distance); // Sort by closest distance

        res.status(200).json({
            message: "Posts fetched successfully by distance",
            data: postsWithDistance,
        });
    } catch (error) {
        console.error("Error fetching posts by distance:", error);
        res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;