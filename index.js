const express = require('express');
const cors = require('cors'); // Import CORS
const mongoose = require('mongoose');
const server = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sml', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

server.use(cors());
server.use(express.json()); // Use express.json() instead of body-parser

// POST endpoint
server.post('/demo', (req, res) => {
    console.log(req.body);
    res.send(req.body);
});

// Define the User schema
const UserSchema = new mongoose.Schema({
    username: String,
    passwordHash: String,
    email: String,
    profilePicture: String,
    bio: String,
    joinedGroups: [String],
    createdAt: { type: Date, default: Date.now }, // Set default date
    googleAuthId: String
});

const UserModel = mongoose.model("User", UserSchema); // Use singular name for model

// GET endpoint for users
server.get('/demo', async (req, res) => {
    try {
        const users = await UserModel.find({});
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
server.listen(8080, (err) => {
    if (err) {
        console.error('Error starting server:', err);
        return;
    }
    console.log('Server started on port 8080');
});
