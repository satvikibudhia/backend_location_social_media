// routes/userRoutes.js
const express = require("express");
const User = require("../models/Users"); // Import the User model
const Group=require("../models/Group"); 


const router = express.Router();

router.post("/join-group", async (req, res) => {
  const { userId, groupId } = req.body;

  if (!userId || !groupId) {
    return res.status(400).json({ message: "User ID and Group ID are required." });
  }

  try {
    // Check if the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Update user's groupsJoined array if the group is not already joined
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { groupsJoined: groupId } }, // Prevent duplicates
      { new: true }
    );

    res.status(200).json({ message: "Group joined successfully", groupId });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Define route for updating user location
router.post("/update-location", async (req, res) => {
  const { email, latitude, longitude } = req.body;

  if (!email || latitude == null || longitude == null) {
    return res
      .status(400)
      .json({ message: "Email, latitude, and longitude are required." });
  }

  try {
    // Find the user by email and update their location
    const user = await User.findOneAndUpdate(
      { email }, // Search by email
      { latitude, longitude },
      { new: true } // Returns the updated user document
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Location updated successfully", user });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/groups/:id", async (req, res) => {
  try {
    const groupId = req.params.id;

    // Find the group by ID
    const group = await Group.findById(groupId);

    // Check if the group was found
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Return the group details
    res.status(200).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
