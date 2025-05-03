import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach JWT token if available
API.interceptors.request.use(
  (req) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    if (userInfo.token) {
      req.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Create a ride request
export const createRideRequest = (rideData) => API.post('/ride/request', rideData);

// Fetch user's ride requests
export const fetchMyRideRequests = () => API.get('/ride/my-requests');
