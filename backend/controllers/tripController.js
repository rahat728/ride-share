const Trip = require('../models/Trip');

// PATCH /api/trips/:id/status
const updateTripStatus = async (req, res) => {

  const { status } = req.body;
  const allowedStatuses = ['arrived', 'in_progress', 'completed'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status update.' });
  }

  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // Only the driver assigned to this trip can update
    if (trip.driver.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this trip' });
    }

    trip.status = status;
    await trip.save();
    res.json({ message: `Trip status updated to ${status}`, trip });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// GET /api/trips/accepted
const getAcceptedTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ driver: req.user.id })
      .populate('rideRequest') // populate pickup and destination
      .where('status').in(['accepted', 'arrived', 'in_progress'])
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accepted trips' });
  }
};

// GET /api/trips/completed
const getCompletedTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      driver: req.user.id,
      status: 'completed'
    }).populate('rideRequest');

    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch completed trips' });
  }
};




module.exports = {
    updateTripStatus, 
    getAcceptedTrips,
    getCompletedTrips
  };
  