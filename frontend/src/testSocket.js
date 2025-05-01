import { io } from "socket.io-client";

export let testSocket = null;

export const connectTestSocket = (token) => {
  if (!token) {
    console.error('❌ No token provided to testSocket.');
    return;
  }

  if (testSocket && testSocket.connected) {
    console.log('🔁 Socket already connected');
    return testSocket;
  }


  testSocket = io('http://localhost:5000', {
    transports: ['websocket'],
    auth: {token},
    reconnectionAttempts: 3,       // ⬅ limit retries
    reconnectionDelay: 2000, 
  });

  testSocket.on('connect', () => {
    console.log('✅ Test Socket Connected:', testSocket.id);
  });

  testSocket.on('connect_error', (err) => {
    console.error('❌ Test Socket Connect Error:', err.message);
  });
};

// New function to listen for driver location
export const listenForDriverLocation = (callback) => {
  if (!testSocket) {
    console.error('❌ Cannot listen: testSocket is not connected.');
    return;
  }

  testSocket.on('driverLocation', (location) => {
    console.log('📍 Driver location received:', location);
    if (callback) callback(location);
  });
};

export const joinTrip = (tripId) => {
  if (testSocket) {
    testSocket.emit('joinTrip', { tripId });
    console.log(`User joined trip room: ${tripId}`);
  }
};

export const disconnectTestSocket = () => {
  if (testSocket) {
    testSocket.disconnect();
    testSocket = null;
    console.log('❌ Test Socket Disconnected');
  }
};
