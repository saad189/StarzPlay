import app from "./app";
import sequelize, { initializeSequelize } from "./config/database.config";

import { producer, consumer } from "./config/kafka.config";
import redisClient from "./config/redis.config";
import { consumeInventoryUpdates } from "./consumers/inventory.consumer";

import logger from "./utils/logger";


const PORT = process.env.PORT || 3000;


async function startServer() {
  try {
    // Sequelize DB Connection
    await initializeSequelize();

    //Kafka producer connection;
    await producer.connect();

    // Kafka consumer Connection
    await consumeInventoryUpdates();


    // Redis Connection
    await redisClient.connect();
    logger.info("Redis Connected");

    // 4. Start Express Server
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

// Graceful shutdown (SIGINT)
process.on("SIGINT", async () => {
  logger.info("Graceful Shutdown");
  try {
    await producer.disconnect();
    await consumer.disconnect();
    await redisClient.quit();
    await sequelize.close();
  } catch (err) {
    console.error("Error shutting down:", err);
  } finally {
    process.exit(0);
  }
});


startServer();
