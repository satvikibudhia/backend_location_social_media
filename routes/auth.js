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

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Bearer

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token is not valid" });
        }
        req.user = decoded; // Store decoded user data into req.user
        next();
    });
};

// Apply the middleware to your protected routes
router.get("/current_user", verifyToken, (req, res) => {
    console.log("Authorization header:", req.headers["authorization"],req.user.accessToken);
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
    passport.authenticate("google", { failureRedirect: "/" }),
    async(req, res) => {
        try {
            const token = jwt.sign({ id: req.user.accessToken }, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });
            console.log("Token generated:", token);
            const user = await User.findById(req.user._id);
            console.log("user:", user);
            const redirectUrl = `http://localhost:3000/tokenhandlerUser?token=${token}`;
            console.log("redirecting to login", redirectUrl);
            res.redirect(redirectUrl);
        } catch (error) {
            console.error("Error during Google callback:", error);
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