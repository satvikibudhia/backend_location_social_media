const express = require("express");
const passport = require("passport");
const User = require("../models/Users");
const Post = require("../models/Posts");
const Group = require("../models/Group");
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const auth = (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization");
    console.log("Received token:", token); // Debug log for token

    if (!token) {
        console.log("No token provided."); // Debug log
        return res.status(401).json({ error: "Not authenticated" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token verified, user:", verified); // Debug log for verified payload
        req.user = verified;
        next();
    } catch (error) {
        console.error("Token verification failed:", error); // Debug log for errors
        res.status(400).json({ error: "Invalid token" });
    }
};


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

outer.get("/current_user", auth, (req, res) => {
    console.log("Accessing current_user with user:", req.user); // Debug log for req.user

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
        console.log("User not authenticated"); // Debug log if req.user is not set
        res.status(401).json({ error: "Not authenticated" });
    }
});

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    async(req, res) => {
        try {
            const token = jwt.sign({ id: req.user._id }, // Make sure `req.user._id` is used, not accessToken
                process.env.JWT_SECRET, { expiresIn: "1h" }
            );
            console.log("Generated JWT token:", token); // Debug log for JWT token

            const user = await User.findById(req.user._id);
            console.log("User found in database:", user); // Debug log for user

            const redirectUrl = `http://localhost:3000/tokenhandlerUser?token=${token}`;
            console.log("Redirecting to:", redirectUrl); // Debug log for redirect URL

            res.redirect(redirectUrl);
        } catch (error) {
            console.error("Error during Google callback:", error); // Debug log for callback error
            res.redirect("/login?error=Something went wrong, please try again");
        }
    }
);

router.post("/update-profile", async(req, res) => {
    console.log("broom");
    const { email, username, bio, profilePic, phone, dob } = req.body;

    try {
        const updatedUser = await User.findOneAndUpdate({ email: email }, {
            username: username,
            bio: bio,
            profilePic: profilePic,
            phone: phone,
            dob: dob,
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

router.post("/complete-signup", async(req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const { username, bio, phone, dob, groupsJoined } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, {
                username,
                bio,
                phone,
                dob,
                groupsJoined: groupsJoined || [],
                isProfileComplete: true,
                profilePic: req.user.profilePic,
            }, { new: true }
        );

        res.json(updatedUser);
    } catch (error) {
        console.error("Complete signup error:", error);
        res.status(500).json({ error: "Failed to complete signup" });
    }
});

router.get("/signup/user-data", async(req, res) => {
    if (req.isAuthenticated()) {
        const user = req.user;
        return res.json({
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            type: user.type,
        });
    }
    return res.status(401).json({ error: "Not authenticated" });
});

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to log out" });
        }

        req.session.destroy((destroyErr) => {
            if (destroyErr) {
                return res.status(500).json({ error: "Failed to destroy session" });
            }
            res.clearCookie("connect.sid");
            res.redirect("http://localhost:3000");
        });
    });
});

module.exports = router;