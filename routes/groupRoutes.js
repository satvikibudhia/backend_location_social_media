const express = require("express");
const { fetchAndSaveLocations } = require("../controllers/groupController");

const router = express.Router();

router.post("/fetch-locations", fetchAndSaveLocations);

module.exports = router;
