import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RideRequests = () => {
  const [pendingRides, setPendingRides] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchPendingRides = async () => {
      try {
        const { data }  = await axios.get('http://localhost:5000/api/ride/pending', {
            headers: {
            Authorization: `Bearer ${userInfo.token}`
            },
        });
        setPendingRides(data);
        console.log('Fetched pending rides:', data);
      } catch (err) {
        console.error('Error fetching pending rides:', err);
      }
    };

    fetchPendingRides();
  }, []);

  const acceptRide = async (rideId) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    try {
        const { data } = await axios.post(
          `http://localhost:5000/api/ride/accept/${rideId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
  
        navigate(`/driver/trip/${data.tripId}`);
    } catch (err) {
      console.error('Error accepting ride:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pending Ride Requests</h1>
        <button
          onClick={() => navigate('/driver/dashboard')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Home
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pendingRides.length === 0 ? (
          <p className="text-gray-600">No pending ride requests.</p>
        ) : (
          pendingRides.map((ride) => (
            <div key={ride._id} className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
              <div>
                <p><span className="font-semibold">Pickup:</span> {ride.pickupLocation}</p>
                <p><span className="font-semibold">Destination:</span> {ride.dropoffLocation}</p>
                <p className="text-sm text-gray-500 mb-2">Requested by: {ride.user?.name} ({ride.user?.email})</p>
              </div>
              <button
                onClick={() => acceptRide(ride._id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Accept Ride
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RideRequests;
