import React from 'react';
import { useLocation } from 'react-router-dom';

const RegistrationPage: React.FC = () => {
  const location = useLocation();
  const { user } = location.state || {}; // Get user from state

  if (!user) {
    // Handle case where user data is not available (e.g., direct access or refresh)
    return <div className="text-white">No user data available. Please log in.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Registration Page</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">User Details:</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        {user.name && <p><strong>Name:</strong> {user.name}</p>}
      </div>
      {/* Event details will be displayed here later */}
      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Event Details:</h2>
        <p>Event details will be provided soon.</p>
      </div>
    </div>
  );
};

export default RegistrationPage;
