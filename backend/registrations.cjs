const express = require('express');
const router = express.Router();

module.exports = function(db) {
  // Check if transaction ID already exists
  router.get('/check-transaction/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    try {
      const [existing] = await db.execute('SELECT id FROM registrations WHERE transactionId = ?', [transactionId]);
      if (existing.length > 0) {
        return res.status(200).json({ exists: true, message: 'Transaction ID already used.' });
      }
      res.status(200).json({ exists: false, message: 'Transaction ID is available.' });
    } catch (error) {
      console.error('Error checking transaction ID:', error);
      console.error('Error details:', error); // Added logging
      res.status(500).json({ message: 'Failed to check transaction ID.' });
    }
  });

  // POST a new registration (with transaction details for workshops)
  router.post('/', async (req, res) => {
    const { userId, eventId, transactionId, transactionUsername, transactionTime, transactionDate, transactionAmount } = req.body;

    if (!userId || !eventId || !transactionId || !transactionUsername || !transactionTime || !transactionDate || transactionAmount === undefined) {
      return res.status(400).json({ message: 'Missing required fields for registration.' });
    }

    try {
      // Check if transaction ID is already used
      const [existingTransaction] = await db.execute('SELECT id FROM registrations WHERE transactionId = ?', [transactionId]);
      if (existingTransaction.length > 0) {
        return res.status(409).json({ message: 'Transaction ID already used for another registration.' });
      }

      // Fetch event details
      const [[event]] = await db.execute('SELECT eventName, \'Enigma\' as symposium FROM enigma_events WHERE id = ? UNION SELECT eventName, \'Carteblanche\' as symposium FROM carte_blanche_events WHERE id = ?', [eventId, eventId]);
      if (!event) {
        return res.status(404).json({ message: 'Event not found.' });
      }

      // Fetch user details (fullName and email)
      const [[user]] = await db.execute('SELECT fullName, email FROM users WHERE id = ?', [userId]);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      // Check if already registered using userEmail
      const [existing] = await db.execute('SELECT id FROM registrations WHERE userEmail = ? AND eventId = ?', [user.email, eventId]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Already registered for this event.' });
      }

      // Insert registration
      await db.execute(
        'INSERT INTO registrations (symposium, eventId, userName, userEmail, transactionId, transactionUsername, transactionTime, transactionDate, transactionAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [event.symposium, eventId, user.fullName, user.email, transactionId, transactionUsername, transactionTime, transactionDate, transactionAmount]
      );

      res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
      console.error('Error during registration:', error);
      console.error('Error details:', error); // Added logging
      res.status(500).json({ message: 'Failed to register.' });
    }
  });

  // GET registrations for a specific event
  router.get('/event/:eventId', async (req, res) => {
    const { eventId } = req.params;
    try {
      const [workshopRegistrations] = await db.execute(
        `SELECT r.transactionId, r.transactionUsername, r.transactionTime, r.transactionDate, r.transactionAmount, u.fullName as userName, u.email, u.college 
         FROM registrations r 
         JOIN users u ON r.userEmail = u.email 
         WHERE r.eventId = ?`,
        [eventId]
      );
      const [nonWorkshopRegistrations] = await db.execute(
        `SELECT u.fullName as userName, u.email, u.college, NULL as transactionId, NULL as transactionUsername, NULL as transactionTime, NULL as transactionDate, NULL as transactionAmount 
         FROM enigma_non_workshop_registrations enr 
         JOIN users u ON enr.userEmail = u.email 
         WHERE enr.eventId = ?`,
        [eventId]
      );

      // Combine and format registrations
      const allRegistrations = [
        ...workshopRegistrations.map(reg => ({ ...reg, email: reg.email || 'N/A', college: reg.college || 'N/A' })),
        ...nonWorkshopRegistrations.map(reg => ({ ...reg, email: reg.email || 'N/A', college: reg.college || 'N/A' }))
      ];

      res.status(200).json(allRegistrations);
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      res.status(500).json({ message: 'Failed to fetch event registrations.' });
    }
  });

  // GET registered events for a user
  router.get('/:userEmail', async (req, res) => {
    const { userEmail } = req.params;
    try {
      const [registrations] = await db.execute('SELECT eventId FROM registrations WHERE userEmail = ?', [userEmail]);
      const [nonWorkshopRegistrations] = await db.execute('SELECT eventId FROM enigma_non_workshop_registrations WHERE userEmail = ?', [userEmail]);
      const allRegistrations = [...registrations, ...nonWorkshopRegistrations];
      res.status(200).json(allRegistrations);
    } catch (error) {
      console.error('Error fetching registered events:', error);
      console.error('Error details:', error); // Added logging
      res.status(500).json({ message: 'Failed to fetch registered events.' });
    }
  });

  // POST a new registration (without transaction details for non-workshops)
  router.post('/simple', async (req, res) => {
    const { userEmail, eventId } = req.body; // Only these are required for simple registration

    if (!userEmail || !eventId) {
      return res.status(400).json({ message: 'Missing required fields for simple registration.' });
    }

    try {
      // Check if already registered
      const [existing] = await db.execute('SELECT id FROM enigma_non_workshop_registrations WHERE userEmail = ? AND eventId = ?', [userEmail, eventId]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Already registered for this event.' });
      }

      // Insert registration without transaction details
      await db.execute(
        'INSERT INTO enigma_non_workshop_registrations (userEmail, eventId) VALUES (?, ?)',
        [userEmail, eventId]
      );

      res.status(201).json({ message: 'Registration successful.' });
    } catch (error) {
      console.error('Error during simple registration:', error);
      console.error('Error details:', error); // Added logging
      res.status(500).json({ message: 'Failed to register.' });
    }
  });

  return router;
};
