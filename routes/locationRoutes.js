const express = require("express");
const Location = require("../models/Group");

const router = express.Router();

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const getFilteredGroups = async(latitude, longitude, category = null) => {
    const query = category ? { category } : {};
    const allGroups = await Location.find(query);
    return allGroups
        .map((group) => {
            const distance = calculateDistance(
                latitude,
                longitude,
                group.coordinates.latitude,
                group.coordinates.longitude
            );
            return {...group.toObject(), distance };
        })
        .sort((a, b) => a.distance - b.distance);
};

router.post("/fetch-locations-in-radius", async(req, res) => {
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
        return res
            .status(400)
            .json({ message: "Latitude and longitude are required." });
    }

    try {
        const filteredGroups = await getFilteredGroups(latitude, longitude);
        console.log("filetered:", filteredGroups);
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

router.post("/fetch-locations-in-radius-category", async(req, res) => {
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

router.get("/fetch-all-categories", async(req, res) => {
    try {
        const categories = await Location.distinct("category");
        res.status(200).json({
            message: "Categories fetched successfully",
            data: categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
});

module.exports = router;