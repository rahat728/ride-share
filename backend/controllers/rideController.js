const RideRequest = require('../models/RideRequest');
const Trip = require('../models/Trip');

const createRideRequest = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      pickupCoordinates,
      dropoffCoordinates
    } = req.body;

    const newRequest = await RideRequest.create({
      user: req.user.id,
      pickupLocation,
      dropoffLocation,
      pickupCoordinates,
      dropoffCoordinates
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: 'Server error creating ride request' });
  }
};

const getUserRideRequests = async (req, res) => {
  try {
    const rides = await RideRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching rides' });
  }
};

// GET all pending ride requests for drivers
const getPendingRides = async (req, res) => {
    try {
      const rides = await RideRequest.find({ status: 'pending' }).populate('user', 'name email');
      res.json(rides);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pending ride requests' });
    }
  };

// POST: Accept a ride (create a trip)
const acceptRideRequest = async (req, res) => {
    try {
      const rideRequestId = req.params.id;
  
      const rideRequest = await RideRequest.findById(rideRequestId);
      if (!rideRequest) return res.status(404).json({ error: 'Ride request not found' });
      if (rideRequest.status !== 'pending') return res.status(400).json({ error: 'Ride already accepted or cancelled' });
  
      // Update ride request status
      rideRequest.status = 'accepted';
      await rideRequest.save();
  
      // Create new trip
      const trip = await Trip.create({
        rideRequest: rideRequest._id,
        driver: req.user.id
      });
  
      res.status(201).json({ message: 'Ride accepted', trip });
    } catch (error) {
      res.status(500).json({ error: 'Server error accepting ride' });
    }
  };

  // backend/controllers/rideControllers.js
const completeRide = async (req, res) => {
  try {
    const rideRequestId = req.params.id;

    const ride = await RideRequest.findById(rideRequestId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    // Only allow completion if status is 'accepted'
    if (ride.status !== 'accepted') {
      return res.status(400).json({ error: 'Only accepted rides can be completed' });
    }

    ride.status = 'completed';
    await ride.save();

    res.json({ message: 'Ride marked as completed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error marking ride complete' });
  }
};

  

module.exports = { createRideRequest, getUserRideRequests, getPendingRides, acceptRideRequest, completeRide };
