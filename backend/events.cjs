const express = require('express');
const router = express.Router();

module.exports = function(db) {
  router.post('/', async (req, res) => {
    const { symposiumName, eventName, eventDescription } = req.body;

    if (!symposiumName || !eventName) {
      return res.status(400).json({ message: 'Symposium name and event name are required.' });
    }

    try {
      await db.execute(
        'INSERT INTO events (symposiumName, eventName, eventDescription) VALUES (?, ?, ?)',
        [symposiumName, eventName, eventDescription]
      );
      res.status(201).json({ message: 'Event added successfully.' });
    } catch (error) {
      console.error('Error adding event:', error);
      res.status(500).json({ message: 'Failed to add event.' });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM events');
      console.log('Fetched events:', rows);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Failed to fetch events.' });
    }
  });

  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { eventName, eventDescription } = req.body;

    if (!eventName) {
      return res.status(400).json({ message: 'Event name is required.' });
    }

    try {
      await db.execute(
        'UPDATE events SET eventName = ?, eventDescription = ? WHERE id = ?',
        [eventName, eventDescription, id]
      );
      res.json({ message: `Event ${id} has been updated.` });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Failed to update event.' });
    }
  });

  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      await db.execute('DELETE FROM events WHERE id = ?', [id]);
      res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Failed to delete event.' });
    }
  });

  return router;
};