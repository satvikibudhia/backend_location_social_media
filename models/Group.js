const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  city: { type: String, required: true },
  category: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  coordinates: {
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

groupSchema.index({ "coordinates.longitude": 1, "coordinates.latitude": 1 });

module.exports = mongoose.model("groups", groupSchema);
