const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const galleryDirectory = path.join(__dirname, '..', 'CSMIT Picture');

router.get('/', (req, res) => {
  fs.readdir(galleryDirectory, (err, files) => {
    if (err) {
      console.error('Error reading gallery directory:', err);
      return res.status(500).json({ error: 'Failed to load gallery images.' });
    }

    const imageFiles = files.filter(file => {
      const lowerCaseFile = file.toLowerCase();
      return lowerCaseFile.endsWith('.png') || lowerCaseFile.endsWith('.jpg') || lowerCaseFile.endsWith('.jpeg');
    });

    const imageUrls = imageFiles.map(file => `/src/CSMIT Picture/${file}`);
    res.json(imageUrls);
  });
});

module.exports = router;
