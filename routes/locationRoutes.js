// routes/locationRoutes.js
const express = require("express");
const Location = require("../models/Group"); // Import the Location model

const router = express.Router();

// Function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Define route for fetching locations within a given radius and sorting them
router.post("/fetch-locations-in-radius", async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude == null || longitude == null) {
    return res
      .status(400)
      .json({ message: "Latitude and longitude are required." });
  }

  try {
    // Calculate the bounding box
    const latDelta = 0.25; // Approximately 20 km radius
    const longDelta = 0.25; // Keep it the same for simplicity

    const northeast = {
      lat: latitude + latDelta,
      lng: longitude + longDelta,
    };

    const southwest = {
      lat: latitude - latDelta,
      lng: longitude - longDelta,
    };

    // Fetch all groups from the database
    const allGroups = await Location.find();

    // Filter and map groups to include distance from the user's location
    const filteredGroups = allGroups
      .filter((group) => {
        const groupLat = group.coordinates.latitude;
        const groupLng = group.coordinates.longitude;

        return (
          groupLat >= southwest.lat &&
          groupLat <= northeast.lat &&
          groupLng >= southwest.lng &&
          groupLng <= northeast.lng
        );
      })
      .map((group) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          group.coordinates.latitude,
          group.coordinates.longitude
        );
        return { ...group.toObject(), distance }; // Include distance in the response
      })
      .sort((a, b) => a.distance - b.distance); // Sort by distance

    res
      .status(200)
      .json({
        message: "Locations fetched successfully",
        data: filteredGroups,
      });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
