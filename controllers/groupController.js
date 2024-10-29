const axios = require("axios");
const Location = require("../models/Group"); // Import the Location model

// OpenCage API key (replace 'YOUR_OPENCAGE_API_KEY' with your actual API key)
const OPEN_CAGE_API_KEY = "5a17a8e13a8440a3999c6e755262560d";

exports.fetchAndSaveLocations = async (req, res) => {
  const { city, category } = req.body;

  try {
    // Step 1: Fetch the bounding box for the city from OpenCage API
    const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${OPEN_CAGE_API_KEY}`;
    const openCageResponse = await axios.get(openCageUrl);

    const bounds = openCageResponse.data.results[0].bounds;
    const northeast = bounds.northeast;
    const southwest = bounds.southwest;

    // Step 2: Use the bounding box with Overpass API to fetch locations
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"~"${category}"](${southwest.lat},${southwest.lng},${northeast.lat},${northeast.lng});out body;`;
    const overpassResponse = await axios.get(overpassUrl);
    const locations = overpassResponse.data.elements;

    // Step 3: Map the fetched locations to match the Location schema
    const locationDocs = locations.map((loc) => ({
      city, // Use the city from the request
      category, // Use the category from the request
      name: loc.tags.name || "Unnamed", // Default name if not provided
      description: loc.tags.description || "", // Optional description
      coordinates: {
        longitude: loc.lon,
        latitude: loc.lat,
      },
      createdAt: new Date(), // Timestamp of when the entry is created
    }));

    // Step 4: Save all locations to the database
    await Location.insertMany(locationDocs);

    res
      .status(200)
      .json({ message: "Locations saved successfully", data: locationDocs });
  } catch (error) {
    console.error("Error saving locations:", error);
    res
      .status(500)
      .json({ message: "Error saving locations", error: error.message });
  }
};
