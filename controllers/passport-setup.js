const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User');

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
        return done(null, existingUser);
    }

    // Create a new user if it doesn't exist
    const user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        provider: 'google',
        googleId: profile.id,
        username: profile.displayName.toLowerCase().replace(/ /g, '_'),
        profilePic: profile.photos[0].value,
    });
    await user.save();
    done(null, user);
}));

// Local Strategy for Email/Password Signup/Login
passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
}, async (req, email, password, done) => {
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return done(null, false, { message: 'Email is already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: req.body.name,
            email,
            password: hashedPassword,
            provider: 'local',
            username: req.body.username,
        });
        await newUser.save();
        done(null, newUser);
    } catch (error) {
        done(error);
    }
}));

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        done(null, user);
    } catch (error) {
        done(error);
    }
}));
