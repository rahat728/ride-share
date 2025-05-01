import { useEffect, useState } from 'react';
import {
  connectTestSocket,
  listenForDriverLocation,
  disconnectTestSocket,
  joinTrip,
  testSocket, // <-- import the socket instance
} from '../testSocket';

const TripLiveTracking = ({ tripId }) => {
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo?.token) return;

    connectTestSocket(userInfo.token);

    const handleConnect = () => {
      console.log('✅ Socket connected in TripLiveTracking');
      joinTrip(tripId);
      listenForDriverLocation((location) => {
        console.log('📍 Received driver location:', location);
        setDriverLocation(location);
      });
    };

    if (testSocket) {
      testSocket.on('connect', handleConnect);
    }


    return () => {
      if (testSocket) {
        testSocket.off('connect', handleConnect);
        testSocket.off('driverLocation'); // cleanup listener
      }
      disconnectTestSocket();
    };
  }, [tripId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-8">
      <h2 className="text-2xl font-semibold mb-4">Live Driver Location</h2>
      {driverLocation ? (
        <div>
          <p><strong>Latitude:</strong> {driverLocation.lat}</p>
          <p><strong>Longitude:</strong> {driverLocation.lng}</p>
        </div>
      ) : (
        <p className="text-gray-500">Waiting for driver's location...</p>
      )}
    </div>
  );
};

export default TripLiveTracking;
