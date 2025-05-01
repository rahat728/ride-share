const RideRequest = require('../models/RideRequest');

// GET /api/rideRequests/pending
const getPendingRideRequests = async (req, res) => {
  try {
    const pendingRides = await RideRequest.find({ status: 'pending' });
    res.json(pendingRides);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = {
  getPendingRideRequests,
  // other controllers...
};
