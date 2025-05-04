const express = require("express");
const router = express.Router();
const { getCurrentLocation } = require("../controllers/locationController");

router.post("/current", getCurrentLocation);

module.exports = router;
