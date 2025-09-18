import React, { useState, useEffect, useRef } from 'react';
import Header from '../ui/Header'; // Import the Header component
import Loader from '../components/Loader'; // Import Loader component

interface Event {
  id: number;
  eventName: string;
  eventDescription: string;
  eventCategory: string;
  eventOrganizer: string;
  startDate: string;
  endDate: string;
  timeZone: string;
  isRecurring: boolean;
  recurringInfo?: string;
  physicalAddress?: string;
  onlineLink?: string;
  registrationLink?: string;
  registrationDeadline: string;
  participationFee: number;
  registrationFees?: number;
  eligibilityCriteria?: string;
  maxParticipants?: number;
  coordinatorEmail: string;
  coordinatorPhone?: string;
  supportContact?: string;
  agenda?: string;
  speakers?: string;
  documents?: string;
  media?: string;
  eventType: 'Individual' | 'Team';
  teamSize?: number;
  symposiumName: 'Enigma' | 'Carteblanche';
  posterUrl?: string; // Added for event poster
}

const EventCountdown: React.FC<{ eventDate: string }> = ({ eventDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(eventDate) - +new Date();
    let timeLeft: { [key: string]: number } = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval]) {
      return;
    }

    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval]} {interval}{" "}
      </span>
    );
  });

  return (
    <div className="text-yellow-400 font-bold">
      {timerComponents.length ? timerComponents : <span>Event has passed!</span>}
    </div>
  );
};


const AdminEventsDisplayPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeSymposium, setActiveSymposium] = useState<'Enigma' | 'Carteblanche'>('Enigma');
  const [showMenuForEventId, setShowMenuForEventId] = useState<number | null>(null);
  const [selectedEventIdForPoster, setSelectedEventIdForPoster] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State for login modal
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false); // State for signup modal
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const fetchEvents = async () => {
    setIsLoading(true); // Set loading to true when fetch starts
    const dataPromise = fetch('http://localhost:5001/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        return data; // Pass data to the next promise
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        return []; // Return empty array on error to prevent breaking Promise.all
      });

    const timerPromise = new Promise(resolve => setTimeout(resolve, 3000)); // 3-second delay

    await Promise.all([dataPromise, timerPromise]);
    setIsLoading(false); // Set loading to false after both promises resolve
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => event.symposiumName === activeSymposium);

  const handleAddPosterClick = (eventId: number) => {
    setSelectedEventIdForPoster(eventId);
    setShowMenuForEventId(null); // Close the dropdown menu
    fileInputRef.current?.click(); // Directly trigger the file input
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && selectedEventIdForPoster) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('poster', file);

      try {
        const response = await fetch(`http://localhost:5001/events/${selectedEventIdForPoster}/poster`, {
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
      setSelectedEventIdForPoster(null);
      // Clear the file input to allow re-uploading the same file if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePoster = async (eventId: number) => {
    try {
      const response = await fetch(`http://localhost:5001/events/${eventId}/poster`, {
        method: 'DELETE',
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header
        setIsLoginModalOpen={setIsLoginModalOpen}
        setIsSignUpModalOpen={setIsSignUpModalOpen}
      />

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
                {console.log(`Event ID: ${event.id}, Poster URL: ${event.posterUrl}`)}
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
                        onClick={() => handleAddPosterClick(event.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Add Poster
                      </button>
                      <button
                        onClick={() => handleRemovePoster(event.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Remove Poster
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
                  <p><strong>Organizer:</strong> {event.eventOrganizer}</p>
                  <p><strong>Date:</strong> {new Date(event.startDate).toLocaleString()}</p>
                  <p><strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleString()}</p>
                  <p><strong>Fee:</strong> ${event.participationFee}</p>
                  <p><strong>Type:</strong> {event.eventType}</p>
                  {event.eventType === 'Team' && <p><strong>Team Size:</strong> {event.teamSize}</p>}
                </div>
                <div className="mt-4">
                  <EventCountdown eventDate={event.startDate} />
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