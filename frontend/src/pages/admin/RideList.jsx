import { useEffect, useState } from 'react';
import axios from 'axios';

const RideList = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/admin/rides",
            {
              headers: {
                Authorization: `Bearer ${userInfo.token}`
              },
            }
          );
        setRides(data);
        console.log('Fetched rides:', data);
      }
        catch (err) {
            console.error('Error:', err);
            setError('Failed to load rides');
          }
          
      finally {
         setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="text-center text-gray-500 py-6">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-6">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">All Ride Request</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
            <th className="py-2 px-4">User</th>
              <th className="py-2 px-4">Pickup</th>
              <th className="py-2 px-4">Destination</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {rides.map(ride => (
              <tr key={ride._id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{ride.user?.name}</td>
                <td className="py-2 px-4">{ride.pickupLocation}</td>
                <td className="py-2 px-4">{ride.dropoffLocation}</td>
                <td className="py-2 px-4">{ride.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RideList;
