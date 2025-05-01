import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectLogic = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo?.token) {
      switch (userInfo.user?.role) {
        case 'user':
          navigate('/home');
          break;
        case 'driver':
          navigate('/driver');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/unauthorized');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null; // This component only redirects
};

export default RedirectLogic;
