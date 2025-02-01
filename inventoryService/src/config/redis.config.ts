import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

console.log({ redisConfig: process.env.REDIS_PORT, kafgaConfig: process.env.KAFKA_BROKER })
const redisClient = createClient({
  url: `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` || "redis://localhost:6379"
});

export default redisClient;
