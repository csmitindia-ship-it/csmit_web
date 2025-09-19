import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../ui/Header'; 
import backgroundImage from '../Login_Sign/photo.jpeg'; 
import LoginPage from '../Login_Sign/LoginPage'; 
import SignUpPage from '../Login_Sign/SignUpPage'; 
import Loader from '../components/Loader'; 
import { useAuth } from '../context/AuthContext'; 
import ThemedModal from '../components/ThemedModal'; 

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
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [eventCategories, setEventCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null); // New state for selected event

  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

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

  const fetchRegisteredEvents = async () => {
    if (user) {
      try {
        const response = await fetch(`http://localhost:5001/registrations/${user.email}`);
        const data = await response.json();
        setRegisteredEvents(data.map((reg: any) => reg.eventId));
      } catch (error) {
        console.error('Error fetching registered events:', error);
      }
    }
  };

  useEffect(() => {
    console.log('EventsPage: useEffect - initial render or dependency change.');
    fetchEvents();
    if (isLoggedIn) {
      fetchRegisteredEvents();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Filter events by activeSymposium to get relevant categories
    const symposiumFilteredEvents = events.filter(event => event.symposiumName === activeSymposium);

    if (symposiumFilteredEvents.length > 0) {
      const categories = Array.from(new Set(symposiumFilteredEvents.map(event => event.eventCategory)));
      setEventCategories(categories);
      // Only set activeCategory if the current activeCategory is not in the new list
      // or if there was no activeCategory before.
      if (!activeCategory || !categories.includes(activeCategory)) {
        setActiveCategory(categories[0] || null);
      }
    } else {
      // If no events for the active symposium, clear categories and activeCategory
      setEventCategories([]);
      setActiveCategory(null);
    }
  }, [events, activeSymposium]); // Add activeSymposium to dependencies

  console.log('EventsPage: Current state - isLoading:', isLoading, 'authLoading:', authLoading, 'isLoggedIn:', isLoggedIn, 'user:', user);

  const filteredEvents = events
    .filter(event => event.symposiumName === activeSymposium)
    .filter(event => activeCategory ? event.eventCategory === activeCategory : true)
    .sort((a, b) => a.eventCategory.localeCompare(b.eventCategory));

  const handleSwitchToSignUp = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleRegisterClick = async (event: Event) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
    } else if (event.symposiumName === 'Enigma' && event.eventCategory !== 'Workshop') {
      if (registeredEvents.includes(event.id)) {
        return; // Already registered
      }
      if (window.confirm(`Do you want to register for ${event.eventName}?`)) {
        try {
          const response = await fetch('http://localhost:5001/registrations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userEmail: user?.email, eventId: event.id }),
          });
          if (response.ok) {
            setRegisteredEvents([...registeredEvents, event.id]);
            setSelectedEvent(null); // Ensure selectedEvent is null for message modal
            setModalContent({ title: 'Success', message: 'Successfully registered!' });
            setIsModalOpen(true);
          } else {
            setSelectedEvent(null); // Ensure selectedEvent is null for message modal
            setModalContent({ title: 'Error', message: 'Registration failed.' });
            setIsModalOpen(true);
          }
        } catch (error) {
          console.error('Registration error:', error);
          setSelectedEvent(null); // Ensure selectedEvent is null for message modal
          setModalContent({ title: 'Error', message: 'An error occurred during registration.' });
          setIsModalOpen(true);
        }
      }
    } else {
      navigate(`/registration?eventId=${event.id}&symposium=${event.symposiumName}`);
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

          {eventCategories.length > 0 && (
            <div className="flex flex-wrap justify-center border-b border-gray-700 mb-8">
              {eventCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3 text-sm font-medium transition ${
                    activeCategory === category
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-400 hover:text-purple-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <p className="text-center text-xl text-gray-400 mt-10">Events haven't started yet.</p>
          ) : (
<div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-800/70 backdrop-blur-md p-6 rounded-lg border border-gray-700 text-center cursor-pointer hover:border-purple-500 transition-all duration-300 w-full sm:w-96"
                  onClick={() => handleViewDetails(event)}
                >
                  {event.posterUrl && (
                    <img
                      src={`src/backend/${event.posterUrl}`}
                      alt={event.eventName}
                      className="w-full max-h-64 object-contain rounded-md mb-4 mx-auto"
                    />
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{event.eventName}</h3>
                  <p className="text-gray-400 text-sm mb-2">{event.eventCategory}</p>
                  <p className="text-gray-300 text-sm mb-4">{event.eventDescription.substring(0, 100)}...</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRegisterClick(event); }}
                    disabled={registeredEvents.includes(event.id)}
                    className={`mt-4 inline-block px-4 py-2 font-semibold rounded-lg transition ${
                      registeredEvents.includes(event.id)
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {registeredEvents.includes(event.id) ? 'Registered' : 'Register Event'}
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

      {/* Single ThemedModal instance for both event details and general messages */}
      <ThemedModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null); // Clear selected event when modal closes
          setModalContent({ title: '', message: '' }); // Clear modal content
        }}
        title={selectedEvent ? selectedEvent.eventName : modalContent.title}
      >
        {selectedEvent ? (
          // Content for event details
          <div className="text-left max-h-[70vh] overflow-y-auto pr-2 p-4 bg-gray-700/30 rounded-lg shadow-inner">
            {selectedEvent.posterUrl && (
              <div className="mb-6">
                <img
                  src={`src/backend/${selectedEvent.posterUrl}`}
                  alt={selectedEvent.eventName}
                  className="w-full max-h-80 object-contain rounded-lg shadow-md mx-auto"
                />
              </div>
            )}

            <h3 className="text-2xl font-bold text-white mb-4 border-b border-gray-600 pb-2">{selectedEvent.eventName}</h3>

            <div className="space-y-3 mb-6">
              <p className="text-gray-200 text-lg"><strong className="text-purple-300">Category:</strong> {selectedEvent.eventCategory}</p>
              <p className="text-gray-300 leading-relaxed"><strong className="text-purple-300">Description:</strong> {selectedEvent.eventDescription}</p>
              <div className="grid grid-cols-2 gap-y-2">
                <p className="text-gray-200"><strong className="text-purple-300">Rounds:</strong> {selectedEvent.numberOfRounds}</p>
                <p className="text-gray-200"><strong className="text-purple-300">Type:</strong> {selectedEvent.teamOrIndividual}</p>
                <p className="text-gray-200"><strong className="text-purple-300">Location:</strong> {selectedEvent.location}</p>
                <p className="text-gray-200"><strong className="text-purple-300">Fees:</strong> ₹{selectedEvent.registrationFees}</p>
                <p className="text-gray-200 col-span-2"><strong className="text-purple-300">Last Date:</strong> {new Date(selectedEvent.lastDateForRegistration).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mb-6 border-t border-gray-600 pt-4">
              <h4 className="text-xl font-semibold text-white mb-3">Coordinator Details:</h4>
              <p className="text-gray-200"><strong className="text-purple-300">Name:</strong> {selectedEvent.coordinatorName}</p>
              <p className="text-gray-200"><strong className="text-purple-300">Contact:</strong> {selectedEvent.coordinatorContactNo}</p>
              <p className="text-gray-200"><strong className="text-purple-300">Email:</strong> {selectedEvent.coordinatorMail}</p>
            </div>

            {selectedEvent.rounds && selectedEvent.rounds.length > 0 && (
              <div className="mb-6 border-t border-gray-600 pt-4">
                <h4 className="text-xl font-semibold text-white mb-3">Rounds:</h4>
                <div className="space-y-3">
                  {selectedEvent.rounds.map((round, index) => (
                    <div key={index} className="p-3 bg-gray-800/50 rounded-md border border-gray-600">
                      <p className="text-gray-200 font-medium"><strong>Round {round.roundNumber}:</strong> {round.roundDetails}</p>
                      <p className="text-gray-400 text-sm mt-1">Date/Time: {new Date(round.roundDateTime).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedEvent.registrationLink && (
              <div className="text-center mt-6 border-t border-gray-600 pt-4">
                <a
                  href={selectedEvent.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  External Registration Link
                </a>
              </div>
            )}
          </div>
        ) : (
          // Content for general messages
          <p className="text-gray-300 mb-6">{modalContent.message}</p>
        )}
      </ThemedModal>
    </div>
  );

  
};

export default EventsPage;
