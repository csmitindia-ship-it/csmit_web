console.log(__filename);

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());
app.use(cors({
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

// --- File Upload Setup ---
const pdfDir = path.join(__dirname, 'uploads/pdfs');
if (!fs.existsSync(pdfDir)){
    fs.mkdirSync(pdfDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pdfDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Database Connection ---
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'csmit_db'
};

let db;

async function connectToDatabase() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database.');
    await createTablesIfNotExists();
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    process.exit(1); // Exit the process if connection fails
  }
}

async function createTablesIfNotExists() {
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fullName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      dob DATE,
      mobile VARCHAR(20),
      college VARCHAR(255),
      department VARCHAR(255),
      yearOfPassing INT,
      state VARCHAR(255),
      district VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const createExperienceTableQuery = `
    CREATE TABLE IF NOT EXISTS experiences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      type ENUM('Placement', 'Intern') NOT NULL,
      year_of_passing INT NOT NULL,
      company VARCHAR(255) NOT NULL,
      linkedin_url VARCHAR(255),
      pdf_path VARCHAR(255) NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const createEventsTableQuery = `
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      symposiumName VARCHAR(255) NOT NULL,
      eventName VARCHAR(255) NOT NULL,
      eventDescription TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await db.execute(createUserTableQuery);
    console.log('Users table is ready.');
    await db.execute(createExperienceTableQuery);
    console.log('Experiences table is ready.');
    await db.execute(createEventsTableQuery);
    console.log('Events table is ready.');
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

// --- Nodemailer Transporter ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "csmitindia@gmail.com",
    pass: "kjue fgfj pwqy fqvk",
  },
});

async function startServer() {
  await connectToDatabase();

  // --- Routers ---
  const authRouter = require('./auth.cjs')(db, transporter);
  const eventsRouter = require('./events.cjs')(db);
  const placementsRouter = require('./placements.cjs')(db, upload);

  app.use('/auth', authRouter);
  app.use('/events', eventsRouter);
  app.use(placementsRouter);

  // --- Start Server ---
  app.use((req, res, next) => {
    console.log(`Unhandled request: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Not Found' });
  });

  const PORT = 5001;
  app.listen(PORT, () => {
    console.log(`Unified server is running on http://localhost:${PORT}`);
  });
}

startServer();