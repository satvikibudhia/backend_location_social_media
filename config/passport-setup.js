const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/Users");

// Add debug logging
const debug = (msg, obj = "") => {
  console.log(`[Passport Debug] ${msg}`, obj);
};

passport.serializeUser((user, done) => {
  debug("Serializing user:", user);

  if (!user) {
    debug("User object is undefined");
    return done(new Error("No user to serialize"), null);
  }

  try {
    // Handle both Mongoose documents and plain objects
    const userObject = user.toObject ? user.toObject() : user;
    const idToStore = userObject._id?.toString() || userObject.id?.toString();

    if (!idToStore) {
      debug("No valid ID found in user object");
      return done(new Error("No valid user ID found"), null);
    }

    debug("Serialized user ID:", idToStore);
    done(null, idToStore);
  } catch (err) {
    debug("Serialization error:", err);
    done(err, null);
  }
});

passport.deserializeUser(async (id, done) => {
  debug("Deserializing user ID:", id);

  try {
    const user = await User.findById(id);
    if (!user) {
      debug("No user found with ID:", id);
      return done(null, false);
    }
    debug("Deserialized user:", user);
    done(null, user);
  } catch (err) {
    debug("Deserialization error:", err);
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      debug("Google strategy callback. Profile ID:", profile.id);

      try {
        // Check for existing user
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          debug("Existing user found:", user._id);
          const userWithToken = {
            ...user.toObject(),
            accessToken,
          };
          return done(null, userWithToken);
        }

        debug("Creating new user for Google ID:", profile.id);

        // Admin emails list
        const adminEmails = [
          "satvikibudhia@gmail.com",
          "vyastanisha2004@gmail.com",
          "nandita.singh2004@gmail.com",
          "yash.parkhi.btech2022@sitpune.edu.in",
        ];

        // Create new user
        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: "google",
          googleId: profile.id,
          username: `${profile.displayName
            .replace(/\s+/g, "")
            .toLowerCase()}_${Date.now()}`,
          profilePic: profile.photos[0].value,
          type: adminEmails.includes(profile.emails[0].value)
            ? "admin"
            : "user",
        });

        await newUser.save();
        debug("New user saved:", newUser._id);

        const newUserWithToken = {
          ...newUser.toObject(),
          accessToken,
        };

        done(null, newUserWithToken);
      } catch (error) {
        debug("Google strategy error:", error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;
