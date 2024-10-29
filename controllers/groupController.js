const axios = require("axios");
const Location = require("../models/Group"); // Import the Location model

exports.fetchAndSaveLocations = async (req, res) => {
  const { city, category } = req.body;

  // Replace with the actual coordinates based on the city
  // For demonstration, using hardcoded coordinates
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"~"${category}"](18.3953,73.7111,18.7394,73.9424);out body;`;

  try {
    // Fetch data from Overpass API
    const response = await axios.get(overpassUrl);
    const locations = response.data.elements;

    // Map the fetched locations to match the model schema
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

    // Save all locations to the database
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
