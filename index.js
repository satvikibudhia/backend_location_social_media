require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const MongoStore = require("connect-mongo");
const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groupRoutes");
userRoutes = require("./routes/userRoutes"); // Import user routes
require("./routes/groupRoutes");
require("./config/passport-setup");

const app = express();

// CORS configuration - MUST COME BEFORE OTHER MIDDLEWARE
app.use(
  cors({
    origin: "http://localhost:3000", // Your React app URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware
app.use((req, res, next) => {
  console.log("Session:", req.session);
  console.log("User:", req.user);
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/location", groupRoutes);
app.use("/user", userRoutes); // Add user routes

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Server is working" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
