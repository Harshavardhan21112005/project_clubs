const app = require("./app");
const pool = require("./config/db");
const redisClient = require("./config/redis");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await pool.connect();
    console.log("PostgreSQL connected");

    await redisClient.connect();
    console.log("Redis connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();
