// src/pages/DriverPanel.jsx
import { useNavigate } from 'react-router-dom';

const DriverPanel = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Pending Ride Requests',
      description: 'View and accept pending ride requests.',
      onClick: () => navigate('/driver/ride-requests'),
    },
    {
      title: 'Accepted Ride Requests',
      description: 'Manage your accepted rides and update statuses.',
      onClick: () => navigate('/driver/accepted-rides'),
    },
    {
      title: 'Completed Ride Requests',
      description: 'View your completed ride history.',
      onClick: () => navigate('/driver/completed-rides'),
    },
    {
      title: 'Live Update Ongoing Rides',
      description: 'Send live location updates for your ongoing rides.',
      onClick: () => navigate('/driver/live-update'),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("userInfo"); // Clear user info from local storage// if applicable
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">Driver Dashboard</h1>
      <button
          onClick={handleLogout}
          className="px-4 py-2 my-5 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, idx) => (
          <div
          key={idx}
          role="button"
          onClick={card.onClick}
          className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
          tabIndex={0} // makes it keyboard-accessible too
          >
            <h2 className="text-2xl font-semibold mb-2">{card.title}</h2>
            <p className="text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverPanel;
