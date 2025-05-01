const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');
const { getPendingRideRequests } = require('../controllers/rideRequestController');

// GET pending rides
router.get('/pending', protect, roleCheck('driver'), getPendingRideRequests);

module.exports = router;
