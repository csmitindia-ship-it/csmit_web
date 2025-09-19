const express = require('express');
const router = express.Router();

module.exports = function(db) {
  router.post('/', async (req, res) => {
    const { eventName, userName, userEmail, symposium, eventId, transactionId } = req.body;

    if (!eventName || !userName || !userEmail || !symposium || !eventId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
      await db.execute(
        'INSERT INTO registrations (symposium, eventId, userName, userEmail, transactionId) VALUES (?, ?, ?, ?, ?)',
        [symposium, eventId, userName, userEmail, transactionId]
      );
      res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Failed to register.' });
    }
  });

  return router;
};