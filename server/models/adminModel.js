const db = require("../config/db");

exports.getAdminByUsername = async (username) => {
  const res = await db.query("SELECT * FROM admins WHERE username = $1", [username]);
  return res.rows[0];
};

exports.setApplicationRules = async (maxClubs) => {
  await db.query("UPDATE application_rules SET max_clubs = $1", [maxClubs]);
};

exports.setClubCap = async (clubId, maxSeats) => {
  await db.query("UPDATE clubs SET max_seats = $1 WHERE id = $2", [maxSeats, clubId]);
};
