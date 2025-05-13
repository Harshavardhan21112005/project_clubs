const pool = require('../config/db'); // adjust path if needed

const findUserByUsername = async (username) => {
  const query = 'SELECT * FROM "Users" WHERE email = $1';
  const result = await pool.query(query, [username]);
  return result.rows[0];
};

const updatePassword = async (user_id, newPassword) => {
  const query = 'UPDATE "Users" SET password = $1 WHERE user_id = $2';
  await pool.query(query, [newPassword, user_id]);
};

const updateOTP = async (user_id, otp) => {
  const query = 'UPDATE "Users" SET otp = $1 WHERE user_id = $2';
  await pool.query(query, [otp, user_id]);
};

module.exports = {
  findUserByUsername,
  updatePassword,
  updateOTP,
};
