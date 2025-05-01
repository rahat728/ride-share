import { useEffect, useState } from 'react';
import { connectDriverSocket, getDriverSocket, disconnectDriverSocket } from '../driverTestSocket';

const DriverLiveUpdate = ({ tripId }) => {
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.token) {
      console.log('🔑 Connecting Driver socket with token:', userInfo.token);
      connectDriverSocket(userInfo.token);
    } else {
      console.error('❌ No userInfo or token found in localStorage for driver.');
    }

    return () => {
      disconnectDriverSocket();
    };
  }, []);

  useEffect(() => {
    const socket = getDriverSocket();
    if (!tripId) return;

    const tryJoinTrip = () => {
      if (socket && socket.connected) {
        socket.emit('joinTrip', { tripId });
        console.log('✅ Driver joined trip room:', tripId);
      } else {
        console.warn('⏳ Waiting for driver socket connection...');
        setTimeout(tryJoinTrip, 500); // Retry after 500ms
      }
    };

    tryJoinTrip();
  }, [tripId]);

  const handleSendLocation = () => {
    const socket = getDriverSocket();
    if (!socket || !socket.connected) {
      console.error('❌ Driver Socket not connected yet!');
      return;
    }

    if (location.latitude && location.longitude) {
      setSending(true);

      socket.emit('locationUpdate', {
        tripId,
        location: {
          lat: parseFloat(location.latitude),
          lng: parseFloat(location.longitude),
        },
      });

      console.log('📍 Driver sent location:', location);

      setTimeout(() => setSending(false), 500);
    } else {
      console.warn('⚠️ Please enter both latitude and longitude.');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">Driver Live Location Update</h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Latitude"
          value={location.latitude}
          onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
          className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Longitude"
          value={location.longitude}
          onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
          className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendLocation}
          disabled={sending}
          className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send Location'}
        </button>
      </div>
    </div>
  );
};

export default DriverLiveUpdate;
