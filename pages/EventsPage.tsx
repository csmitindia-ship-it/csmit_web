import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../ui/Header'; // Import the Header component
import backgroundImage from '../Login_Sign/photo.jpeg'; // Import background image
import LoginPage from '../Login_Sign/LoginPage'; // Import LoginPage
import SignUpPage from '../Login_Sign/SignUpPage'; // Import SignUpPage
import Loader from '../components/Loader'; // Import Loader component

interface Event {
  id: number;
  symposiumName: string;
  eventName: string;
  eventDescription: string;
  posterUrl?: string; // Add posterUrl
  registrationLink?: string; // Add registrationLink
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const location = useLocation();
  const [activeSymposium, setActiveSymposium] = useState<'Enigma' | 'Carteblanche'>('Enigma');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State for login modal
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false); // State for signup modal
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const fetchEvents = async () => {
    setIsLoading(true); // Set loading to true when fetch starts
    try {
      const response = await fetch('http://localhost:5001/events');
      const data: Event[] = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false); // Set loading to false when fetch completes (success or error)
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on activeSymposium state
  const filteredEvents = events.filter(event => event.symposiumName === activeSymposium);

  const handleSwitchToSignUp = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <div 
      className="relative min-h-screen font-sans text-gray-200 overflow-x-hidden" 
      style={{
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url(${backgroundImage})`
        }}
      ></div>

      {/* Overlay Layer */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <Header
        setIsLoginModalOpen={setIsLoginModalOpen}
        setIsSignUpModalOpen={setIsSignUpModalOpen}
      />

      {isLoading ? (
        <Loader />
      ) : (
        <div className="container mx-auto p-4 pt-20 relative z-10"> {/* Added pt-20 and relative z-10 */}
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Events</h2>

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

          {filteredEvents.length === 0 ? (
            <p className="text-center text-xl text-gray-400 mt-10">Events haven't started yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <div key={event.id} className="bg-gray-800/70 backdrop-blur-md p-6 rounded-lg border border-gray-700">
                  {event.posterUrl && (
<img
  src={`src/backend/${event.posterUrl}`}
  alt={event.eventName}
  className="w-full max-h-64 object-contain rounded-md mb-4"
/>
                )}
                  <h3 className="text-xl font-bold text-white mb-2">{event.eventName}</h3>
                  <p className="text-gray-400 mb-4">{event.symposiumName}</p>
                  <p className="text-gray-300">{event.eventDescription}</p>
                  {event.registrationLink && (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
                    >
                      Register Event
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <LoginPage 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSwitchToSignUp={handleSwitchToSignUp} 
        onSwitchToForgotPassword={() => {}} // Forgot password not implemented on EventsPage
      />
      <SignUpPage 
        isOpen={isSignUpModalOpen} 
        onClose={() => setIsSignUpModalOpen(false)} 
        onSwitchToLogin={handleSwitchToLogin} 
      />
    </div>
  );
};

export default EventsPage;