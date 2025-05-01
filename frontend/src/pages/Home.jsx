import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TripLiveTracking from "../components/TripLiveTracking";
import { connectTestSocket, listenForDriverLocation } from "../testSocket"; // Import necessary functions

const Home = () => {
  const [rideRequests, setRideRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [trackingRideId, setTrackingRideId] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null); // To store driver's real-time location

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    setUser(userInfo);
    console.log("User info:", userInfo);

    // Connect to socket on page load
    if (userInfo?.token) {
      connectTestSocket(userInfo.token); // 🧠 Connect with valid token!
    }

    const fetchRides = async () => {
      try {
        const { data } = await axios.get("/api/ride/my-requests", {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        setRideRequests(data);
        console.log("Fetched ride requests:", data);
      } catch (error) {
        console.error("Error fetching ride requests", error);
      }
    };

    if (userInfo) {
      fetchRides();
    }
  }, []);

  // Handle tracking of the ride
  const handleTrackRide = (rideId) => {
    setTrackingRideId(rideId);
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
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Request New Ride
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">My Ride Requests</h2>

          {rideRequests.length === 0 ? (
            <p className="text-gray-500">No ride requests yet.</p>
          ) : (
            <div className="space-y-4">
              {rideRequests.map((ride) => (
                <div
                  key={ride._id}
                  className="p-4 border rounded-lg hover:shadow-md transition"
                >
                  <p>
                    <strong>Pickup:</strong> {ride.pickupLocation}
                  </p>
                  <p>
                    <strong>Dropoff:</strong> {ride.dropoffLocation}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${
                        ride.status === "pending"
                          ? "text-yellow-500"
                          : ride.status === "accepted"
                          ? "text-green-500"
                          : "text-red-500"
                      } font-semibold`}
                    >
                      {ride.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Requested at: {new Date(ride.createdAt).toLocaleString()}
                  </p>

                  {ride.status === "accepted" && (
                    <button
                      onClick={() => handleTrackRide(ride._id)}
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
