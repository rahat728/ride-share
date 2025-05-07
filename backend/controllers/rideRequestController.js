const RideRequest = require('../models/RideRequest');

const getPendingRideRequests = async (req, res) => {
  try {
    if (!req.user) {
      console.error('No req.user available in getPendingRideRequests');
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const driverVehicleType = req.user.vehicleType;
    if (!driverVehicleType) {
      console.error('Driver vehicle type missing:', req.user);
      return res.status(400).json({ error: 'Driver vehicle type not specified' });
    }

    const rides = await RideRequest.find({
      status: 'pending',
      vehicleType: driverVehicleType,
    }).populate('user', 'name email');

    res.json(rides);
  } catch (error) {
    console.error('Error in getPendingRideRequests:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getPendingRideRequests };
