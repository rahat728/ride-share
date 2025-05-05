import { useEffect, useState } from 'react';
import axios from 'axios';
import { sendLocationUpdate, connectDriverSocket, driverTestSocket } from '../../driverTestSocket'
const AcceptedRides = () => {
  const [acceptedTrips, setAcceptedTrips] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null); // Driver location state

  // Fetch accepted trips
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo?.token) {
      connectDriverSocket(userInfo.token); // << this was missing
    }
    const fetchAcceptedTrips = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/trips/accepted', {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        console.log('Fetched accepted trips:', data);
        setAcceptedTrips(data);
      } catch (err) {
        console.error('Error fetching accepted trips:', err);
      }
    };

    fetchAcceptedTrips();
  }, []);

  // Update trip status (e.g., "Arrived", "In Progress", "Completed")
  const updateStatus = async (tripId, newStatus) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    try {
      await axios.patch(`http://localhost:5000/api/trips/${tripId}/status`, { status: newStatus }, {

        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      // Refresh after update
      const { data } = await axios.get('/api/trips/accepted', {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setAcceptedTrips(data);
    } catch (err) {
      console.error('Error updating trip status:', err);
    }
  };
  console.log('🧪 driverSocket.connected:', driverTestSocket?.connected);

  // Function to simulate the driver's location update (could be replaced by actual GPS tracking)
  const sendDriverLocation = (tripId) => {
    if (driverLocation) {
      sendLocationUpdate(tripId, driverLocation); // Send the location to the server
      console.log(`Driver's location sent:`, driverLocation);
    }
  };

  // Simulate location change for the driver (e.g., by using geolocation API in a real app)
  const updateLocation = () => {
    // Simulating location change for now
    const newLocation = {
      lat: 37.7749,  // Sample latitude
      lng: -122.4194, // Sample longitude (San Francisco)
    };
    setDriverLocation(newLocation);
    sendDriverLocation(acceptedTrips[0].rideRequest._id); // Send location for the first accepted trip
  };

  return (
    <div className=" bg-gray-100 py-10 px-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {acceptedTrips.length === 0 ? (
          <p className="text-gray-600">No accepted rides yet.</p>
        ) : (
          acceptedTrips.map((trip) => (
            <div key={trip._id} className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
              <div>
                <p><span className="font-semibold">Pickup:</span> {trip.rideRequest?.pickupLocation}</p>
                <p><span className="font-semibold">Destination:</span> {trip.rideRequest?.dropoffLocation}</p>
                <p><span className="font-semibold">Status:</span> {trip.status}</p>
              </div>

              {/* Status update buttons */}
              <div className="flex gap-2 flex-wrap">
                {trip.status !== 'completed' && (
                  <>
                    {trip.status !== 'arrived' && (
                      <button
                        onClick={() => updateStatus(trip._id, 'arrived')}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                      >
                        Arrived
                      </button>
                    )}
                    {trip.status === 'arrived' && (
                      <button
                        onClick={() => updateStatus(trip._id, 'in_progress')}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                      >
                        In Progress
                      </button>
                    )}
                    {trip.status === 'in_progress' && (
                      <button
                        onClick={() => updateStatus(trip._id, 'completed')}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                      >
                        Completed
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Button to update driver's location */}
              <div className="mt-4">
                <button
                  onClick={updateLocation}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Update Location
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AcceptedRides;
