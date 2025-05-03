const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['user', 'driver', 'admin'],
    default: 'user',
  },

  vehicleType: { type: String, enum: ['car', 'auto', 'moto'], required: function () { return this.role === 'driver'; } },

  vehicleCapacity: { type: Number, min: 1, max: 6, required: function () { return this.role === 'driver'; } },

  vehicleColor: { type: String, required: function () { return this.role === 'driver'; } },

  vehiclePlate: { type: String, required: function () { return this.role === 'driver'; } },
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
