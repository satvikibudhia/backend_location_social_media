// routes/locationRoutes.js
const express = require("express");
const Location = require("../models/Group");
const User = require("../models/Users");

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

// Function to check if a group is within the bounding box
const isWithinBoundingBox = (groupLat, groupLng, southwest, northeast) => {
  return (
    groupLat >= southwest.lat &&
    groupLat <= northeast.lat &&
    groupLng >= southwest.lng &&
    groupLng <= northeast.lng
  );
};

// Function to fetch and filter groups based on location and optional category
const getFilteredGroups = async (latitude, longitude, category = null) => {
  const latDelta = 0.25; // Approximately 20 km radius
  const longDelta = 0.25;

  const northeast = { lat: latitude + latDelta, lng: longitude + longDelta };
  const southwest = { lat: latitude - latDelta, lng: longitude - longDelta };

  // Fetch groups, optionally filtering by category
  const query = category ? { category } : {};
  const allGroups = await Location.find(query);

  // Filter groups within bounding box and calculate distance
  return allGroups
    .filter((group) =>
      isWithinBoundingBox(
        group.coordinates.latitude,
        group.coordinates.longitude,
        southwest,
        northeast
      )
    )
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
};

// Route to fetch locations within a given radius, sorted by nearest distance
router.post("/fetch-locations-in-radius", async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude == null || longitude == null) {
    return res
      .status(400)
      .json({ message: "Latitude and longitude are required." });
  }

  try {
    const filteredGroups = await getFilteredGroups(latitude, longitude);
    res.status(200).json({
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

// Route to fetch locations within a given radius and category, sorted by nearest distance
router.post("/fetch-locations-in-radius-category", async (req, res) => {
  const { latitude, longitude, category } = req.body;

  if (latitude == null || longitude == null) {
    return res
      .status(400)
      .json({ message: "Latitude and longitude are required." });
  }
  if (!category) {
    return res.status(400).json({ message: "Category is required." });
  }

  try {
    const filteredGroups = await getFilteredGroups(
      latitude,
      longitude,
      category
    );
    res.status(200).json({
      message: "Locations fetched successfully by category",
      data: filteredGroups,
    });
  } catch (error) {
    console.error("Error fetching locations by category:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
