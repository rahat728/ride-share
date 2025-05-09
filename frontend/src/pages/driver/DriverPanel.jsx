// src/pages/DriverPanel.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RideRequests from './RideRequests';
import AcceptedRides from './AcceptedRides';
import CompletedRides from './CompletedRides';
import { Menu, X } from 'lucide-react';

const DriverPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Driver Dashboard</h1>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-4 items-center">
          <button
            onClick={() => setActiveTab('pending')}
            className={`text-sm font-medium px-3 py-2 rounded ${
              activeTab === 'pending' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`text-sm font-medium px-3 py-2 rounded ${
              activeTab === 'accepted' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`text-sm font-medium px-3 py-2 rounded ${
              activeTab === 'completed' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
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
              setActiveTab('pending');
              setIsMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded ${
              activeTab === 'pending' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => {
              setActiveTab('accepted');
              setIsMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded ${
              activeTab === 'accepted' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => {
              setActiveTab('completed');
              setIsMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 rounded ${
              activeTab === 'completed' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-200'
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

      {/* Content Area */}
      <div className="p-6">
        {activeTab === 'pending' && <RideRequests />}
        {activeTab === 'accepted' && <AcceptedRides />}
        {activeTab === 'completed' && <CompletedRides />}
      </div>
    </div>
  );
};

export default DriverPanel;
