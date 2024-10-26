const express = require('express');
const cors = require('cors'); // Import CORS
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // Correct import
const server = express();

server.use(cors());
server.use(bodyParser.json()); // Correct initialization

server.post('/demo', (req, res) => {
    console.log(req.body);
    res.send(req.body);

});

// Optionally, you can add a GET endpoint for testing
server.get('/demo', (req, res) => {
    res.send('GET request received');
});

server.listen(8080, (err) => {
    if (err) {
        console.error('Error starting server:', err);
        return;
    }
    console.log('Server started on port 8080');
});
