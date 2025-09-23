import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

interface Event {
  id: string; // Changed from number to string
  eventName: string;
  eventDate: string;
  lastDateForRegistration: string;
  symposiumName: string;
  // Add other event properties as needed
}

const AdminViewRegistrationsOverviewPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5001/events');
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleViewRegistrations = (eventId: string, symposiumName: string) => { // eventId type changed to string
    if (!eventId || !symposiumName) {
      console.error("Attempted to view registrations for an event with undefined ID or symposium name.");
      return;
    }
    navigate(`/admin/events/registrations/${eventId}?symposium=${symposiumName}`);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 pt-20">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          View Event Registrations
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-3 px-4 text-left">Event Name</th>
                <th className="py-3 px-4 text-left">Event Date</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-gray-700">
                  <td className="py-3 px-4">{event.eventName}</td>
                  <td className="py-3 px-4">{new Date(event.lastDateForRegistration).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleViewRegistrations(event.id, event.symposiumName)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                    >
                      View Registrations
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminViewRegistrationsOverviewPage;
