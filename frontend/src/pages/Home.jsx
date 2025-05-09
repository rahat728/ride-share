import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import TripLiveTracking from "../components/TripLiveTracking";
import ActiveRides from "./user/ActiveRides";
import CompletedRides from "./user/CompletedRides";
import { connectTestSocket, listenForDriverLocation } from "../testSocket";

const Home = () => {
  const [user, setUser] = useState(null);
  const [trackingRideId, setTrackingRideId] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        const headers = { Authorization: `Bearer ${userInfo.token}` };
        const { data: myTrips } = await axios.get("http://localhost:5000/api/trips/my-trips", { headers });

        const activeTrips = myTrips.filter((ride) => ride.status !== "completed");
        const completedTrips = myTrips.filter((ride) => ride.status === "completed");

        const { data: pendingRides } = await axios.get("http://localhost:5000/api/ride/pending", { headers });

        const pendingMapped = pendingRides.map((ride) => ({
          _id: ride._id,
          status: "pending",
          createdAt: ride.createdAt,
          rideRequest: {
            pickupLocation: ride.pickupLocation,
            dropoffLocation: ride.dropoffLocation,
            _id: ride._id,
          },
        }));

        setActiveRides([...pendingMapped, ...activeTrips]);
        setCompletedRides(completedTrips);
      } catch (error) {
        console.error("Error fetching ride data", error);
      }
    };

    if (userInfo) fetchRides();
  }, []);

  const handleTrackRide = (rideId) => {
    setTrackingRideId(rideId);
    listenForDriverLocation(rideId, (location) => {
      setDriverLocation(location);
    });
  };

  const handleRequestRide = () => {
    navigate("/request-ride");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">RideShare</h1>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-4 items-center">
          <button
            onClick={() => setActiveTab("active")}
            className={`text-sm font-medium px-3 py-2 rounded ${
              activeTab === "active" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`text-sm font-medium px-3 py-2 rounded ${
              activeTab === "completed" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow px-6 py-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab("active");
              setIsMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded ${
              activeTab === "active" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => {
              setActiveTab("completed");
              setIsMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded ${
              activeTab === "completed" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleRequestRide}
            disabled={activeRides.length > 0}
            className={`px-6 py-2 text-white rounded transition ${
              activeRides.length > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {activeRides.length > 0 ? "Finish Current Ride First" : "Request New Ride"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          {activeTab === "active" ? (
            <ActiveRides rides={activeRides} onTrackRide={handleTrackRide} />
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4">Completed Rides</h2>
              <CompletedRides rides={completedRides} />
            </>
          )}
        </div>

        {trackingRideId && (
          <div className="mt-8">
            <TripLiveTracking tripId={trackingRideId} driverLocation={driverLocation} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
