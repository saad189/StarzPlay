import { producer } from "../config/kafka.config";
import { KAFKA_CONSTANTS } from "../constants/kafka.contants";
import logger from "./logger";

const {
    TOPICS: { INVENTORY_UPDATES },
    EVENT_TYPES: { STOCK_UPDATE, ORDER_PLACED }
} = KAFKA_CONSTANTS;

async function sendRandomEvent() {
    const currentTime = new Date().toISOString();
    const isStockUpdate = Math.random() < 0.5; // 50% chance for each event type
    const eventType = isStockUpdate ? STOCK_UPDATE : ORDER_PLACED;
    let quantity: number;

    if (isStockUpdate) {
        // Generate a random quantity for stock update between 90 and 150
        quantity = Math.floor(Math.random() * 60) + 90;
    } else {
        // Generate a random order quantity between 1 and 10
        quantity = Math.floor(Math.random() * 10) + 1;
    }

    const event = {
        eventType,
        productId: "PD125",
        quantity,
        timestamp: currentTime,
    };

    try {
        await producer.send({
            topic: INVENTORY_UPDATES,
            messages: [{ key: "PD125", value: JSON.stringify(event) }],
        });
        logger.info(`Sent ${eventType} event: ${JSON.stringify(event)}`);
    } catch (error: any) {
        logger.error(`Error sending test message: ${error.message}`);
    }
}

async function runProducer() {
    try {
        await producer.connect();
        logger.info("Producer connected.");

        while (true) {
            await sendRandomEvent();

            // Wait for a random delay between 1000ms (1 sec) and 5000ms (5 sec)
            const delay = Math.floor(Math.random() * 4000) + 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    } catch (error: any) {
        logger.error(`Error in producer run: ${error.message}`);
    } finally {
        await producer.disconnect();
    }
}


runProducer();
