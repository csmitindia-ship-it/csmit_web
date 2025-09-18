
import React, { useState, useEffect } from 'react';
import ThemedModal from '../components/ThemedModal';

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
    eventDescription: '',
    eventCategory: '',
    eventOrganizer: '',
    startDate: '',
    endDate: '',
    timeZone: '',
    isRecurring: false,
    recurringInfo: '',
    physicalAddress: '',
    onlineLink: '',
    registrationDeadline: '',
    participationFee: 0,
    eligibilityCriteria: '',
    maxParticipants: undefined,
    coordinatorEmail: '',
    coordinatorPhone: '',
    supportContact: '',
    agenda: '',
    speakers: '',
    eventType: 'Individual',
    teamSize: undefined,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const valueToSet = type === 'number' ? parseInt(value, 10) : (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, [name]: valueToSet });
    } else {
      setNewEvent(prev => ({ ...prev, [name]: valueToSet }));
    }
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = editingEvent ? { ...editingEvent } : { ...newEvent, symposiumName: activeSymposium };
    // Ensure eventDate is correctly mapped to startDate and endDate for new events
    if (!editingEvent) {
      eventData.startDate = newEvent.startDate;
      eventData.endDate = newEvent.endDate;
      // Remove the old eventDate if it exists from previous structure
      delete (eventData as any).eventDate;
      delete (eventData as any).registrationLimit;
      delete (eventData as any).registrationFees;
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
          eventDescription: '',
          eventCategory: '',
          eventOrganizer: '',
          startDate: '',
          endDate: '',
          timeZone: '',
          isRecurring: false,
          recurringInfo: '',
          physicalAddress: '',
          onlineLink: '',
          registrationDeadline: '',
          participationFee: 0,
          eligibilityCriteria: '',
          maxParticipants: undefined,
          coordinatorEmail: '',
          coordinatorPhone: '',
          supportContact: '',
          agenda: '',
          speakers: '',
          eventType: 'Individual',
          teamSize: undefined,
          eventTags: '',
          eventRules: '',
          socialMediaLinks: '',
          sponsors: '',
          notes: '',
          eventStatus: 'Upcoming',
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
            {/* Basic Event Information */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-bold text-white mb-4">Basic Event Information</h4>
              <input
                type="text"
                name="eventName"
                value={editingEvent ? editingEvent.eventName : newEvent.eventName}
                onChange={handleInputChange}
                placeholder="Event Name / Title"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                required
              />
              <textarea
                name="eventDescription"
                value={editingEvent ? editingEvent.eventDescription : newEvent.eventDescription}
                onChange={handleInputChange}
                placeholder="Event Description"
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                required
              ></textarea>
              <select
                name="eventCategory"
                value={editingEvent ? editingEvent.eventCategory : newEvent.eventCategory}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                required
              >
                <option value="">Select Event Category / Type</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Webinar">Webinar</option>
                <option value="Competition">Competition</option>
                <option value="Festival">Festival</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                name="eventOrganizer"
                value={editingEvent ? editingEvent.eventOrganizer : newEvent.eventOrganizer}
                onChange={handleInputChange}
                placeholder="Event Organizer"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-bold text-white mb-4">Date & Time</h4>
              <label className="block text-sm font-medium text-gray-400 mb-2">Start Date & Time</label>
              <input
                type="datetime-local"
                name="startDate"
                value={editingEvent ? editingEvent.startDate : newEvent.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-400 mb-2">End Date & Time</label>
              <input
                type="datetime-local"
                name="endDate"
                value={editingEvent ? editingEvent.endDate : newEvent.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                required
              />
              <input
                type="text"
                name="timeZone"
                value={editingEvent ? editingEvent.timeZone : newEvent.timeZone}
                onChange={handleInputChange}
                placeholder="Time Zone (e.g., UTC, EST)"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={editingEvent ? editingEvent.isRecurring : newEvent.isRecurring}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded"
                />
                <label className="ml-2 block text-sm text-gray-300">Recurring Event</label>
              </div>
              {(editingEvent ? editingEvent.isRecurring : newEvent.isRecurring) && (
                <input
                  type="text"
                  name="recurringInfo"
                  value={editingEvent ? editingEvent.recurringInfo : newEvent.recurringInfo}
                  onChange={handleInputChange}
                  placeholder="Recurring Event Info (e.g., Weekly on Mondays)"
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            {/* Location / Venue */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-bold text-white mb-4">Location / Venue</h4>
              <input
                type="text"
                name="physicalAddress"
                value={editingEvent ? editingEvent.physicalAddress : newEvent.physicalAddress}
                onChange={handleInputChange}
                placeholder="Physical Address (Street, City, Room)"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              <input
                type="url"
                name="onlineLink"
                value={editingEvent ? editingEvent.onlineLink : newEvent.onlineLink}
                onChange={handleInputChange}
                placeholder="Online Link (Zoom, Google Meet)"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Registration & Participation */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-bold text-white mb-4">Registration & Participation</h4>
              
              <label className="block text-sm font-medium text-gray-400 mb-2">Registration Deadline</label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                value={editingEvent ? editingEvent.registrationDeadline : newEvent.registrationDeadline}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                required
              />
              <label className="block text-sm font-medium text-gray-400 mb-2">Participation Fee</label>
              <input
                type="number"
                name="participationFee"
                aria-placeholder='Fees..'
                value={editingEvent ? editingEvent.participationFee : newEvent.participationFee}
                onChange={handleInputChange}
                placeholder="Participation Fee (0 for Free)"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                required
              />
              <textarea
                name="eligibilityCriteria"
                value={editingEvent ? editingEvent.eligibilityCriteria : newEvent.eligibilityCriteria}
                onChange={handleInputChange}
                placeholder="Eligibility Criteria (Age, membership, skill level)"
                rows={2}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              ></textarea>
              <input
                type="number"
                name="maxParticipants"
                value={editingEvent ? editingEvent.maxParticipants : newEvent.maxParticipants}
                onChange={handleInputChange}
                placeholder="Maximum Participants (optional)"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              <select
                name="eventType"
                value={editingEvent ? editingEvent.eventType : newEvent.eventType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                required
              >
                <option value="Individual">Individual Event</option>
                <option value="Team">Team Event</option>
              </select>
              {(editingEvent ? editingEvent.eventType : newEvent.eventType) === 'Team' && (
                <input
                  type="number"
                  name="teamSize"
                  value={editingEvent ? editingEvent.teamSize : newEvent.teamSize}
                  onChange={handleInputChange}
                  placeholder="Team Size"
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="text-xl font-bold text-white mb-4">Contact Information</h4>
              <input
                type="email"
                name="coordinatorEmail"
                value={editingEvent ? editingEvent.coordinatorEmail : newEvent.coordinatorEmail}
                onChange={handleInputChange}
                placeholder="Event Coordinator Email"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                required
              />
              <input
                type="tel"
                name="coordinatorPhone"
                value={editingEvent ? editingEvent.coordinatorPhone : newEvent.coordinatorPhone}
                onChange={handleInputChange}
                placeholder="Event Coordinator Phone (optional)"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              <input
                type="email"
                name="supportContact"
                value={editingEvent ? editingEvent.supportContact : newEvent.supportContact}
                onChange={handleInputChange}
                placeholder="Support Contact / Helpdesk Email (optional)"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            

            {/* Additional Details */}
            
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
                  <p>Date: {new Date(event.startDate).toLocaleString()}</p>
                  <p>Registration Fees: ${event.registrationFees}</p>
                </div>
                <EventCountdown eventDate={event.startDate} />
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
