// passport-setup.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/Users");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => done(err, null));
});
// Assuming you have a Google OAuth strategy set up
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
},

async (accessToken, refreshToken, profile, done) => {
  const existingUser = await User.findOne({ googleId: profile.id });
  if (existingUser) {
    return done(null, existingUser);
  }

  // If the user doesn't exist, create a new user
  const newUser = new User({
    name: profile.displayName,
    email: profile.emails[0].value,
    provider: 'google',
    googleId: profile.id,
    username: profile.displayName,
    profilePic: profile.photos[0].value,
    type: 'user', // Default to user unless specified otherwise
  });

  // If your admin's email is the one from the Google profile, set type to admin
  if (profile.emails[0].value === 'satvikibudhia@gmail.com') {
    newUser.type = 'admin'; // Set admin type for your specific user
  }

  await newUser.save();
  done(null, newUser);
}


));
