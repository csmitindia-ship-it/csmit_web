import React, { useEffect, useState } from 'react';

interface Event {
  id: number;
  symposiumName: string;
  eventName: string;
  eventDescription: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5001/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold text-white mb-8">Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div key={event.id} className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-2">{event.eventName}</h3>
            <p className="text-gray-400 mb-4">{event.symposiumName}</p>
            <p className="text-gray-300">{event.eventDescription}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
