import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: "inventory-microservice",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"]
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "inventory-group" });
