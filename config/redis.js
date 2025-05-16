const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ Redis connected");
    }
  } catch (err) {
    console.error("❌ Redis connection error:", err);
  }
})();

module.exports = redisClient;


