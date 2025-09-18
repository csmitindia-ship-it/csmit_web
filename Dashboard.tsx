import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.name || user?.email}!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;