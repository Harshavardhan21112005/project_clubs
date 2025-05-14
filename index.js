const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./server/routes/authRoutes');
const pool = require('./server/config/db'); // PostgreSQL connection

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 🔌 Test DB Connection (optional but helpful)
pool.connect()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ PostgreSQL connection error:', err));

// Default route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
