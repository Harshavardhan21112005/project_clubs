const db = require("../config/db");

exports.getStudentByUsername = async (username) => {
  const result = await db.query("SELECT * FROM students WHERE username = $1", [username]);
  return result.rows[0];
};

exports.updatePassword = async (username, hashedPwd) => {
  await db.query("UPDATE students SET password = $1 WHERE username = $2", [hashedPwd, username]);
};

exports.applyForClubs = async (studentId, preferences) => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (const clubId of preferences) {
      const res = await client.query("SELECT max_seats, occupied_seats FROM clubs WHERE id = $1 FOR UPDATE", [clubId]);
      if (res.rows.length === 0 || res.rows[0].occupied_seats >= res.rows[0].max_seats) continue;

      await client.query("INSERT INTO allotment (student_id, club_id) VALUES ($1, $2)", [studentId, clubId]);
      await client.query("UPDATE clubs SET occupied_seats = occupied_seats + 1 WHERE id = $1", [clubId]);
      break; // FCFS - break after first success
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};
