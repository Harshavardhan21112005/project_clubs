const pool = require('../config/db');

// 🔍 Find user by email
async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
  return result.rows[0];
}

// 🔍 Find admin by email
async function findAdminByEmail(email) {
  const result = await pool.query('SELECT * FROM "Admin" WHERE email = $1', [email]);
  return result.rows[0];
}

// ✏️ Update user OTP
async function updateUserOTP(userId, otp) {
  await pool.query('UPDATE "Users" SET otp = $1 WHERE user_id = $2', [otp, userId]);
}

// ✏️ Update user password
async function updateUserPassword(userId, hashedPassword) {
  await pool.query('UPDATE "Users" SET password = $1 WHERE user_id = $2', [hashedPassword, userId]);
}

// ✏️ Update admin password
async function updateAdminPassword(adminId, hashedPassword) {
  await pool.query('UPDATE "Admin" SET password = $1 WHERE adm_id = $2', [hashedPassword, adminId]);
}

module.exports = {
  findUserByEmail,
  findAdminByEmail,
  updateUserOTP,
  updateUserPassword,
  updateAdminPassword
};
