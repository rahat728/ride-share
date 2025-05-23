const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');
const { updateTripStatus, getAcceptedTrips, getCompletedTrips } = require('../controllers/tripController');
const { getUserTrips } = require('../controllers/tripController');

// Update trip status
router.patch('/:id/status', protect, roleCheck('driver'), updateTripStatus);

// Get accepted trips
router.get('/accepted', protect, roleCheck('driver'), getAcceptedTrips);

// Get completed trips
router.get('/completed', protect, roleCheck('driver'), getCompletedTrips);

// For users
router.get('/my-trips', protect, roleCheck('user'), getUserTrips);

module.exports = router;
