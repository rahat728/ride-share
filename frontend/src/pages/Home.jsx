import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TripLiveTracking from "../components/TripLiveTracking";
import { connectTestSocket, listenForDriverLocation } from "../testSocket"; // Import necessary functions

const Home = () => {
  const [user, setUser] = useState(null);
  const [trackingRideId, setTrackingRideId] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null); // To store driver's real-time location

  const navigate = useNavigate();
  const [activeRides, setActiveRides] = useState([]);
  const [completedRides, setCompletedRides] = useState([]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (userInfo?.token) {
      connectTestSocket(userInfo.token);
    }

    const fetchRides = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/trips/my-trips",
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        console.log("Fetched rides:", data);
        const active = data.filter((ride) => ride.status !== "completed");
        const completed = data.filter((ride) => ride.status === "completed");

        setActiveRides(active);
        setCompletedRides(completed);
      } catch (error) {
        console.error("Error fetching ride requests", error);
      }
    };

    if (userInfo) fetchRides();
  }, []);

  // Handle tracking of the ride
  const handleTrackRide = (rideId) => {
    setTrackingRideId(rideId);
    console.log("Tracking trip ID:", rideId);

    // Listen for driver location updates once tracking begins
    listenForDriverLocation(rideId, (location) => {
      setDriverLocation(location); // Update the driver's location
      console.log("Driver location received:", location);
    });
  };

  const handleRequestRide = () => {
    navigate("/request-ride");
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo"); // Clear user info from local storage
    localStorage.removeItem("token"); // if stored separately
    localStorage.removeItem("role"); // if applicable
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Welcome, {user?.user.name || "User"}!
        </h1>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleRequestRide}
            disabled={activeRides.length > 0}
            className={`px-6 py-2 text-white rounded transition ${
              activeRides.length > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {activeRides.length > 0
              ? "Finish Current Ride First"
              : "Request New Ride"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-semibold mb-4">Active Ride Requests</h2>

          {activeRides.length === 0 ? (
            <p className="text-gray-500">No active ride requests.</p>
          ) : (
            <div className="space-y-4">
              {activeRides.map((ride) => (
                <div
                  key={ride._id}
                  className="p-4 border rounded-lg hover:shadow-md transition"
                >
                  <p>
                    <strong>Pickup:</strong> {ride.rideRequest?.pickupLocation}
                  </p>
                  <p>
                    <strong>Dropoff:</strong>{" "}
                    {ride.rideRequest?.dropoffLocation}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        ride.status === "pending"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {ride.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Requested at: {new Date(ride.createdAt).toLocaleString()}
                  </p>

                  {["accepted", "arrived", "in_progress"].includes(
                    ride.status
                  ) && (
                    <button
                      onClick={() => handleTrackRide(ride.rideRequest?._id)}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Track Ride
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Rides */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Completed Rides</h2>

          {completedRides.length === 0 ? (
            <p className="text-gray-500">No completed rides yet.</p>
          ) : (
            <div className="space-y-4">
              {completedRides.map((ride) => (
                <div
                  key={ride._id}
                  className="p-4 border rounded-lg bg-gray-50"
                >
                  <p>
                    <strong>Pickup:</strong> {ride.rideRequest?.pickupLocation}
                  </p>
                  <p>
                    <strong>Dropoff:</strong>{" "}
                    {ride.rideRequest?.dropoffLocation}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="text-blue-600 font-semibold">
                      Completed
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Completed at: {new Date(ride.updatedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {trackingRideId && (
          <div className="mt-8">
            <TripLiveTracking
              tripId={trackingRideId}
              driverLocation={driverLocation}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
