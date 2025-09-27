import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import backgroundImage from './Login_Sign/photo.jpeg';
import { useAuth } from './context/AuthContext';
import Header from './ui/Header';
import AdminHeader from './ui/AdminHeader';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ✅ fix: keep only setters, ignore state value
  const [, setIsLoginModalOpen] = useState(false);
  const [, setIsSignUpModalOpen] = useState(false);

  const getButtonClass = (path: string) => {
    return `px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
      location.pathname.includes(path)
        ? 'bg-purple-600 text-white scale-105 shadow-lg'
        : 'bg-gray-800/60 text-gray-300 hover:bg-purple-500/50'
    }`;
  };

  if (user?.role === 'organizer') {
    return (
      <div
        className="relative min-h-screen font-sans text-gray-200 bg-cover bg-center bg-fixed"
        style={{
          fontFamily: "'Poppins', sans-serif",
          backgroundImage: `url(${backgroundImage})`
        }}
      >
        <div className="absolute inset-0 bg-black/70 z-0"></div>
        <AdminHeader />
        <main className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 p-8 rounded-lg">
              <Outlet /> {/* ✅ organizer nested routes */}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen font-sans text-gray-200 bg-cover bg-center bg-fixed"
      style={{
        fontFamily: "'Poppins', sans-serif",
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      <div className="absolute inset-0 bg-black/70 z-0"></div>
      <Header setIsLoginModalOpen={setIsLoginModalOpen} setIsSignUpModalOpen={setIsSignUpModalOpen} />

      <main className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* ✅ navigation buttons */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-12 backdrop-blur-md bg-gray-900/50 p-4 rounded-lg border border-purple-500/30">
            <button onClick={() => navigate('manage-events')} className={getButtonClass('manage-events')}>Manage Events</button>
            <button onClick={() => navigate('events-display')} className={getButtonClass('events-display')}>View Events</button>
            <button onClick={() => navigate('pending-experiences')} className={getButtonClass('pending-experiences')}>Pending Experiences</button>
            <button onClick={() => navigate('approved-experiences')} className={getButtonClass('approved-experiences')}>Approved Experiences</button>
            <button onClick={() => navigate('account-details')} className={getButtonClass('account-details')}>Account Details</button>
            <button onClick={() => navigate('view-registrations')} className={getButtonClass('view-registrations')}>View Registrations</button>
            <button onClick={() => navigate('registration-status')} className={getButtonClass('registration-status')}>Registration Status</button>
            <button onClick={() => navigate('update-winners')} className={getButtonClass('update-winners')}>Update Winners</button>
          </div>

          <div className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 p-8 rounded-lg">
            <Outlet /> {/* ✅ admin nested routes */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
