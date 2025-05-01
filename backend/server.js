const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { protect } = require('./middleware/authMiddleware');

const socketIO = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Express Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5000',
  credentials: true,
}));
app.use(express.json());

// Setup Socket.IO
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
require('./socket')(io);

// API Routes
const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/ride');
const adminRoutes = require('./routes/admin');
const tripRoutes = require('./routes/trip');
const rideRequestRoutes = require('./routes/rideRequest');

app.use('/api/auth', authRoutes);
app.use('/api/ride', rideRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/rideRequests', rideRequestRoutes);

// Private Test Route
app.get('/api/private', protect, (req, res) => {
  res.json({ message: `Hello ${req.user.role}, you are authorized.` });
});

// Public Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});




// Attach authentication middleware for socket


// Handle WebSocket Events


// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
