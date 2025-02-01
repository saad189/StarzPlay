import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import { KAFKA_CONSTANTS } from "../constants/kafka.contants";

dotenv.config();

const { CLIENT_ID, GROUP_ID } = KAFKA_CONSTANTS;

const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"]
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: GROUP_ID });
