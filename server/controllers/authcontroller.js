const jwt = require('jsonwebtoken');
const redis = require('redis');
const redisClient = redis.createClient();
const { findUserByUsername, updatePassword, updateOTP } = require('../models/user');

require('dotenv').config();
redisClient.connect();

// 🔐 Login controller
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log(`➡️ Login attempt: ${username} ${password}`);
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const valid = password === user.password;
    console.log(`✅ Password valid? ${valid}`);

    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({}, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    if (redisClient && redisClient.set && user?.user_id) {
      await redisClient.set(user.user_id, token, 'EX', 3600);
    }

    res.json({ token, user });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔐 Forgot Password – Generate and "send" OTP
const forgotPassword = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    await updateOTP(user.user_id, otp);

    console.log(`📧 OTP for ${username} is: ${otp}`); // Simulate email/SMS

    res.json({ message: 'OTP sent to your registered email (simulated).' });
  } catch (err) {
    console.error('❌ Forgot Password Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔐 Reset Password using OTP
const resetPassword = async (req, res) => {
  const { username, otp, newPassword } = req.body;

  try {
    const user = await findUserByUsername(username);
    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP or user' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePassword(user.user_id, hashedPassword);
    await updateOTP(user.user_id, null); // Clear OTP after use

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('❌ Reset Password Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Export all controllers
module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
