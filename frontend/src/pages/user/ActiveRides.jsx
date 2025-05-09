import { useRef, useEffect, useState } from 'react';

const ActiveRides = ({ rides }) => {
  const mapRefs = useRef({});
  const [mapStatus, setMapStatus] = useState({});

  useEffect(() => {
    rides.forEach((ride) => initializeMap(ride));
  }, [rides]);

  const initializeMap = (ride) => {
    setMapStatus((prev) => ({ ...prev, [ride._id]: 'loading' }));
    const container = mapRefs.current[ride._id];
    const pickup = ride.rideRequest?.pickupCoordinates;
    const dropoff = ride.rideRequest?.dropoffCoordinates;

    if (!container || !pickup || !dropoff || !window.google?.maps) {
      setMapStatus((prev) => ({ ...prev, [ride._id]: 'error' }));
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
          setMapStatus((prev) => ({ ...prev, [ride._id]: 'loaded' }));
        } else {
          console.warn('Directions failed:', status);
          setMapStatus((prev) => ({ ...prev, [ride._id]: 'error' }));
        }
      }
    );
  };

  if (rides.length === 0) {
    return <p className="text-gray-500">No active ride requests.</p>;
  }

  return (
    <div className="space-y-6">
      {rides.map((ride) => (
        <div
          key={ride._id}
          className="bg-white rounded-xl shadow-md overflow-hidden md:h-[85vh]"
        >
          <div className="md:grid md:grid-cols-2 h-full">
            {/* Left: Ride Info */}
            <div className="p-6 space-y-3 flex flex-col justify-center">
              <p>
                <span className="font-semibold">Pickup:</span>{' '}
                {ride.rideRequest?.pickupLocation}
              </p>
              <p>
                <span className="font-semibold">Dropoff:</span>{' '}
                {ride.rideRequest?.dropoffLocation}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span
                  className={`font-semibold ${
                    ride.status === 'pending'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  }`}
                >
                  {ride.status}
                </span>
              </p>
              <p className="text-sm text-gray-400">
                Requested at:{' '}
                {new Date(ride.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Right: Map */}
            <div className="relative h-64 md:h-full">
              {mapStatus[ride._id] === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                  <span className="text-gray-600">Loading map...</span>
                </div>
              )}
              {mapStatus[ride._id] === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 z-10">
                  <span className="text-red-600 font-medium">
                    Failed to load map.
                  </span>
                </div>
              )}
              <div
                ref={(el) => (mapRefs.current[ride._id] = el)}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveRides;
