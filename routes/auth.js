// auth.js
const express = require("express");
const passport = require("passport");
const User = require("../models/Users");
const router = express.Router();

// Google OAuth route
router.get(
  "/google",
  (req, res, next) => {
    const authFlow = req.query.flow || "login";
    req.session.authFlow = authFlow;
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get("/current_user", (req, res) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      provider: req.user.provider,
      type: req.user.type,
      username: req.user.username,
      bio: req.user.bio,
      phone: req.user.phone,
      dob: req.user.dob,
      profilePic: req.user.profilePic,
      isProfileComplete: req.user.isProfileComplete,
      groupsJoined: req.user.groupsJoined,
    });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      if (req.session.authFlow === "signup") {
        req.session.authFlow = null;
        const user = await User.findById(req.user._id);
        if (user) {
          if (user.type === "admin") {
            return res.redirect("http://localhost:3000/admin");
          } else {
            return res.redirect("http://localhost:3000/dashboard");
          }
        }
      }
      const user = await User.findById(req.user._id);
      if (user) {
        if (user.type === "admin") {
          return res.redirect("http://localhost:3000/admin");
        } else {
          return res.redirect("http://localhost:3000/dashboard");
        }
      }
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
// Fetch user data after successful Google auth
router.get("/signup/user-data", async (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user; // Assuming user is attached to req by passport
    return res.json({
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      type: user.type, // Include user type
    });
  }
  return res.status(401).json({ error: "Not authenticated" });
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
