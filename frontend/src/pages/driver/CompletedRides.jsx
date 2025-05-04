import { useEffect, useState } from 'react';
import axios from 'axios';

const CompletedRides = () => {
  const [completedRides, setCompletedRides] = useState([]);


  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchCompletedRides = async () => {
      try {
        
        const { data } = await axios.get('/api/trips/completed', {
            headers: {
            Authorization: `Bearer ${userInfo.token}`
            },
        });
        console.log('Fetched completed rides:', data);
        setCompletedRides(data);
      } catch (error) {
        console.error('Failed to fetch completed rides:', error);
      }
    };

    fetchCompletedRides();
  }, []);

  return (
    <div className=" flex flex-col items-center bg-gray-100 p-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {completedRides.length > 0 ? (
          completedRides.map((ride) => (
            <div
              key={ride._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h2 className="text-2xl font-semibold mb-2">Ride ID: {ride._id}</h2>
              <p className="text-gray-600">Status: {ride.status}</p>
              <p className="text-gray-600 mt-2">Pickup Location: {ride.rideRequest.pickupLocation}</p>
              <p className="text-gray-600">Dropoff Location: {ride.rideRequest.dropoffLocation}</p>
              <p className="text-gray-600">Created At: {new Date(ride.createdAt).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No completed rides yet.</p>
        )}
      </div>

   
    </div>
  );
};

export default CompletedRides;
