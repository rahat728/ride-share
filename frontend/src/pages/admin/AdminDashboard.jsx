import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-10 text-center">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Users Card */}
        <Link
          to="/admin/users"
          className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300"
        >
          <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
          <p className="text-gray-500 text-sm text-center">View all registered users, drivers, and admins</p>
        </Link>

        {/* Rides Card */}
        <Link
          to="/admin/rides"
          className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300"
        >
          <h2 className="text-xl font-semibold mb-4">Ride Requests</h2>
          <p className="text-gray-500 text-sm text-center">Monitor all incoming ride requests</p>
        </Link>

        {/* Trips Card */}
        <Link
          to="/admin/trips"
          className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center justify-center hover:scale-105 transition-transform duration-300"
        >
          <h2 className="text-xl font-semibold mb-4">Trips History</h2>
          <p className="text-gray-500 text-sm text-center">View all completed and active trips</p>
        </Link>

      </div>
    </div>
  );
};

export default AdminDashboard;
