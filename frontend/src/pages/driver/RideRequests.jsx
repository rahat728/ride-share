import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ... imports remain the same

const RideRequests = () => {
  const [pendingRides, setPendingRides] = useState([]);
  const [driverCoords, setDriverCoords] = useState(null);
  const [distanceData, setDistanceData] = useState({});
  const [activeMapRideId, setActiveMapRideId] = useState(null);
  const mapRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDriverCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting driver location:', error);
      }
    );
  }, []);

  useEffect(() => {
    const fetchPendingRides = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      try {
        const { data } = await axios.get('http://localhost:5000/api/ride/pending', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setPendingRides(data);
      } catch (err) {
        console.error('Error fetching pending rides:', err);
      }
    };

    fetchPendingRides();
  }, []);

  const handleToggleMap = (ride) => {
    // Toggle behavior
    if (activeMapRideId === ride._id) {
      setActiveMapRideId(null);
      return;
    }

    setActiveMapRideId(ride._id);

    setTimeout(() => {
      const mapContainer = mapRefs.current[ride._id];
      if (!mapContainer || !driverCoords) return;

      const gMap = new window.google.maps.Map(mapContainer, {
        center: driverCoords,
        zoom: 12,
      });

      new window.google.maps.Marker({
        position: driverCoords,
        map: gMap,
        title: 'Your Location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      });

      if (ride.pickupCoordinates) {
        new window.google.maps.Marker({
          position: ride.pickupCoordinates,
          map: gMap,
          title: 'Pickup',
          icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
        });
      }

      if (ride.dropoffCoordinates) {
        new window.google.maps.Marker({
          position: ride.dropoffCoordinates,
          map: gMap,
          title: 'Dropoff',
          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        });
      }

      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: driverCoords,
          destination: ride.pickupCoordinates,
          travelMode: 'DRIVING',
        },
        (result, status) => {
          if (status === 'OK') {
            const leg = result.routes[0].legs[0];
            setDistanceData((prev) => ({
              ...prev,
              [ride._id]: {
                distance: leg.distance.text,
                duration: leg.duration.text,
              },
            }));
          } else {
            console.warn(`Directions failed for ride ${ride._id}: ${status}`);
          }
        }
      );
    }, 100);
  };

  const acceptRide = async (rideId) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/ride/accept/${rideId}`,
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      navigate(`/driver/trip/${data.tripId}`);
    } catch (err) {
      console.error('Error accepting ride:', err);
    }
  };

  return (
    <div className="bg-gray-100 py-6 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Pending Ride Requests</h2>
      <div className="space-y-4">
        {pendingRides.length === 0 ? (
          <p className="text-gray-600">No pending ride requests.</p>
        ) : (
          pendingRides.map((ride) => (
            <div key={ride._id} className="bg-white p-4 rounded-lg shadow-md">
              <p><strong>Pickup:</strong> {ride.pickupLocation}</p>
              <p><strong>Dropoff:</strong> {ride.dropoffLocation}</p>
              <p className="text-sm text-gray-500">Requested by: {ride.user?.name} ({ride.user?.email})</p>

              {distanceData[ride._id] && (
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Distance from you:</strong> {distanceData[ride._id].distance} <br />
                  <strong>ETA:</strong> {distanceData[ride._id].duration}
                </p>
              )}

              <button
                onClick={() => acceptRide(ride._id)}
                className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Accept Ride
              </button>

              <button
                onClick={() => handleToggleMap(ride)}
                className="ml-4 mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                {activeMapRideId === ride._id ? 'Hide Map' : 'Show Map'}
              </button>

              {activeMapRideId === ride._id && (
                <div
                  ref={(el) => (mapRefs.current[ride._id] = el)}
                  className="mt-4 w-full h-64 rounded border"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RideRequests;
