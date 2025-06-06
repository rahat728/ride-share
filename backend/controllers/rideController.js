const RideRequest = require('../models/RideRequest');
const Trip = require('../models/Trip');

const createRideRequest = async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      pickupCoordinates,
      dropoffCoordinates,
      vehicleType, // <-- new field
    } = req.body;

    const newRequest = await RideRequest.create({
      user: req.user.id,
      pickupLocation,
      dropoffLocation,
      pickupCoordinates,
      dropoffCoordinates,
      vehicleType, // <-- save vehicle type
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
    const role = req.user?.role;

    // Case 1: Driver — filter by vehicleType
    if (role === "driver") {
      const driverVehicleType = req.user?.vehicleType;
      if (!driverVehicleType) {
        return res.status(400).json({ error: "Driver vehicle type not specified" });
      }

      const rides = await RideRequest.find({
        status: "pending",
        vehicleType: driverVehicleType,
      }).populate("user", "name email");

      return res.json(rides);
    }

    // Case 2: User — return all pending ride requests (or just their own)
    if (role === "user") {
      const rides = await RideRequest.find({
        status: "pending",
        user: req.user._id, // optional: only return their own pending requests
      }).populate("user", "name email");

      return res.json(rides);
    }

    // Fallback if role not recognized
    return res.status(403).json({ error: "Unauthorized role" });
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    res.status(500).json({ error: "Server error" });
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
