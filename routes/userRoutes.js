const express = require("express");
const User = require("../models/Users");
const Group = require("../models/Group");

const router = express.Router();

router.post("/join-group", async(req, res) => {
    const { userId, groupId } = req.body;

    if (!userId || !groupId) {
        return res
            .status(400)
            .json({ message: "User ID and Group ID are required." });
    }

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found." });
        }
        await User.findByIdAndUpdate(
            userId, { $addToSet: { groupsJoined: groupId } }, { new: true }
        );

        res.status(200).json({ message: "Group joined successfully", groupId });
    } catch (error) {
        console.error("Error joining group:", error);
        res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
});

router.post("/UserbyId", async(req, res) => {
    const { userID } = req.body;
    try {
        const user = await User.findById(userID);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                provider: user.provider,
                type: user.type,
                username: user.username,
                bio: user.bio,
                phone: user.phone,
                dob: user.dob,
                profilePic: user.profilePic,
                isProfileComplete: user.isProfileComplete,
                groupsJoined: user.groupsJoined,
            });
        } else {
            res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/update-location", async(req, res) => {
    const { email, latitude, longitude } = req.body;

    if (!email || latitude == null || longitude == null) {
        return res
            .status(400)
            .json({ message: "Email, latitude, and longitude are required." });
    }

    try {
        const user = await User.findOneAndUpdate({ email }, { latitude, longitude }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Location updated successfully", user });
    } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/groups/:id", async(req, res) => {
    try {
        const groupId = req.params.id;
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.status(200).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;