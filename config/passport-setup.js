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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        // Create new user with Google data
        const newUser = await new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.displayName, // Default username can be updated later
          googleId: profile.id,
          type: "user",
          provider: "google",
          profilePic: profile.photos[0].value,
          isProfileComplete: false, // New field to track signup completion
        }).save();

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
