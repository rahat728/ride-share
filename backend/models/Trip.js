const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  rideRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'RideRequest', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['accepted', 'arrived', 'in_progress', 'completed'],
    default: 'accepted'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);
