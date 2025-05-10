const db = require("../config/db");

exports.getUpcomingEvents = async () => {
  const res = await db.query("SELECT * FROM events WHERE start_time >= NOW() ORDER BY start_time");
  return res.rows;
};

exports.registerForEvent = async (studentId, eventId) => {
  await db.query("INSERT INTO event_registrations (student_id, event_id) VALUES ($1, $2)", [studentId, eventId]);
};
