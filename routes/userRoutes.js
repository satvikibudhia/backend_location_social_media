// routes/userRoutes.js
const express = require("express");
const { getAllUsers, createUser } = require("../controllers/userController");

const router = express.Router();

// Define route for getting all users
router.get("/", getAllUsers);

// Define route for creating a user
router.post("/", createUser);

module.exports = router;
