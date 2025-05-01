const User = require('../models/User');
const RideRequest = require('../models/RideRequest');
const Trip = require('../models/Trip');

// Get all users (including drivers and admins)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get all ride requests
const getAllRideRequests = async (req, res) => {
  try {
    const rides = await RideRequest.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ride requests' });
  }
};

// Get all trips
const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('rideRequest')
      .populate('driver', 'name email')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

module.exports = {
  getAllUsers,
  getAllRideRequests,
  getAllTrips
};
