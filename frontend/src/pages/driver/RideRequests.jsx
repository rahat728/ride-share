import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RideRequests = () => {
  const [pendingRides, setPendingRides] = useState([]);
  const [driverCoords, setDriverCoords] = useState(null);
  const [map, setMap] = useState(null);
  const [distanceData, setDistanceData] = useState({});
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // Fetch driver's current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDriverCoords(coords); // Ensure driverCoords state is set after location fetch

        console.log('Driver location:', coords);

        // Initialize map
        const gMap = new window.google.maps.Map(mapRef.current, {
          center: coords,
          zoom: 12,
        });

        // Add driver marker
        new window.google.maps.Marker({
          position: coords,
          map: gMap,
          title: 'Your Location',
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        });

        setMap(gMap); // Set map after initialization
      },
      (error) => {
        console.error('Error getting driver location:', error);
      }
    );
  }, []); // Empty dependency array to run only once

  // Fetch pending rides
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

  // Map and markers handling
  useEffect(() => {
    if (driverCoords && map && pendingRides.length > 0) {
      const directionsService = new window.google.maps.DirectionsService();
      const gMap = map;

      pendingRides.forEach((ride) => {
        const pickupCoords = ride.pickupCoordinates;
        const dropoffCoords = ride.dropoffCoordinates;

        if (pickupCoords && dropoffCoords) {
          // Add Pickup Marker
          new window.google.maps.Marker({
            position: pickupCoords,
            map: gMap,
            title: 'Pickup Location',
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          });

          // Add Dropoff Marker
          new window.google.maps.Marker({
            position: dropoffCoords,
            map: gMap,
            title: 'Dropoff Location',
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          });

          // Calculate distance and ETA from driver to pickup
          directionsService.route(
            {
              origin: driverCoords,
              destination: pickupCoords,
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
        }
      });
    }
  }, [driverCoords, map, pendingRides]);

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
    <div className="bg-gray-100 py-6 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Pending Ride Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ride Cards */}
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
              </div>
            ))
          )}
        </div>

        {/* Map Panel */}
        <div className="rounded-lg shadow-md overflow-hidden h-[600px]">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default RideRequests;
