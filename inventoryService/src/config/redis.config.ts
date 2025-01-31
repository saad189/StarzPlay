import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_PORT || "redis://localhost:6379"
});

export default redisClient;
