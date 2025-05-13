const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./server/routes/authRoutes');
const pool = require('./server/config/db'); // ✅ Correct relative path

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Add this test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Auth routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
