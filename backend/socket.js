const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Middleware to authenticate every socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log('Socket token:', token);

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Save user info into socket
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User ID: ${socket.user.id})`);
    console.log('🧠 Client connected:', socket.id);
    console.log('🔢 Total connections:', io.engine.clientsCount);
    // Join the ride room when the user wants to track the ride
    socket.on('joinTrip', ({ tripId }) => {
      if (!tripId) {
        return;
      }
      socket.join(tripId); // User joins the room corresponding to the trip ID
      console.log(`${socket.user.role} joined trip room: ${tripId}`);
    });

    // Driver sends location updates
    socket.on('locationUpdate', ({ tripId, location }) => {
      if (tripId && location) {
        // Emit the location to the users who are tracking the trip
        socket.to(tripId).emit('driverLocation', location);
        console.log(`Location update for trip ${tripId}:`, location);
      }
    });

    // Listen for the driver to disconnect (optional, for logging purposes)
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
