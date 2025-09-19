const express = require('express');
const router = express.Router();

module.exports = function(db) {
  // GET registered events for a user
  router.get('/:userEmail', async (req, res) => {
    const { userEmail } = req.params;
    try {
      const [registrations] = await db.execute('SELECT eventId FROM registrations WHERE userEmail = ?', [userEmail]);
      res.status(200).json(registrations);
    } catch (error) {
      console.error('Error fetching registered events:', error);
      res.status(500).json({ message: 'Failed to fetch registered events.' });
    }
  });

  // POST a new registration
  router.post('/', async (req, res) => {
    const { userEmail, eventId } = req.body;

    if (!userEmail || !eventId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
      // Check if already registered
      const [existing] = await db.execute('SELECT id FROM registrations WHERE userEmail = ? AND eventId = ?', [userEmail, eventId]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Already registered for this event.' });
      }

      // Fetch event details
      const [[event]] = await db.execute('SELECT eventName, \'Enigma\' as symposium FROM enigma_events WHERE id = ? UNION SELECT eventName, \'Carteblanche\' as symposium FROM carte_blanche_events WHERE id = ?', [eventId, eventId]);
      if (!event) {
        return res.status(404).json({ message: 'Event not found.' });
      }

      // Fetch user details
      const [[user]] = await db.execute('SELECT fullName FROM users WHERE email = ?', [userEmail]);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Insert registration
      await db.execute(
        'INSERT INTO registrations (symposium, eventId, userName, userEmail) VALUES (?, ?, ?, ?)',
        [event.symposium, eventId, user.fullName, userEmail]
      );

      res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Failed to register.' });
    }
  });

  return router;
};
