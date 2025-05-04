const axios = require("axios");

const getCurrentLocation = async (req, res) => {
  try {
    const response = await axios.post(
      `https://maps.gomaps.pro/geolocation/v1/geolocate?key=${process.env.GOMAPS_API_KEY}`,
      {
        // Include necessary device data here
        // For example, considerIp: true
        considerIp: true
      }
    );

    if (response.data && response.data.location) {
      res.json({
        location: response.data.location,
        accuracy: response.data.accuracy,
      });
    } else {
      res.status(400).json({ error: "Unable to determine location." });
    }
  } catch (error) {
    console.error("GoMaps Geolocation API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch location from GoMaps API." });
  }
};

module.exports = { getCurrentLocation };
