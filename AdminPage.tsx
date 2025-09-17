import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import backgroundImage from './Login_Sign/photo.jpeg';
import Header from './ui/Header';

type AdminTab = 'manage-events' | 'pending-experiences' | 'approved-experiences';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getButtonClass = (path: string) => {
    return `px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
      location.pathname.includes(path)
        ? 'bg-purple-600 text-white scale-105 shadow-lg'
        : 'bg-gray-800/60 text-gray-300 hover:bg-purple-500/50'
    }`;
  };

  return (
    <div
      className="relative min-h-screen font-sans text-gray-200 bg-cover bg-center bg-fixed"
      style={{
        fontFamily: "'Poppins', sans-serif",
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      <div className="absolute inset-0 bg-black/70 z-0"></div>
      <Header
        setIsLoginModalOpen={() => {}}
        setIsSignUpModalOpen={() => {}}
      />
      <main className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">Admin Dashboard</h1>

          <div className="flex justify-center items-center gap-4 mb-12 backdrop-blur-md bg-gray-900/50 p-4 rounded-lg border border-purple-500/30">
            <button
              onClick={() => navigate('manage-events')}
              className={getButtonClass('manage-events')}
            >
              Manage Events
            </button>
            <button
              onClick={() => navigate('pending-experiences')}
              className={getButtonClass('pending-experiences')}
            >
              Pending Experiences
            </button>
            <button
              onClick={() => navigate('approved-experiences')}
              className={getButtonClass('approved-experiences')}
            >
              Approved Experiences
            </button>
          </div>

          <div className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 p-8 rounded-lg">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;