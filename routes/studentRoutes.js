const express = require('express');
const router = express.Router();

// Import both controllers
const {
  registerClubPreferences,
  getAvailableClubs,
} = require('../controllers/studentController');

// POST route: student submits preferences
router.post('/register-club', registerClubPreferences);

// GET route: fetch available clubs and vacancy counts
router.get('/available-clubs', getAvailableClubs);

module.exports = router;
