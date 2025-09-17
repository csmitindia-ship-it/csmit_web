const express = require('express');
const router = express.Router();
const fs = require('fs');

module.exports = function(db, upload) {
  router.post('/submit-experience', upload.single('pdf'), async (req, res) => {
    const { name, email, type, year, company, linkedin } = req.body;
    const pdfPath = req.file ? req.file.path : null;

    if (!name || !email || !type || !year || !company || !pdfPath) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
      await db.execute(
        'INSERT INTO experiences (name, email, type, year_of_passing, company, linkedin_url, pdf_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, type, year, company, linkedin, pdfPath]
      );
      res.status(201).json({ message: 'Experience submitted successfully. It will be reviewed by the admin.' });
    } catch (error) {
      console.error('Error submitting experience:', error);
      res.status(500).json({ message: 'Failed to submit experience.' });
    }
  });

  router.get('/experiences', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM experiences ORDER BY company');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      res.status(500).json({ message: 'Failed to fetch experiences.' });
    }
  });

  router.get('/admin/pending-experiences', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM experiences WHERE status = ?', ['pending']);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching pending experiences:', error);
      res.status(500).json({ message: 'Failed to fetch pending experiences.' });
    }
  });

  router.post('/admin/update-experience-status', async (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ message: 'Experience ID and status are required.' });
    }
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    try {
      await db.execute('UPDATE experiences SET status = ? WHERE id = ?', [status, id]);
      res.json({ message: `Experience ${id} has been ${status}.` });
    } catch (error) {
      console.error('Error updating experience status:', error);
      res.status(500).json({ message: 'Failed to update experience status.' });
    }
  });

  router.delete('/admin/delete-experience/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const [rows] = await db.execute('SELECT pdf_path FROM experiences WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Experience not found.' });
      }
      const pdfPath = rows[0].pdf_path;

      await db.execute('DELETE FROM experiences WHERE id = ?', [id]);

      if (pdfPath && fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
        console.log(`Deleted PDF file: ${pdfPath}`);
      }

      res.json({ message: 'Experience deleted successfully.' });
    } catch (error) {
      console.error('Error deleting experience:', error);
      res.status(500).json({ message: 'Failed to delete experience.' });
    }
  });

  return router;
};