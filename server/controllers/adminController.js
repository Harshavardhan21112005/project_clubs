const adminModel = require("../models/adminModel");

exports.updateMaxClubs = async (req, res) => {
  const { maxClubs } = req.body;
  try {
    await adminModel.setApplicationRules(maxClubs);
    res.json({ message: "Updated max clubs successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setClubCap = async (req, res) => {
  const { clubId, maxSeats } = req.body;
  try {
    await adminModel.setClubCap(clubId, maxSeats);
    res.json({ message: "Updated club capacity" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
