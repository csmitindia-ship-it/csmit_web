import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gray-900/70 backdrop-blur-md border-b border-purple-500/30 text-white p-4 flex justify-between items-center sticky top-0 z-20">
      <h1 className="text-xl font-bold">
        {user?.role === 'admin' ? 'Admin Dashboard' : `Organizer Dashboard`}
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-sm">Welcome, {user?.name || user?.email}</span>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          <FiLogOut className="mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;