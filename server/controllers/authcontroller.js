const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const redis = require('redis');
const nodemailer = require('nodemailer');
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

// Forgot Password Controller
const forgotPassword = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await findUserByEmail(username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await updateUserOTP(user.user_id, otp);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to send OTP' });
      }
      console.log('OTP sent: ' + info.response);
      res.json({ message: 'OTP sent to your registered email.' });
    });

  } catch (err) {
    console.error('❌ Forgot Password Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login,
  forgotPassword
};
