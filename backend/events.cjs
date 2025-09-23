const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

module.exports = function(db, uploadEventPoster, eventPosterDir) {
  router.post('/', async (req, res) => {
    const {
      symposiumName,
      eventName,
      eventCategory,
      eventDescription,
      numberOfRounds,
      teamOrIndividual,
      location,
      registrationFees,
      coordinatorName,
      coordinatorContactNo,
      coordinatorMail,
      lastDateForRegistration,
      rounds,
    } = req.body;

    if (!symposiumName || !eventName || !eventCategory || !eventDescription ||
        numberOfRounds === undefined || !teamOrIndividual || !location ||
        registrationFees === undefined || !coordinatorName || !coordinatorContactNo ||
        !coordinatorMail || !lastDateForRegistration || !rounds) {
      return res.status(400).json({ message: 'Missing required event fields.' });
    }

    try {
      let eventTable;
      let roundsTable;
      if (symposiumName === 'Enigma') {
        eventTable = 'enigma_events';
        roundsTable = 'enigma_rounds';
      } else if (symposiumName === 'Carteblanche') {
        eventTable = 'carte_blanche_events';
        roundsTable = 'carte_blanche_rounds';
      } else {
        return res.status(400).json({ message: 'Invalid symposium name.' });
      }

      const [eventResult] = await db.execute(
        `INSERT INTO ${eventTable} (
          eventName, eventCategory, eventDescription, numberOfRounds, teamOrIndividual,
          location, registrationFees, coordinatorName, coordinatorContactNo, coordinatorMail,
          lastDateForRegistration
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventName, eventCategory, eventDescription, numberOfRounds, teamOrIndividual,
          location, registrationFees, coordinatorName, coordinatorContactNo, coordinatorMail,
          lastDateForRegistration,
        ]
      );

      const eventId = eventResult.insertId;

      for (const round of rounds) {
        await db.execute(
          `INSERT INTO ${roundsTable} (eventId, roundNumber, roundDetails, roundDateTime) VALUES (?, ?, ?, ?)`, 
          [eventId, round.roundNumber, round.roundDetails, round.roundDateTime]
        );
      }

      res.status(201).json({ message: 'Event added successfully.', eventId });
    } catch (error) {
      console.error('Error adding event:', error);
      res.status(500).json({ message: 'Failed to add event.' });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const [enigmaEvents] = await db.execute('SELECT id, eventName, eventCategory, eventDescription, numberOfRounds, teamOrIndividual, location, registrationFees, coordinatorName, coordinatorContactNo, coordinatorMail, lastDateForRegistration, posterUrl, createdAt FROM enigma_events');
      const [carteBlancheEvents] = await db.execute('SELECT id, eventName, eventCategory, eventDescription, numberOfRounds, teamOrIndividual, location, registrationFees, coordinatorName, coordinatorContactNo, coordinatorMail, lastDateForRegistration, posterUrl, createdAt FROM carte_blanche_events');

      const allEvents = [];

      for (const event of enigmaEvents) {
        const [rounds] = await db.execute('SELECT roundNumber, roundDetails, roundDateTime FROM enigma_rounds WHERE eventId = ?', [event.id]);
        allEvents.push({ ...event, symposiumName: 'Enigma', rounds });
      }

      for (const event of carteBlancheEvents) {
        const [rounds] = await db.execute('SELECT roundNumber, roundDetails, roundDateTime FROM carte_blanche_rounds WHERE eventId = ?', [event.id]);
        allEvents.push({ ...event, symposiumName: 'Carteblanche', rounds });
      }

      res.json(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Failed to fetch events.' });
    }
  });

  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { symposium } = req.query;

    if (!symposium) {
      return res.status(400).json({ message: 'Symposium name is required.' });
    }

    let eventTable;
    if (symposium === 'Enigma') {
      eventTable = 'enigma_events';
    } else if (symposium === 'Carteblanche') {
      eventTable = 'carte_blanche_events';
    } else {
      return res.status(400).json({ message: 'Invalid symposium name.' });
    }

    try {
      const [rows] = await db.execute(`SELECT * FROM ${eventTable} WHERE id = ?`, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Event not found.' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ message: 'Failed to fetch event.' });
    }
  });

  router.get('/:eventId/registrations', async (req, res) => {
    const { eventId } = req.params;
    try {
      const [registrations] = await db.execute(
        `SELECT r.*, u.name, u.email, u.mobile, u.department, u.year, u.college 
         FROM registrations r 
         JOIN users u ON r.userId = u.id 
         WHERE r.eventId = ?`, 
        [eventId]
      );
      res.json(registrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      res.status(500).json({ message: 'Failed to fetch registrations.' });
    }
  });

  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const {
      symposiumName,
      eventName,
      eventCategory,
      eventDescription,
      numberOfRounds,
      teamOrIndividual,
      location,
      registrationFees,
      coordinatorName,
      coordinatorContactNo,
      coordinatorMail,
      lastDateForRegistration,
      rounds,
    } = req.body;

    if (!symposiumName || !eventName || !eventCategory || !eventDescription ||
        numberOfRounds === undefined || !teamOrIndividual || !location ||
        registrationFees === undefined || !coordinatorName || !coordinatorContactNo ||
        !coordinatorMail || !lastDateForRegistration || !rounds) {
      return res.status(400).json({ message: 'Missing required event fields.' });
    }

    try {
      let eventTable;
      let roundsTable;
      if (symposiumName === 'Enigma') {
        eventTable = 'enigma_events';
        roundsTable = 'enigma_rounds';
      } else if (symposiumName === 'Carteblanche') {
        eventTable = 'carte_blanche_events';
        roundsTable = 'carte_blanche_rounds';
      } else {
        return res.status(400).json({ message: 'Invalid symposium name.' });
      }

      await db.execute(
        `UPDATE ${eventTable} SET
          eventName = ?, eventCategory = ?, eventDescription = ?, numberOfRounds = ?, teamOrIndividual = ?,
          location = ?, registrationFees = ?, coordinatorName = ?, coordinatorContactNo = ?, coordinatorMail = ?,
          lastDateForRegistration = ?
        WHERE id = ?`,
        [
          eventName, eventCategory, eventDescription, numberOfRounds, teamOrIndividual,
          location, registrationFees, coordinatorName, coordinatorContactNo, coordinatorMail,
          lastDateForRegistration, id,
        ]
      );

      // Delete existing rounds and insert new ones
      await db.execute(`DELETE FROM ${roundsTable} WHERE eventId = ?`, [id]);
      for (const round of rounds) {
        await db.execute(
          `INSERT INTO ${roundsTable} (eventId, roundNumber, roundDetails, roundDateTime) VALUES (?, ?, ?, ?)`, 
          [id, round.roundNumber, round.roundDetails, round.roundDateTime]
        );
      }

      res.json({ message: `Event ${id} has been updated.` });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Failed to update event.' });
    }
  });

  // Route to upload event poster
  router.post('/:id/poster', uploadEventPoster.single('poster'), async (req, res) => {
    const { id } = req.params;
    const { symposiumName } = req.body; // Get symposiumName from body

    if (!symposiumName) {
      return res.status(400).json({ message: 'Symposium name is required.' });
    }

    let eventTable;
    if (symposiumName === 'Enigma') {
      eventTable = 'enigma_events';
    } else if (symposiumName === 'Carteblanche') {
      eventTable = 'carte_blanche_events';
    } else {
      return res.status(400).json({ message: 'Invalid symposium name.' });
    }

    console.log('Received poster upload request for event ID:', id);
    console.log('req.file:', req.file);

    if (!req.file) {
      console.error('No file uploaded for event ID:', id);
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const posterUrl = `/uploads/event_posters/${req.file.filename}`;
    console.log('Generated posterUrl:', posterUrl);

    try {
      await db.execute(
        `UPDATE ${eventTable} SET posterUrl = ? WHERE id = ?`, 
        [posterUrl, id]
      );
      res.status(200).json({ message: 'Poster uploaded successfully.', posterUrl });
    } catch (error) {
      console.error('Error uploading poster to database for event ID:', id, error);
      res.status(500).json({ message: 'Failed to upload poster.' });
    }
  });

  // Route to delete event poster
  router.delete('/:id/poster', async (req, res) => {
    const { id } = req.params;
    const { symposiumName } = req.body; // Get symposiumName from body

    if (!symposiumName) {
      return res.status(400).json({ message: 'Symposium name is required.' });
    }

    let eventTable;
    if (symposiumName === 'Enigma') {
      eventTable = 'enigma_events';
    } else if (symposiumName === 'Carteblanche') {
      eventTable = 'carte_blanche_events';
    } else {
      return res.status(400).json({ message: 'Invalid symposium name.' });
    }

    try {
      const [rows] = await db.execute(`SELECT posterUrl FROM ${eventTable} WHERE id = ?`, [id]);
      const event = rows[0];

      if (event && event.posterUrl) {
        // Extract just the filename from the full URL to get the local path
        const filename = path.basename(event.posterUrl);
        const filePath = path.join(eventPosterDir, filename);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file from filesystem:', err);
          }
        });
      }

      await db.execute(`UPDATE ${eventTable} SET posterUrl = NULL WHERE id = ?`, [id]);
      res.status(200).json({ message: 'Poster removed successfully.' });
    } catch (error) {
      console.error('Error removing poster:', error);
      res.status(500).json({ message: 'Failed to remove poster.' });
    }
  });

  // Assign account to an event
  router.post('/:eventId/accounts', async (req, res) => {
    const { eventId } = req.params;
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ message: 'Account ID is required.' });
    }

    try {
      // Check if event exists (either in enigma_events or carte_blanche_events)
      const [enigmaEvent] = await db.execute('SELECT id FROM enigma_events WHERE id = ?', [eventId]);
      const [carteBlancheEvent] = await db.execute('SELECT id FROM carte_blanche_events WHERE id = ?', [eventId]);

      if (enigmaEvent.length === 0 && carteBlancheEvent.length === 0) {
        return res.status(404).json({ message: 'Event not found.' });
      }

      // Check if account exists
      const [account] = await db.execute('SELECT id FROM accounts WHERE id = ?', [accountId]);
      if (account.length === 0) {
        return res.status(404).json({ message: 'Account not found.' });
      }

      // Check if already assigned
      const [existingAssignment] = await db.execute(
        'SELECT * FROM event_accounts WHERE eventId = ? AND accountId = ?', 
        [eventId, accountId]
      );
      if (existingAssignment.length > 0) {
        return res.status(409).json({ message: 'Account already assigned to this event.' });
      }

      await db.execute(
        'INSERT INTO event_accounts (eventId, accountId) VALUES (?, ?)', 
        [eventId, accountId]
      );
      res.status(201).json({ message: 'Account assigned to event successfully.' });
    } catch (error) {
      console.error('Error assigning account to event:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });

  // Get assigned accounts for an event
  router.get('/:eventId/accounts', async (req, res) => {
    const { eventId } = req.params;
    try {
      const [rows] = await db.execute(
        `SELECT ea.accountId AS id, a.accountName, a.bankName, a.accountNumber, a.ifscCode
         FROM event_accounts ea
         JOIN accounts a ON ea.accountId = a.id
         WHERE ea.eventId = ?`, 
        [eventId]
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching assigned accounts for event:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });

  // Remove account assignment from an event
  router.delete('/:eventId/accounts/:accountId', async (req, res) => {
    const { eventId, accountId } = req.params;
    try {
      const [result] = await db.execute(
        'DELETE FROM event_accounts WHERE eventId = ? AND accountId = ?', 
        [eventId, accountId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Assignment not found.' });
      }
      res.status(200).json({ message: 'Account assignment removed successfully.' });
    } catch (error) {
      console.error('Error removing account assignment from event:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });

  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { symposiumName } = req.body; // Get symposiumName from body

    if (!symposiumName) {
      return res.status(400).json({ message: 'Symposium name is required.' });
    }

    let eventTable;
    let roundsTable;
    if (symposiumName === 'Enigma') {
      eventTable = 'enigma_events';
      roundsTable = 'enigma_rounds';
    } else if (symposiumName === 'Carteblanche') {
      eventTable = 'carte_blanche_events';
      roundsTable = 'carte_blanche_rounds';
    } else {
      return res.status(400).json({ message: 'Invalid symposium name.' });
    }

    try {
      // Delete associated rounds first
      await db.execute(`DELETE FROM ${roundsTable} WHERE eventId = ?`, [id]);

      // Then delete the event
      await db.execute(`DELETE FROM ${eventTable} WHERE id = ?`, [id]);
      res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Failed to delete event.' });
    }
  });

  return router;
};