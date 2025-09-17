const express = require('express');
const router = express.Router();

module.exports = function(db, transporter) {
  const otpStore = {};

  router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Email not found. Please sign up first." });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[email] = otp;
      console.log(`Generated OTP for ${email}: ${otp}`);
      const mailOptions = {
        from: "csmitindia@gmail.com",
        to: email,
        subject: "Your OTP for Password Reset",
        text: `Your OTP is: ${otp}`,
      };
      await transporter.sendMail(mailOptions);
      res.json({ message: "OTP sent successfully to your email" });
    } catch (error) {
      console.error("Error in /send-otp:", error);
      res.status(500).json({ message: "Failed to send OTP email" });
    }
  });

  router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    if (otpStore[email] === otp) {
      delete otpStore[email];
      return res.json({ message: "OTP verified successfully" });
    }
    return res.status(400).json({ message: "Invalid OTP" });
  });

  router.post("/reset-password", async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Email and passwords are required" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
      await db.execute('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const user = rows[0];

      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const { password: _, ...userData } = user;

      res.json({ message: 'Login successful', user: userData });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Failed to login.' });
    }
  });

  router.post('/signup', async (req, res) => {
    const { 
      fullName, 
      email, 
      password, 
      dob, 
      mobile, 
      college, 
      department, 
      yearOfPassing, 
      state, 
      district 
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    try {
      const [result] = await db.execute(
        'INSERT INTO users (fullName, email, password, dob, mobile, college, department, yearOfPassing, state, district) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [fullName, email, password, dob, mobile, college, department, yearOfPassing, state, district]
      );
      res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email already exists.' });
      }
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user.' });
    }
  });

  return router;
};