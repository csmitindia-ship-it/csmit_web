import React, { useState, useEffect, useRef } from 'react';

import Loader from '../components/Loader'; // Import Loader component

interface Round {
  roundNumber: number;
  roundDetails: string;
  roundDateTime: string;
}

interface Event {
  id: number;
  eventName: string;
  eventCategory: string;
  eventDescription: string;
  numberOfRounds: number;
  teamOrIndividual: 'Team' | 'Individual';
  location: string;
  registrationFees: number;
  coordinatorName: string;
  coordinatorContactNo: string;
  coordinatorMail: string;
  lastDateForRegistration: string;
  symposiumName: 'Enigma' | 'Carteblanche';
  rounds?: Round[]; // Optional, as it will be fetched separately
  posterUrl?: string; // Added for event poster
}

const AdminEventsDisplayPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeSymposium, setActiveSymposium] = useState<'Enigma' | 'Carteblanche'>('Enigma');
  const [showMenuForEventId, setShowMenuForEventId] = useState<number | null>(null);
  const [selectedEventForPoster, setSelectedEventForPoster] = useState<{ id: number; symposiumName: 'Enigma' | 'Carteblanche' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [registrationsVisibleForEventId, setRegistrationsVisibleForEventId] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const fetchEvents = async () => {
    setIsLoading(true); // Set loading to true when fetch starts
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => event.symposiumName === activeSymposium);

  const handleAddPosterClick = (eventId: number, symposiumName: 'Enigma' | 'Carteblanche') => {
    setSelectedEventForPoster({ id: eventId, symposiumName });
    setShowMenuForEventId(null); // Close the dropdown menu
    fileInputRef.current?.click(); // Directly trigger the file input
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && selectedEventForPoster) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('poster', file);
      formData.append('symposiumName', selectedEventForPoster.symposiumName); // Add symposiumName

      try {
        const response = await fetch(`http://localhost:5001/events/${selectedEventForPoster.id}/poster`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          alert('Poster uploaded successfully!');
          fetchEvents(); // Refresh events to show the new poster
        } else {
          alert('Failed to upload poster.');
        }
      } catch (error) {
        console.error('Error uploading poster:', error);
        alert('Error uploading poster.');
      }
      setSelectedEventForPoster(null);
      // Clear the file input to allow re-uploading the same file if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePoster = async (eventId: number, symposiumName: 'Enigma' | 'Carteblanche') => {
    try {
      const response = await fetch(`http://localhost:5001/events/${eventId}/poster`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symposiumName }),
      });
      if (response.ok) {
        alert('Poster removed successfully!');
        fetchEvents(); // Refresh events to update the display
      } else {
        alert('Failed to remove poster.');
      }
    } catch (error) {
      console.error('Error removing poster:', error);
      alert('Error removing poster.');
    }
    setShowMenuForEventId(null); // Close the dropdown menu
  };

  const handleDeleteEvent = async (eventId: number, symposiumName: 'Enigma' | 'Carteblanche') => {
    try {
      const response = await fetch(`http://localhost:5001/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symposiumName }),
      });
      if (response.ok) {
        alert('Event deleted successfully!');
        fetchEvents();
      } else {
        alert('Failed to delete event.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event.');
    }
  };

  const toggleRegistrations = (eventId: number) => {
    if (registrationsVisibleForEventId === eventId) {
      setRegistrationsVisibleForEventId(null);
    } else {
      setRegistrationsVisibleForEventId(eventId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      

      {isLoading ? (
        <Loader />
      ) : (
        <div className="container mx-auto p-4 pt-20"> {/* Added pt-20 to account for fixed header */}
          <h1 className="text-3xl font-bold text-white mb-6 text-center">All Events</h1>

          <div className="flex justify-center items-center gap-4 mb-8">
            <button
              onClick={() => setActiveSymposium('Enigma')}
              className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
                activeSymposium === 'Enigma'
                  ? 'bg-purple-600 text-white scale-105 shadow-lg'
                  : 'bg-gray-800/60 text-gray-300 hover:bg-purple-500/50'
              }`}
            >
              Enigma
            </button>
            <button
              onClick={() => setActiveSymposium('Carteblanche')}
              className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
                activeSymposium === 'Carteblanche'
                  ? 'bg-purple-600 text-white scale-105 shadow-lg'
                  : 'bg-gray-800/60 text-gray-300 hover:bg-purple-500/50'
              }`}
            >
              Carteblanche
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="relative bg-gray-900/70 p-5 rounded-lg border border-gray-700 shadow-lg">
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setShowMenuForEventId(showMenuForEventId === event.id ? null : event.id)}
                    className="text-gray-400 hover:text-white focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>
                  </button>
                  {showMenuForEventId === event.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                      <button
                        onClick={() => handleAddPosterClick(event.id, event.symposiumName)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Add Poster
                      </button>
                      <button
                        onClick={() => handleRemovePoster(event.id, event.symposiumName)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Remove Poster
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id, event.symposiumName)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Delete Event
                      </button>
                      <button
                        onClick={() => toggleRegistrations(event.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        {registrationsVisibleForEventId === event.id ? 'Hide Registrations' : 'View Registrations'}
                      </button>
                    </div>
                  )}
                </div>
                {event.posterUrl && (
                  <div className="mb-4">
                    <img src={event.posterUrl} alt="Event Poster" className="w-full h-48 object-cover rounded-md" />
                  </div>
                )}
                <h4 className="text-xl font-bold text-white mb-2">{event.eventName}</h4>
                <p className="text-gray-300 text-sm mb-3">{event.eventDescription}</p>
                <div className="text-gray-400 text-xs space-y-1">
                  <p><strong>Category:</strong> {event.eventCategory}</p>
                  <p><strong>Rounds:</strong> {event.numberOfRounds}</p>
                  <p><strong>Type:</strong> {event.teamOrIndividual}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Registration Fees:</strong> ${event.registrationFees}</p>
                  <p><strong>Coordinator:</strong> {event.coordinatorName} ({event.coordinatorContactNo})</p>
                  <p><strong>Coordinator Email:</strong> {event.coordinatorMail}</p>
                  <p><strong>Last Date for Registration:</strong> {new Date(event.lastDateForRegistration).toLocaleString()}</p>
                  {event.rounds && event.rounds.map((round, index) => (
                    <div key={index} className="ml-4 mt-2">
                      <p><strong>Round {round.roundNumber}:</strong> {round.roundDetails}</p>
                      <p>Date & Time: {new Date(round.roundDateTime).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                
              </div>
            ))}
          </div>

          {/* Hidden file input for direct trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
      )}
    </div>
  );
};

export default AdminEventsDisplayPage;