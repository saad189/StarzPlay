import app from "./app";
import sequelize from "./config/database.config";
import { producer, consumer } from "./config/kafka.config";
import redisClient from "./config/redis.config";
import logger from "./utils/logger";


const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Sequelize DB Connection
    await sequelize.authenticate();
    logger.info("Connected to Database:", sequelize.getDatabaseName());

    // Sync all models
    await sequelize.sync({ alter: true });
    logger.info("Database synchronized");

    //Kafka Producer & Consumer
    await producer.connect();
    await consumer.connect();
    logger.info("Kafka Producer and Consumer connected");

    // Subscribe to a topic | Recheck this
    await consumer.subscribe({ topic: "user_events", fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        logger.info(" Message received:", message.value?.toString());
        // handle message
      }
    });

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
  logger.info("🛑 Graceful Shutdown");
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
