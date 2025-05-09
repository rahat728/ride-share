import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RideRequests = () => {
  const [pendingRides, setPendingRides] = useState([]);
  const [driverCoords, setDriverCoords] = useState(null);
  const [distanceData, setDistanceData] = useState({});
  const [tripDistances, setTripDistances] = useState({});
  const [activeMapRideId, setActiveMapRideId] = useState(null);
  const [acceptedRideExists, setAcceptedRideExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mapRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    const count = parseInt(localStorage.getItem("acceptedTripCount"), 10);
    setAcceptedRideExists(count >= 1);
  }, []);

  const parseDistance = (text) => {
    if (!text) return Infinity;
    const num = text.match(/[\d.]+/);
    return num ? parseFloat(num[0]) : Infinity;
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDriverCoords(coords);
      },
      (error) => {
        console.error("Error getting driver location:", error);
        setError("Unable to fetch your current location.");
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    const fetchAndSortRides = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/ride/pending",
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );

        if (!driverCoords) return;

        const distancesMap = {};
        const tripDistancesMap = {};
        const results = [];

        for (const ride of data) {
          const pickupInfo = await getDistance(
            driverCoords,
            ride.pickupCoordinates
          );
          const distanceText = pickupInfo?.distance?.text || "";
          const durationText = pickupInfo?.duration?.text || "";

          distancesMap[ride._id] = {
            distance: distanceText,
            duration: durationText,
          };

          // Also calculate pickup → dropoff distance
          let tripDistance = "";
          if (ride.pickupCoordinates && ride.dropoffCoordinates) {
            const leg = await getDistance(
              ride.pickupCoordinates,
              ride.dropoffCoordinates
            );
            tripDistance = leg?.distance?.text || "";
            tripDistancesMap[ride._id] = tripDistance;
          }

          results.push({
            ...ride,
            _distanceText: distanceText,
            _durationText: durationText,
            _distanceValue: parseDistance(distanceText),
          });

          await new Promise((res) => setTimeout(res, 300));
        }

        const sorted = results.sort(
          (a, b) => a._distanceValue - b._distanceValue
        );
        setPendingRides(sorted);
        setDistanceData(distancesMap);
        setTripDistances(tripDistancesMap);
        localStorage.setItem(
          "sortedRides",
          JSON.stringify(sorted.map((r) => r._id))
        );
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rides:", err);
        setError("Failed to fetch ride requests.");
        setLoading(false);
      }
    };

    if (driverCoords) fetchAndSortRides();
  }, [driverCoords]);

  const getDistance = (origin, destination) =>
    new Promise((resolve) => {
      if (!window.google?.maps) return resolve(null);

      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          travelMode: "DRIVING",
        },
        (result, status) => {
          if (status === "OK") {
            resolve(result.routes[0].legs[0]);
          } else {
            console.warn("Directions failed:", status);
            resolve(null);
          }
        }
      );
    });

  const drawRoute = (map, origin, destination) => {
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
    });
    directionsRenderer.setMap(map);

    directionsService.route(
      {
        origin,
        destination,
        travelMode: "DRIVING",
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
        } else {
          console.warn("Failed to draw route:", status);
        }
      }
    );
  };

  const handleToggleMap = (ride) => {
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
        title: "Your Location",
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });

      if (ride.pickupCoordinates) {
        new window.google.maps.Marker({
          position: ride.pickupCoordinates,
          map: gMap,
          title: "Pickup",
          icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        });
      }

      if (ride.dropoffCoordinates) {
        new window.google.maps.Marker({
          position: ride.dropoffCoordinates,
          map: gMap,
          title: "Dropoff",
          icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        });
      }

      if (ride.pickupCoordinates && ride.dropoffCoordinates) {
        drawRoute(gMap, ride.pickupCoordinates, ride.dropoffCoordinates);
      }
    }, 100);
  };

  const acceptRide = async (rideId) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    try {
      await axios.post(
        `http://localhost:5000/api/ride/accept/${rideId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      localStorage.removeItem("sortedRides");
      navigate(`/driver`);
    } catch (err) {
      console.error("Error accepting ride:", err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      {loading ? (
        <div className="text-center text-gray-500">Loading rides...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-6 max-w-4xl mx-auto">
          {pendingRides.length === 0 ? (
            <p className="text-gray-600 text-center">
              No pending ride requests.
            </p>
          ) : (
            pendingRides.map((ride) => (
              <div
                key={ride._id}
                className="bg-white rounded-2xl shadow-md p-6 transition hover:shadow-lg"
              >
                <div className="space-y-1 text-gray-800">
                  <p>
                    <span className="font-semibold">Pickup:</span>{" "}
                    {ride.pickupLocation}
                  </p>
                  <p>
                    <span className="font-semibold">Dropoff:</span>{" "}
                    {ride.dropoffLocation}
                  </p>
                  <p className="text-sm text-gray-500">
                    Requested by: {ride.user?.name} ({ride.user?.email})
                  </p>
                </div>

                {distanceData[ride._id] && (
                  <div className="text-sm text-gray-700 mt-3">
                    <p>
                      <span className="font-medium">Distance to Pickup:</span>{" "}
                      {distanceData[ride._id].distance}
                    </p>
                    <p>
                      <span className="font-medium">ETA:</span>{" "}
                      {distanceData[ride._id].duration}
                    </p>
                  </div>
                )}

                {tripDistances[ride._id] && (
                  <div className="text-sm text-gray-700 mt-1">
                    <p>
                      <span className="font-medium">Trip Distance:</span>{" "}
                      {tripDistances[ride._id]}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    disabled={acceptedRideExists}
                    onClick={() => acceptRide(ride._id)}
                    className={`${
                      acceptedRideExists
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white px-4 py-2 rounded transition`}
                  >
                    Accept Ride
                  </button>

                  <button
                    onClick={() => handleToggleMap(ride)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    {activeMapRideId === ride._id ? "Hide Map" : "Show Map"}
                  </button>
                </div>

                {activeMapRideId === ride._id && (
                  <div
                    ref={(el) => (mapRefs.current[ride._id] = el)}
                    className="mt-4 w-full h-64 rounded-xl border border-gray-300"
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RideRequests;
