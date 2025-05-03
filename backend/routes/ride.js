const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');
const { createRideRequest, getUserRideRequests } = require('../controllers/rideController');
const { getPendingRides, acceptRideRequest } = require('../controllers/rideController');
const { completeRide } = require('../controllers/rideController');

const router = express.Router();

router.post('/request', protect, roleCheck('user'), createRideRequest);
router.get('/my-requests', protect, roleCheck('user'), getUserRideRequests);
// GET all pending rides — driver only
router.get('/pending', protect, roleCheck('driver'), getPendingRides);
// POST accept a ride request — driver only
router.post('/accept/:id', protect, roleCheck('driver'), acceptRideRequest);

// Mark ride as completed (driver only)
router.post('/complete/:id', protect, roleCheck('driver'), completeRide);
module.exports = router;
