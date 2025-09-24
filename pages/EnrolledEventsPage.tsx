import React, { useEffect, useState } from 'react';
import Header from '../ui/Header';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import backgroundImage from '../Login_Sign/photo.jpeg';

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
}

const EnrolledEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchEnrolledEvents = async () => {
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/registrations/verified/${user.id}`);
        const data: Event[] = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching enrolled events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchEnrolledEvents();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, user]);

  if (isLoading || authLoading) {
    return <Loader />;
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
        <p>You need to be logged in to view your enrolled events.</p>
      </div>
    );
  }

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

      <Header setIsLoginModalOpen={() => {}} setIsSignUpModalOpen={() => {}} />
      <main className="relative z-10 pt-16">
        <div className="container mx-auto p-4 pt-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">My Enrolled Events</h2>
          {events.length === 0 ? (
            <p className="text-center text-xl text-gray-400 mt-10">You have not enrolled in any events yet, or none of your registrations have been verified.</p>
          ) : (
            <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="relative group overflow-hidden rounded-xl shadow-lg border border-gray-700 bg-gray-800/70 backdrop-blur-md w-full sm:w-96"
                >
                  <div className="relative z-10 p-6 flex flex-col h-full">
                    {event.posterUrl && (
                      <div className="mb-4">
                        <img
                          src={`http://localhost:5001${event.posterUrl}`}
                          alt={event.eventName}
                          className="w-full h-48 object-cover rounded-md mx-auto shadow-md"
                        />
                      </div>
                    )}
                    <h3 className="text-2xl font-extrabold text-white mb-1 leading-tight">{event.eventName}</h3>
                    <p className="text-purple-300 text-sm font-medium mb-3">{event.eventCategory}</p>
                    <p className="text-gray-300 text-base mb-4 flex-grow">{event.eventDescription.substring(0, 100)}...</p>
                    <Link to={`/events`}>
                      <button className="mt-4 inline-block px-4 py-2 font-semibold rounded-lg transition bg-purple-600 text-white hover:bg-purple-700">
                        View Event Details
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EnrolledEventsPage;
