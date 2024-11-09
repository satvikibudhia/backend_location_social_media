const axios = require("axios");
const Location = require("../models/Group");

const OPEN_CAGE_API_KEY = "5a17a8e13a8440a3999c6e755262560d";

exports.fetchAndSaveLocations = async (req, res) => {
  const { city, category, mainCategory } = req.body;
  try {
    const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${OPEN_CAGE_API_KEY}`;
    const openCageResponse = await axios.get(openCageUrl);

    const bounds = openCageResponse.data.results[0].bounds;
    const northeast = bounds.northeast;
    const southwest = bounds.southwest;
    console.log(
      "coordinaties",
      southwest.lat,
      southwest.lng,
      northeast.lat,
      northeast.lng,
      city,
      category,
      mainCategory
    );

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["${mainCategory}"~"${category}"](${southwest.lat},${southwest.lng},${northeast.lat},${northeast.lng});out body;`;
    const overpassResponse = await axios.get(overpassUrl);
    const locations = overpassResponse.data.elements;
    const locationDocs = locations.map((loc) => ({
      city,
      category,
      name: loc.tags.name || "Unnamed",
      description: loc.tags.description || "",
      coordinates: {
        longitude: loc.lon,
        latitude: loc.lat,
      },
      createdAt: new Date(),
    }));

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
