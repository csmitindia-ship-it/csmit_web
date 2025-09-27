const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');

module.exports = function (db, upload) {
  const handleUpload = (req, res, next) => {
    upload.single('pdf')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            type: 'error',
            title: 'Upload Failed',
            message: 'File size should not be more than 1MB.',
          });
        }
      }
      next();
    });
  };

  router.post('/submit-experience', handleUpload, async (req, res) => {
    const { name, email, type, year, company, linkedin } = req.body;
    const pdfPath = req.file ? req.file.path : null;

    if (!name || !email || !type || !year || !company || !pdfPath) {
      return res.status(400).json({
        type: 'warning',
        title: 'Missing Fields',
        message: 'Please fill in all required fields.',
      });
    }

    try {
      await db.execute(
        'INSERT INTO experiences (name, email, type, year_of_passing, company, linkedin_url, pdf_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, type, year, company, linkedin, pdfPath]
      );
      res.status(201).json({
        type: 'success',
        title: 'Submitted',
        message:
          'Experience submitted successfully. It will be reviewed by the admin.',
      });
    } catch (error) {
      console.error('Error submitting experience:', error);
      res.status(500).json({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit experience.',
      });
    }
  });

  router.get('/experiences', async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM experiences ORDER BY company'
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      res.status(500).json({
        type: 'error',
        title: 'Fetch Failed',
        message: 'Failed to fetch experiences.',
      });
    }
  });

  router.get('/admin/pending-experiences', async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM experiences WHERE status = ?',
        ['pending']
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching pending experiences:', error);
      res.status(500).json({
        type: 'error',
        title: 'Fetch Failed',
        message: 'Failed to fetch pending experiences.',
      });
    }
  });

  router.get('/admin/approved-experiences', async (req, res) => {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM experiences WHERE status = ?',
        ['approved']
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching approved experiences:', error);
      res.status(500).json({
        type: 'error',
        title: 'Fetch Failed',
        message: 'Failed to fetch approved experiences.',
      });
    }
  });

  router.post('/admin/update-experience-status', async (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({
        type: 'warning',
        title: 'Invalid Request',
        message: 'Experience ID and status are required.',
      });
    }
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        type: 'warning',
        title: 'Invalid Status',
        message: 'Status must be approved or rejected.',
      });
    }

    try {
      await db.execute('UPDATE experiences SET status = ? WHERE id = ?', [
        status,
        id,
      ]);
      res.json({
        type: 'success',
        title: 'Updated',
        message: `Experience ${id} has been ${status}.`,
      });
    } catch (error) {
      console.error('Error updating experience status:', error);
      res.status(500).json({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update experience status.',
      });
    }
  });

  router.delete('/admin/delete-experience/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const [rows] = await db.execute(
        'SELECT pdf_path FROM experiences WHERE id = ?',
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({
          type: 'warning',
          title: 'Not Found',
          message: 'Experience not found.',
        });
      }
      const pdfPath = rows[0].pdf_path;

      await db.execute('DELETE FROM experiences WHERE id = ?', [id]);

      if (pdfPath && fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
        console.log(`Deleted PDF file: ${pdfPath}`);
      }

      res.json({
        type: 'success',
        title: 'Deleted',
        message: 'Experience deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting experience:', error);
      res.status(500).json({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete experience.',
      });
    }
  });

  return router;
};
