import { listen } from "./app";
import { connectDB } from "./config/database.config";
import { connectRedis } from "./config/redis.config";
import { connectKafka } from "./config/kafka.config";

const PORT = process.env.PORT || 3000;

// Initialize services before starting the server
(async () => {
  await connectDB();
  await connectRedis();
  await connectKafka();

  listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
