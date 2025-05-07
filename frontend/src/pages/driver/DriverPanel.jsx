// src/pages/DriverPanel.jsx
import RideRequests from './RideRequests';
import AcceptedRides from './AcceptedRides';
import CompletedRides from './CompletedRides';

import { useNavigate } from 'react-router-dom';

const DriverPanel = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="space-y-10">
        <section>

          <RideRequests />
        </section>

        <section>
          <AcceptedRides />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Completed Rides</h2>
          <CompletedRides />
        </section>


      </div>
    </div>
  );
};

export default DriverPanel;
