const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllRideRequests,
  getAllTrips
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');

// All routes below are admin-only
router.use(protect, roleCheck('admin'));

router.get('/users', getAllUsers);
router.get('/rides', getAllRideRequests);
router.get('/trips', getAllTrips);

module.exports = router;
