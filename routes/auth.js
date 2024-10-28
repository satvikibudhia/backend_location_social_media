// auth.js
const express = require("express");
const passport = require("passport");
const User = require("../models/Users");
const router = express.Router();

// Google OAuth route
router.get(
  "/google",
  (req, res, next) => {
    // Store the authentication flow (signup or login)
    const authFlow = req.query.flow || "login";
    req.session.authFlow = authFlow;
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      // New user or login flow
      if (req.session.authFlow === "signup") {
        req.session.authFlow = null; // Clear authFlow after use
        return res.redirect("/signup/complete");
      }

      // Otherwise, proceed to profile (login flow)
      res.redirect("http://localhost:3000/dashboard");
    } catch (error) {
      console.error("Error during Google callback:", error);
      res.redirect("/login?error=Something went wrong, please try again");
    }
  }
);

// Complete signup route
router.post("/complete-signup", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { username, bio, phone, dob, groupsJoined } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        username,
        bio,
        phone,
        dob,
        groupsJoined: groupsJoined || [],
        isProfileComplete: true,
        profilePic: req.user.profilePic, // Save the profile picture from Google
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.error("Complete signup error:", error);
    res.status(500).json({ error: "Failed to complete signup" });
  }
});

// Get user data for completing signup
router.get("/signup/user-data", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({
    name: req.user.name,
    email: req.user.email,
    profilePic: req.user.profilePic,
  });
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }

    // Destroy session after logout
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return res.status(500).json({ error: "Failed to destroy session" });
      }
      res.clearCookie("connect.sid"); // Clear session cookie
      res.redirect("http://localhost:3000"); // Redirect to homepage or login page
    });
  });
});



module.exports = router;
