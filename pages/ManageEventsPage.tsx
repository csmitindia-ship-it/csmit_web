import React, { useState, useEffect } from 'react';
import ThemedModal from '../components/ThemedModal';
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
  posterUrl?: string; // Add posterUrl field
  rounds?: Round[]; // Optional, as it will be fetched separately
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


const ManageEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeSymposium, setActiveSymposium] = useState<'Enigma' | 'Carteblanche'>('Enigma');
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    eventCategory: '',
    eventDescription: '',
    numberOfRounds: 1, // Default to 1 round
    teamOrIndividual: 'Individual', // Default to Individual
    location: '',
    registrationFees: 0,
    coordinatorName: '',
    coordinatorContactNo: '',
    coordinatorMail: '',
    lastDateForRegistration: '',
  });

  const [rounds, setRounds] = useState<Round[]>([
    { roundNumber: 1, roundDetails: '', roundDateTime: '' }
  ]);

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | undefined>(undefined);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/events');
      const data = await response.json();
      console.log('Fetched events data:', data);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const valueToSet = type === 'number' ? parseInt(value, 10) : (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, [name]: valueToSet });
    } else {
      setNewEvent(prev => ({ ...prev, [name]: valueToSet }));
    }
  };

  const handleRoundChange = (index: number, field: keyof Round, value: string | number) => {
    const updatedRounds = rounds.map((round, i) =>
      i === index ? { ...round, [field]: value } : round
    );
    setRounds(updatedRounds);
  };

  const handleNumberOfRoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    setNewEvent(prev => ({ ...prev, numberOfRounds: num }));
    setRounds(prevRounds => {
      const newRounds = [];
      for (let i = 0; i < num; i++) {
        newRounds.push(prevRounds[i] || { roundNumber: i + 1, roundDetails: '', roundDateTime: '' });
      }
      return newRounds;
    });
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = editingEvent ? 
      { ...editingEvent, rounds: rounds } : 
      { ...newEvent, symposiumName: activeSymposium, rounds: rounds };
    
    // Remove old fields that are no longer part of the schema
    if (!editingEvent) {
      delete (eventData as any).startDate;
      delete (eventData as any).endDate;
      delete (eventData as any).timeZone;
      delete (eventData as any).isRecurring;
      delete (eventData as any).recurringInfo;
      delete (eventData as any).physicalAddress;
      delete (eventData as any).onlineLink;
      delete (eventData as any).registrationLink;
      delete (eventData as any).registrationDeadline;
      delete (eventData as any).participationFee;
      delete (eventData as any).eligibilityCriteria;
      delete (eventData as any).maxParticipants;
      delete (eventData as any).coordinatorEmail;
      delete (eventData as any).coordinatorPhone;
      delete (eventData as any).supportContact;
      delete (eventData as any).agenda;
      delete (eventData as any).speakers;
      delete (eventData as any).eventType;
      delete (eventData as any).teamSize;
      delete (eventData as any).eventTags;
      delete (eventData as any).eventRules;
      delete (eventData as any).socialMediaLinks;
      delete (eventData as any).sponsors;
      delete (eventData as any).notes;
      delete (eventData as any).eventStatus;
    }

    const url = editingEvent ? `http://localhost:5001/events/${editingEvent.id}` : 'http://localhost:5001/events';
    const method = editingEvent ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    })
      .then(res => res.json())
      .then(() => {
        fetchEvents();
        setNewEvent({
          eventName: '',
          eventCategory: '',
          eventDescription: '',
          numberOfRounds: 1,
          teamOrIndividual: 'Individual',
          location: '',
          registrationFees: 0,
          coordinatorName: '',
          coordinatorContactNo: '',
          coordinatorMail: '',
          lastDateForRegistration: '',
        });
        setRounds([{ roundNumber: 1, roundDetails: '', roundDateTime: '' }]);
        setEditingEvent(null);
        setModalTitle('Success');
        setModalMessage(`Event ${editingEvent ? 'updated' : 'added'} successfully!`);
        setShowConfirmButton(false);
        setIsModalOpen(true);
      })
      .catch(err => {
        console.error('Error saving event:', err);
        setModalTitle('Error');
        setModalMessage('Failed to save event.');
        setShowConfirmButton(false);
        setIsModalOpen(true);
      });
  };

  const handleDeleteEvent = (id: number) => {
    setModalTitle('Confirm Deletion');
    setModalMessage('Are you sure you want to delete this event?');
    setModalOnConfirm(() => async () => {
      try {
        const url = `http://localhost:5001/events/${id}`;
        const method = 'DELETE';
        const symposiumName = editingEvent?.symposiumName || activeSymposium; // Get symposiumName

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symposiumName }), // Send symposiumName in body
        });

        if (response.ok) {
          fetchEvents();
          setModalTitle('Success');
          setModalMessage('Event deleted successfully!');
          setShowConfirmButton(false);
          setIsModalOpen(true);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete event.');
        }
      } catch (err) {
        console.error('Error deleting event:', err);
        setModalTitle('Error');
        setModalMessage(`Failed to delete event: ${err}`);
        setShowConfirmButton(false);
        setIsModalOpen(true);
      }
    });
    setShowConfirmButton(true);
    setIsModalOpen(true);
  };

  const filteredEvents = events.filter(event => event.symposiumName === activeSymposium);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">{editingEvent ? 'Edit' : 'Add'} Event</h3>
              <form onSubmit={handleSaveEvent} className="space-y-6">
                {/* Basic Event Information */}
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-xl font-bold text-white mb-4">Basic Event Information</h4>
                  <input
                    type="text"
                    name="eventName"
                    value={editingEvent ? editingEvent.eventName : newEvent.eventName}
                    onChange={handleInputChange}
                    placeholder="Event Name / Title"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  <textarea
                    name="eventDescription"
                    value={editingEvent ? editingEvent.eventDescription : newEvent.eventDescription}
                    onChange={handleInputChange}
                    placeholder="Event Description"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" required
                  ></textarea>
                  <select
                    name="eventCategory"
                    value={editingEvent ? editingEvent.eventCategory : newEvent.eventCategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" required
                  >
                    <option value="">Select Event Category / Type</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Competition">Competition</option>
                    <option value="Festival">Festival</option>
                    <option value="Other">Other</option>
                  </select>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Team or Individual</label>
                  <select
                    name="teamOrIndividual"
                    value={editingEvent ? editingEvent.teamOrIndividual : newEvent.teamOrIndividual}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" required
                  >
                    <option value="Individual">Individual</option>
                    <option value="Team">Team</option>
                  </select>
                  <input
                    type="text"
                    name="location"
                    value={editingEvent ? editingEvent.location : newEvent.location}
                    onChange={handleInputChange}
                    placeholder="Location"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  <label className="block text-sm font-medium text-gray-400 mb-1">Registration Fees</label>
                  <input
                    type="number"
                    name="registrationFees"
                    value={editingEvent ? editingEvent.registrationFees : newEvent.registrationFees}
                    onChange={handleInputChange}
                    placeholder="Registration Fees"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  <input
                    type="text"
                    name="coordinatorName"
                    value={editingEvent ? editingEvent.coordinatorName : newEvent.coordinatorName}
                    onChange={handleInputChange}
                    placeholder="Coordinator Name"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  <input
                    type="text"
                    name="coordinatorContactNo"
                    value={editingEvent ? editingEvent.coordinatorContactNo : newEvent.coordinatorContactNo}
                    onChange={handleInputChange}
                    placeholder="Coordinator Contact No"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  <input
                    type="email"
                    name="coordinatorMail"
                    value={editingEvent ? editingEvent.coordinatorMail : newEvent.coordinatorMail}
                    onChange={handleInputChange}
                    placeholder="Coordinator Mail"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  <label className="block text-sm font-medium text-gray-400 mb-1">Last Date for Registration</label>
                  <input
                    type="datetime-local"
                    name="lastDateForRegistration"
                    value={editingEvent ? editingEvent.lastDateForRegistration : newEvent.lastDateForRegistration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  <label className="block text-sm font-medium text-gray-400 mb-1">Number of Rounds</label>
                  <input
                    type="number"
                    name="numberOfRounds"
                    value={editingEvent ? editingEvent.numberOfRounds : newEvent.numberOfRounds}
                    onChange={handleNumberOfRoundsChange}
                    min="1"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                </div>

                {/* Rounds Details */}
                {rounds.map((round, index) => (
                  <div key={index} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h4 className="text-xl font-bold text-white mb-4">Round {round.roundNumber} Details</h4>
                    <textarea
                      name="roundDetails"
                      value={round.roundDetails}
                      onChange={(e) => handleRoundChange(index, 'roundDetails', e.target.value)}
                      placeholder="Round Details"
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4" required
                    ></textarea>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Round Date & Time</label>
                    <input
                      type="datetime-local"
                      name="roundDateTime"
                      value={round.roundDateTime}
                      onChange={(e) => handleRoundChange(index, 'roundDateTime', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  </div>
                ))}

                <button type="submit" className="w-full px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform">
                  {editingEvent ? 'Update Event' : 'Save Event'}
                </button>
                {editingEvent && (
                  <button onClick={() => setEditingEvent(null)} className="w-full mt-2 px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform">
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>

            <div className="space-y-4">
              {filteredEvents.map(event => (
                <div key={event.id} className="bg-gray-900/70 p-5 rounded-lg flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-bold text-white">{event.eventName}</h4>
                    <p className="text-gray-300 mt-2">{event.eventDescription}</p>
                    <div key={event.id} className="bg-gray-900/70 p-5 rounded-lg flex flex-col lg:flex-row gap-4">
  {event.posterUrl && (
  <img
    src={`/backend/${event.posterUrl}`}
    alt={event.eventName}
    className="w-full max-h-64 object-contain rounded-md mb-4"
  />
)}
                      
                      <p>Category: {event.eventCategory}</p>
                      <p>Rounds: {event.numberOfRounds}</p>
                      <p>Type: {event.teamOrIndividual}</p>
                      <p>Location: {event.location}</p>
                      <p>Registration Fees: ${event.registrationFees}</p>
                      <p>Coordinator: {event.coordinatorName} ({event.coordinatorContactNo})</p>
                      <p>Coordinator Email: {event.coordinatorMail}</p>
                      <p>Last Date for Registration: {new Date(event.lastDateForRegistration).toLocaleString()}</p>
                      {event.rounds && event.rounds.map((round, index) => (
                        <div key={index} className="ml-4 mt-2">
                          <p><strong>Round {round.roundNumber}:</strong> {round.roundDetails}</p>
                          <p>Date & Time: {new Date(round.roundDateTime).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 ml-4 flex-shrink-0">
                    <button onClick={() => setEditingEvent(event)} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteEvent(event.id)} className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <ThemedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        onConfirm={modalOnConfirm}
        showConfirmButton={showConfirmButton}
      />
    </>
  );
};

export default ManageEventsPage;
