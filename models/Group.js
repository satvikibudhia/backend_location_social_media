// models/Location.js
const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  city: { type: String, required: true }, // City where the group is located
  category: { type: String, required: true }, // Type of group (e.g., hospital, university, corporate)
  name: { type: String, required: true }, // Name of the group
  description: { type: String }, // Optional description of the group
  coordinates: {
    longitude: { type: Number, required: true }, // Longitude of the group's location
    latitude: { type: Number, required: true }, // Latitude of the group's location
  },
  createdAt: { type: Date, default: Date.now }, // Automatically track when the group was added
});

// Create an index for geospatial queries based on longitude and latitude
groupSchema.index({ "coordinates.longitude": 1, "coordinates.latitude": 1 });

module.exports = mongoose.model("groups", groupSchema);
