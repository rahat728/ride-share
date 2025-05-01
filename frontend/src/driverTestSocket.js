import { io } from 'socket.io-client';

export let driverSocket = null;

export const connectDriverSocket = (token) => {
  if (!token) {
    console.error('❌ No token provided to driverTestSocket.');
    return;
  }

  driverSocket = io('http://localhost:5000', {
    transports: ['websocket'],
    auth: {
      token,
    },
  });

  driverSocket.on('connect', () => {
    console.log('✅ Driver Socket Connected:', driverSocket.id);
  });

  driverSocket.on('connect_error', (err) => {
    console.error('❌ Driver Test Socket Connect Error:', err.message);
  });
};

export const driverTestSocket = driverSocket; // Export the socket for use in other componentss

export const getDriverSocket = () => {
  if (!driverSocket) {
    console.error('❌ Driver Socket is not connected yet!');
    return null;
  }
  return driverSocket;
};  

export const sendLocationUpdate = (tripId, location) => {
  if (driverSocket) {
    driverSocket.emit('locationUpdate', { tripId, location });
    console.log(`Driver sent location for trip ${tripId}:`, location);
  }
};

export const disconnectDriverSocket = () => {
  if (driverSocket) {
    driverSocket.disconnect();
    driverSocket = null;
    console.log('❌ Driver Socket Disconnected');
  }
};
