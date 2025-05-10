const db = require("../config/db");

exports.getAllClubs = async () => {
  const res = await db.query("SELECT * FROM clubs");
  return res.rows;
};

exports.getClubById = async (id) => {
  const res = await db.query("SELECT * FROM clubs WHERE id = $1", [id]);
  return res.rows[0];
};
