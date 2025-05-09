import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  sendLocationUpdate,
  connectDriverSocket,
} from '../../driverTestSocket';

const AcceptedRides = () => {
  const [acceptedTrips, setAcceptedTrips] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [tripDistance, setTripDistance] = useState({});
  const [mapStatus, setMapStatus] = useState({});
  const mapRefs = useRef({});

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo?.token) {
      connectDriverSocket(userInfo.token);
    }

    const fetchAcceptedTrips = async () => {
      try {
        const { data } = await axios.get(
          'http://localhost:5000/api/trips/accepted',
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        setAcceptedTrips(data);
        localStorage.setItem('acceptedTripCount', data.length);

        // Load the map right away
        data.forEach((trip) => {
          setTimeout(() => initializeMap(trip), 100);
        });
      } catch (err) {
        console.error('Error fetching accepted trips:', err);
      }
    };

    fetchAcceptedTrips();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setDriverLocation(coords);
          acceptedTrips.forEach((trip) => {
            sendLocationUpdate(trip.rideRequest._id, coords);
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [acceptedTrips]);

  const updateStatus = async (tripId, newStatus) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    try {
      await axios.patch(
        `http://localhost:5000/api/trips/${tripId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      const { data } = await axios.get(
        'http://localhost:5000/api/trips/accepted',
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      setAcceptedTrips(data);
    } catch (err) {
      console.error('Error updating trip status:', err);
    }
  };

  const initializeMap = (trip) => {
    setMapStatus((prev) => ({ ...prev, [trip._id]: 'loading' }));

    const container = mapRefs.current[trip._id];
    const pickup = trip.rideRequest?.pickupCoordinates;
    const dropoff = trip.rideRequest?.dropoffCoordinates;

    if (!container || !pickup || !dropoff || !window.google?.maps) {
      setMapStatus((prev) => ({ ...prev, [trip._id]: 'error' }));
      return;
    }

    const map = new window.google.maps.Map(container, {
      center: pickup,
      zoom: 13,
    });

    new window.google.maps.Marker({
      map,
      position: pickup,
      title: 'Pickup',
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    });

    new window.google.maps.Marker({
      map,
      position: dropoff,
      title: 'Dropoff',
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    });

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
    });

    directionsService.route(
      {
        origin: pickup,
        destination: dropoff,
        travelMode: 'DRIVING',
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0].legs[0];
          setTripDistance((prev) => ({
            ...prev,
            [trip._id]: leg.distance.text,
          }));
          setMapStatus((prev) => ({ ...prev, [trip._id]: 'loaded' }));
        } else {
          console.warn('Directions failed:', status);
          setMapStatus((prev) => ({ ...prev, [trip._id]: 'error' }));
        }
      }
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      {acceptedTrips.length === 0 ? (
        <p className="text-gray-600 text-center">No accepted rides yet.</p>
      ) : (
        acceptedTrips.map((trip) => (
          <div
            key={trip._id}
            className="bg-white rounded-xl shadow-md mb-8 overflow-hidden md:h-[85vh]"
          >
            <div className="md:grid md:grid-cols-2 h-full">
              {/* Left Card: Ride Details */}
              <div className="p-6 space-y-3 flex flex-col justify-center">
                <p>
                  <span className="font-semibold">Pickup:</span>{' '}
                  {trip.rideRequest?.pickupLocation}
                </p>
                <p>
                  <span className="font-semibold">Dropoff:</span>{' '}
                  {trip.rideRequest?.dropoffLocation}
                </p>
                <p>
                  <span className="font-semibold">Status:</span> {trip.status}
                </p>
                {tripDistance[trip._id] && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Trip Distance:</span>{' '}
                    {tripDistance[trip._id]}
                  </p>
                )}
                <div className="flex gap-2 flex-wrap mt-4">
                  {trip.status !== 'completed' && (
                    <>
                      {trip.status !== 'arrived' && (
                        <button
                          onClick={() => updateStatus(trip._id, 'arrived')}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Mark Arrived
                        </button>
                      )}
                      {trip.status === 'arrived' && (
                        <button
                          onClick={() => updateStatus(trip._id, 'in_progress')}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Start Trip
                        </button>
                      )}
                      {trip.status === 'in_progress' && (
                        <button
                          onClick={() => updateStatus(trip._id, 'completed')}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Complete Trip
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Right Card: Map */}
              <div className="relative h-64 md:h-full">
                {mapStatus[trip._id] === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                    <span className="text-gray-600">Loading map...</span>
                  </div>
                )}
                {mapStatus[trip._id] === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-100 z-10">
                    <span className="text-red-600 font-medium">
                      Failed to load map.
                    </span>
                  </div>
                )}
                <div
                  ref={(el) => (mapRefs.current[trip._id] = el)}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AcceptedRides;
