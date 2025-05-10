const clubModel = require("../models/clubModel");

exports.getClubs = async (req, res) => {
  try {
    const clubs = await clubModel.getAllClubs();
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
