require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const MongoStore = require("connect-mongo");
const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/groupRoutes");
userRoutes = require("./routes/userRoutes");
const locationRoutes = require("./routes/locationRoutes");
const postRoutes = require("./routes/postRoutes");
require("./config/passport-setup");
const bodyParser = require("body-parser");
const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(bodyParser.json({ limit: "5mb" })); // Limit for JSON
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

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
            secure: process.env.NODE_ENV === "production", // true for production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-site cookies in production
        },
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware
/*
app.use((req, res, next) => {
  console.log("Session:", req.session);
  console.log("User:", req.user);
  next();
});
*/

// Routes
app.use("/auth", authRoutes);
app.use("/location", groupRoutes);
app.use("/user", userRoutes);
app.use("/nearby", locationRoutes);
app.use("/post", postRoutes);

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