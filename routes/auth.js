// auth.js
const express = require('express');
const passport = require('passport');
const User = require('../models/Users');
const router = express.Router();

// Google OAuth route
router.get('/google',
    (req, res, next) => {
        // Store the authentication flow (signup or login)
        const authFlow = req.query.flow || 'login';
        req.session.authFlow = authFlow;
        next();
    },
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

// Google callback route
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        // Check if this was a signup flow
        if (req.session.authFlow === 'signup') {
            // If user already exists, redirect to login
            const existingUser = await User.findOne({ googleId: req.user.googleId });
            if (existingUser) {
                return res.redirect('/login?error=User already exists, please login');
            }
            // New user, redirect to complete signup
            res.redirect('/signup/complete');
        } else {
            // Login flow
            res.redirect('/profile');
        }
    }
);

// Complete signup route
router.post('/complete-signup', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
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
                profilePic: req.user.profilePic // Save the profile picture from Google
            },
            { new: true }
        );

        res.json(updatedUser);
    } catch (error) {
        console.error('Complete signup error:', error);
        res.status(500).json({ error: 'Failed to complete signup' });
    }
});

// Get user data for completing signup
router.get('/signup/user-data', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({
        name: req.user.name,
        email: req.user.email,
        profilePic: req.user.profilePic
    });
});


module.exports = router;
