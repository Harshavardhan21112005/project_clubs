const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.connect();

const {
  findUserByEmail,
  findAdminByEmail,
  updateUserOTP,
  updateUserPassword,
  updateAdminPassword
} = require('../models/user');

// 🔐 Login Controller
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await findUserByEmail(username);
    let role = 'user';

    if (!user) {
      user = await findAdminByEmail(username);
      role = 'admin';
    }

    if (!user) {
      return res.status(404).json({ message: 'User/Admin not found' });
    }

    const isValid = await bcrypt.compare(password, user.password).catch(() => false) || password === user.password;

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: username, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const redisKey = role === 'user' ? user.user_id : user.adm_id;
    await redisClient.set(redisKey, token, 'EX', 3600);

    res.json({ token, user: { ...user, role } });
  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 🔐 Combined Forgot Password (OTP + Reset)
const forgotPassword = async (req, res) => {
  const { username, otp, newPassword } = req.body;

  try {
    const user = await findUserByEmail(username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 1: Send OTP
    if (!otp && !newPassword) {
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      await updateUserOTP(user.user_id, generatedOTP);
      console.log(`📧 OTP sent to ${username}: ${generatedOTP}`);
      return res.json({ message: 'OTP sent to your email (simulated).' });
    }

    // Step 2: Verify OTP & Reset Password
    if (otp && newPassword) {
      if (user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await updateUserPassword(user.user_id, hashedPassword);
      await updateUserOTP(user.user_id, null);

      const admin = await findAdminByEmail(username);
      if (admin) {
        await updateAdminPassword(admin.adm_id, hashedPassword);
      }

      return res.json({ message: 'Password reset successful.' });
    }

    return res.status(400).json({ message: 'Invalid request. Provide OTP and new password or nothing.' });
  } catch (err) {
    console.error('❌ Forgot Password Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login,
  forgotPassword
};
