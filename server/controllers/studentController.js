const studentModel = require("../models/studentModel");

exports.apply = async (req, res) => {
  try {
    const studentId = req.user.id; // assuming middleware populates req.user
    const { preferences } = req.body;
    await studentModel.applyForClubs(studentId, preferences);
    res.status(200).json({ message: "Applied successfully." });
  } catch (err) {
    res.status(500).json({ error: "Application failed", details: err.message });
  }
};
