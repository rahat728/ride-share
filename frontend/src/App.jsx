import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import RideRequestPage from './pages/RideRequestPage';
import DriverPanel from './pages/driver/DriverPanel';
import Home from './pages/Home';
import PrivateRoute from './components/PrivateRoute';
import Unauthorized from './pages/Unauthorized'; 
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersList from './pages/admin/UserList';
import RideList from './pages/admin/RideList';
import TripList from './pages/admin/TripList';
import RideRequests from './pages/driver/RideRequests';
import AcceptedRides from './pages/driver/AcceptedRides';
import CompletedRides from './pages/driver/CompletedRides';
import DriverLiveUpdate from './components/DriverLiveUpdate';
import RedirectLogic from './pages/RedirectLogic';


function App() {
  return (
    <Router>

      <Routes>
      <Route path="/" element={<RedirectLogic />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute allowedRole="user" />}>
          <Route path="/home" element={<Home />} />
          <Route path="/request-ride" element={<RideRequestPage />} />
        </Route>

        <Route element={<PrivateRoute allowedRole="driver" />}>
          <Route path="/driver" element={<DriverPanel />} />
          <Route path="/driver/ride-requests" element={<RideRequests />} />
          <Route path="/driver/accepted-rides" element={<AcceptedRides />} />
          <Route path="/driver/completed-rides" element={<CompletedRides />} />
          <Route path="/driver/live-update" element={<DriverLiveUpdate />} />
        </Route>

        <Route element={<PrivateRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersList />} />
          <Route path="/admin/rides" element={<RideList />} />
          <Route path="/admin/trips" element={<TripList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
