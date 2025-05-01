import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRole }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (!userInfo || !userInfo.token) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo.user.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
