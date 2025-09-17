
import React, { useState, useEffect } from 'react';
import ThemedModal from '../components/ThemedModal';

interface Event {
  id: number;
  eventName: string;
  eventDescription: string;
  symposiumName: 'Enigma' | 'Carteblanche';
  eventDate: string;
  registrationLimit: number;
  registrationFees: number;
}

const EventCountdown: React.FC<{ eventDate: string }> = ({ eventDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(eventDate) - +new Date();
    let timeLeft = {};

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
    eventDescription: '',
    eventDate: '',
    registrationLimit: 0,
    registrationFees: 0,
  });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | undefined>(undefined);
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  const fetchEvents = () => {
    fetch('http://localhost:5001/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events:', err));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const valueToSet = e.target.type === 'number' ? parseInt(value, 10) : value;
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, [name]: valueToSet });
    } else {
      setNewEvent(prev => ({ ...prev, [name]: valueToSet }));
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = editingEvent ? { ...editingEvent } : { ...newEvent, symposiumName: activeSymposium };
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
          eventDescription: '',
          eventDate: '',
          registrationLimit: 0,
          registrationFees: 0,
        });
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
    setModalOnConfirm(() => () => {
      fetch(`http://localhost:5001/events/${id}`, { method: 'DELETE' })
        .then(() => {
          fetchEvents();
          setModalTitle('Success');
          setModalMessage('Event deleted successfully!');
          setShowConfirmButton(false);
          setIsModalOpen(true);
        })
        .catch(err => {
          console.error('Error deleting event:', err);
          setModalTitle('Error');
          setModalMessage('Failed to delete event.');
          setShowConfirmButton(false);
          setIsModalOpen(true);
        });
    });
    setShowConfirmButton(true);
    setIsModalOpen(true);
  };

  const filteredEvents = events.filter(event => event.symposiumName === activeSymposium);

  return (
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
            <input
              type="text"
              name="eventName"
              value={editingEvent ? editingEvent.eventName : newEvent.eventName}
              onChange={handleInputChange}
              placeholder="Event Title"
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <textarea
              name="eventDescription"
              value={editingEvent ? editingEvent.eventDescription : newEvent.eventDescription}
              onChange={handleInputChange}
              placeholder="Event Description"
              rows={5}
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            ></textarea>
            <input
              type="datetime-local"
              name="eventDate"
              value={editingEvent ? editingEvent.eventDate : newEvent.eventDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="number"
              name="registrationLimit"
              value={editingEvent ? editingEvent.registrationLimit : newEvent.registrationLimit}
              onChange={handleInputChange}
              placeholder="Registration Limit"
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="number"
              name="registrationFees"
              value={editingEvent ? editingEvent.registrationFees : newEvent.registrationFees}
              onChange={handleInputChange}
              placeholder="Registration Fees"
              className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
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
                <div className="text-gray-400 mt-2">
                  <p>Date: {new Date(event.eventDate).toLocaleString()}</p>
                  <p>Registration Limit: {event.registrationLimit}</p>
                  <p>Registration Fees: ${event.registrationFees}</p>
                </div>
                <EventCountdown eventDate={event.eventDate} />
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
