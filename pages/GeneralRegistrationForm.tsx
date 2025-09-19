import React from 'react';

interface GeneralRegistrationFormProps {
  eventName: string;
  userName: string;
  userEmail: string;
  symposium: string;
  eventId: string;
}

const GeneralRegistrationForm: React.FC<GeneralRegistrationFormProps> = ({ eventName, userName, userEmail, symposium, eventId }) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventName, userName, userEmail, symposium, eventId }),
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
      </div>
      <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
        Register
      </button>
    </form>
  );
};

export default GeneralRegistrationForm;