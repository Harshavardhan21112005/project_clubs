const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on("error", (err) => console.error("Redis Error", err));

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
