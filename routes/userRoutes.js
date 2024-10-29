// routes/userRoutes.js
const express = require("express");
const User = require("../models/Users"); // Import the User model

const router = express.Router();

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

module.exports = router;
