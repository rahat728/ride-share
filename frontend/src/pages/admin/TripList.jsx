import { useEffect, useState } from 'react';
import axios from 'axios';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log('User info:', userInfo);

    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/admin/trips",
            {
              headers: {
              Authorization: `Bearer ${userInfo.token}`
              },
            }
          );
        setTrips(data);
      } catch (err) {
        setError('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="text-center text-gray-500 py-6">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;

  return (
    <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">All Trips</h1>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4">Driver</th>
            <th className="py-2 px-4">Status</th>
            <th className="py-2 px-4">Ride Request</th>
          </tr>
        </thead>
        <tbody>
          {trips.map(trip => (
            <tr key={trip._id} className="text-center border-b">
              <td className="py-2 px-4">{trip.driver?.name}</td>
              <td className="py-2 px-4 capitalize">{trip.status}</td>
              <td className="py-2 px-4">{trip.rideRequest?._id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default TripList;
