const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads', 'event_posters');
console.log('Multer upload directory:', uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

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

  // Route to upload event poster
  router.post('/:id/poster', upload.single('poster'), async (req, res) => {
    const { id } = req.params;
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
        'UPDATE events SET posterUrl = ? WHERE id = ?',
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

    try {
      const [rows] = await db.execute('SELECT posterUrl FROM events WHERE id = ?', [id]);
      const event = rows[0];

      if (event && event.posterUrl) {
        // Extract just the filename from the full URL to get the local path
        const filename = path.basename(event.posterUrl);
        const filePath = path.join(uploadDir, filename);

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file from filesystem:', err);
          }
        });
      }

      await db.execute('UPDATE events SET posterUrl = NULL WHERE id = ?', [id]);
      res.status(200).json({ message: 'Poster removed successfully.' });
    } catch (error) {
      console.error('Error removing poster:', error);
      res.status(500).json({ message: 'Failed to remove poster.' });
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