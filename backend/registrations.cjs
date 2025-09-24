const express = require('express');
const router = express.Router();

module.exports = function(db, uploadTransactionScreenshot) {
  // Get all registrations
  router.get('/all', async (req, res) => {
    try {
      const [registrations] = await db.execute(`
        SELECT r.*, u.id as userId, vr.verified
        FROM registrations r 
        LEFT JOIN users u ON r.userEmail = u.email
        LEFT JOIN verified_registrations vr ON u.id = vr.userId AND r.eventId = vr.eventId
      `);
      res.status(200).json(registrations);
    } catch (error) {
      console.error('Error fetching all registrations:', error);
      res.status(500).json({ message: 'Failed to fetch all registrations.' });
    }
  });

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
      res.status(500).json({ message: 'Failed to check transaction ID.' });
    }
  });

  // POST a new registration (with transaction details for workshops)
  router.post('/', uploadTransactionScreenshot.single('transactionScreenshot'), async (req, res) => {
    const { userId, eventIds, transactionId, transactionUsername, transactionTime, transactionDate, transactionAmount, mobileNumber } = req.body;
    const transactionScreenshot = req.file ? req.file.buffer : null;
    const parsedEventIds = JSON.parse(eventIds);

    if (!userId || !parsedEventIds || !Array.isArray(parsedEventIds) || parsedEventIds.length === 0 || !transactionId || !transactionUsername || !transactionTime || !transactionDate || transactionAmount === undefined || !mobileNumber || !transactionScreenshot) {
      return res.status(400).json({ message: 'Missing required fields for registration.' });
    }

    try {
      // Check if transaction ID is already used
      const [existingTransaction] = await db.execute('SELECT id FROM registrations WHERE transactionId = ?', [transactionId]);
      if (existingTransaction.length > 0) {
        return res.status(409).json({ message: 'Transaction ID already used for another registration.' });
      }

      for (const eventId of parsedEventIds) {
        // Fetch event details
        const [[event]] = await db.execute('SELECT eventName, registrationFees, \'Enigma\' as symposium FROM enigma_events WHERE id = ? UNION SELECT eventName, registrationFees, \'Carteblanche\' as symposium FROM carte_blanche_events WHERE id = ?', [eventId, eventId]);
        if (!event) {
          // This will roll back the transaction if one event is not found
          throw new Error(`Event with ID ${eventId} not found.`);
        }

        // Fetch user details (fullName and email)
        const [[user]] = await db.execute('SELECT fullName, email FROM users WHERE id = ?', [userId]);
        if (!user) {
          throw new Error(`User with ID ${userId} not found.`);
        }

        // Check if already registered using userEmail
        const [existing] = await db.execute('SELECT id FROM registrations WHERE userEmail = ? AND eventId = ?', [user.email, eventId]);
        if (existing.length > 0) {
          throw new Error(`Already registered for event ${event.eventName}.`);
        }

        // Insert registration
        await db.execute(
          'INSERT INTO registrations (symposium, eventId, userName, userEmail, mobileNumber, transactionId, transactionUsername, transactionTime, transactionDate, transactionAmount, transactionScreenshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [event.symposium, eventId, user.fullName, user.email, mobileNumber, transactionId, transactionUsername, transactionTime, transactionDate, event.registrationFees, transactionScreenshot]
        );
      }

      res.status(201).json({ message: 'Registration successful for all events.' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: error.message || 'Failed to register.' });
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
         JOIN verified_registrations vr ON u.id = vr.userId AND r.eventId = vr.eventId
         WHERE r.eventId = ? AND vr.verified = true`,
        [eventId]
      );
      const [nonWorkshopRegistrations] = await db.execute(
        `SELECT u.fullName as userName, u.email, u.college, NULL as transactionId, NULL as transactionUsername, NULL as transactionTime, NULL as transactionDate, NULL as transactionAmount 
         FROM enigma_non_workshop_registrations enr 
         JOIN users u ON enr.userEmail = u.email 
         JOIN verified_registrations vr ON u.id = vr.userId AND enr.eventId = vr.eventId
         WHERE enr.eventId = ? AND vr.verified = true`,
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
    // Get workshop registrations
    const [workshopRegistrations] = await db.execute(
      'SELECT eventId FROM registrations WHERE userEmail = ?',
      [userEmail]
    );

    // Get non-workshop registrations
    const [nonWorkshopRegistrations] = await db.execute(
      'SELECT eventId FROM enigma_non_workshop_registrations WHERE userEmail = ?',
      [userEmail]
    );

    // Merge results
    const allRegistrations = [...workshopRegistrations, ...nonWorkshopRegistrations];

    res.status(200).json(allRegistrations);
  } catch (error) {
    console.error('Error fetching registered events:', error);
    res.status(500).json({ message: 'Failed to fetch registered events.' });
  }
});

  // GET verified registered events for a user
  router.get('/verified/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const [verifiedEvents] = await db.execute(
        `SELECT e.*, 'Enigma' as symposiumName 
         FROM enigma_events e
         JOIN verified_registrations vr ON e.id = vr.eventId
         WHERE vr.userId = ? AND vr.verified = true
         UNION
         SELECT e.*, 'Carteblanche' as symposiumName
         FROM carte_blanche_events e
         JOIN verified_registrations vr ON e.id = vr.eventId
         WHERE vr.userId = ? AND vr.verified = true`,
        [userId, userId]
      );
      res.status(200).json(verifiedEvents);
    } catch (error) {
      console.error('Error fetching verified registered events:', error);
      res.status(500).json({ message: 'Failed to fetch verified registered events.' });
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
      res.status(500).json({ message: 'Failed to register.' });
    }
  });

  return router;
};
