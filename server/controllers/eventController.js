const eventModel = require("../models/eventModel");

exports.getEvents = async (req, res) => {
  try {
    const events = await eventModel.getUpcomingEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  const studentId = req.user.id;
  const { eventId } = req.body;
  try {
    await eventModel.registerForEvent(studentId, eventId);
    res.json({ message: "Registered for event." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
