import React, { useState } from 'react';

interface WorkshopRegistrationFormProps {
  eventName: string;
  userName: string;
  userEmail: string;
  symposium: string;
  eventId: string;
  registrationFee: number;
}

const WorkshopRegistrationForm: React.FC<WorkshopRegistrationFormProps> = ({ eventName, userName, userEmail, symposium, eventId, registrationFee }) => {
  const [transactionId, setTransactionId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventName, userName, userEmail, symposium, eventId, transactionId }),
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('An error occurred during registration. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 bg-gray-800/80 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Register for {eventName}</h2>
      <div className="mb-4">
        <p><strong>Name:</strong> {userName}</p>
        <p><strong>Email:</strong> {userEmail}</p>
        <p><strong>Registration Fee:</strong> {registrationFee}</p>
      </div>
      <div className="mb-4">
        <label htmlFor="transactionId" className="block text-sm font-medium text-gray-400 mb-2">Transaction ID</label>
        <input 
          type="text" 
          id="transactionId"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
          required
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
        Register
      </button>
    </form>
  );
};

export default WorkshopRegistrationForm;