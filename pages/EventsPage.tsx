import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../ui/Header'; 
import backgroundImage from '../Login_Sign/photo.jpeg'; 
import LoginPage from '../Login_Sign/LoginPage'; 
import SignUpPage from '../Login_Sign/SignUpPage'; 
import Loader from '../components/Loader'; 
import { useAuth } from '../context/AuthContext'; 

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
  rounds?: Round[];
  posterUrl?: string; 
  registrationLink?: string;
}

const EventsPage: React.FC = () => {
  console.log('EventsPage: Component rendered.');
  const [events, setEvents] = useState<Event[]>([]);
  const [activeSymposium, setActiveSymposium] = useState<'Enigma' | 'Carteblanche'>('Enigma');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setIsLoading(true);
    console.log('EventsPage: Fetching events...');
    try {
      const response = await fetch('http://localhost:5001/events');
      const data: Event[] = await response.json();
      setEvents(data);
      console.log('EventsPage: Events fetched successfully.', data);
    } catch (error) {
      console.error('EventsPage: Error fetching events:', error);
    } finally {
      setIsLoading(false);
      console.log('EventsPage: Finished fetching events.');
    }
  };

  useEffect(() => {
    console.log('EventsPage: useEffect - initial render or dependency change.');
    fetchEvents();
  }, []);

  console.log('EventsPage: Current state - isLoading:', isLoading, 'authLoading:', authLoading, 'isLoggedIn:', isLoggedIn, 'user:', user);

  const filteredEvents = events
    .filter(event => event.symposiumName === activeSymposium)
    .sort((a, b) => a.eventCategory.localeCompare(b.eventCategory));

  const handleSwitchToSignUp = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleRegisterClick = (event: Event) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
    } else {
      // For now, assuming any logged-in user can register.
      // In a real application, you might want to check for a "student" role or email domain.
      console.log(`User ${user?.email} is logged in. Proceeding to registration for event ${event.eventName}`);
      navigate('/registration', { state: { user, event } }); // Navigate to a registration page with user and event details
    }
  };

  return (
    <div 
      className="relative min-h-screen font-sans text-gray-200 overflow-x-hidden" 
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>

      {/* Overlay Layer */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <Header
        setIsLoginModalOpen={setIsLoginModalOpen}
        setIsSignUpModalOpen={setIsSignUpModalOpen}
      />

      {isLoading || authLoading ? (
        <Loader />
      ) : (
        <div className="container mx-auto p-4 pt-20 relative z-10">
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
                  <button
                    onClick={() => handleRegisterClick(event)}
                    className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
                  >
                    Register Event
                  </button>
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
        onSwitchToForgotPassword={() => {}}
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
