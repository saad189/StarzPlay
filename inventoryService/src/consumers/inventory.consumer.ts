import { consumer } from "../config/kafka.config";
import logger from "../utils/logger";
import InventoryService from "../services/inventory.service";
import { KAFKA_CONSTANTS } from "../constants/kafka.contants";

const { TOPICS: { INVENTORY_UPDATES }, EVENT_TYPES: { STOCK_UPDATE, ORDER_PLACED } } = KAFKA_CONSTANTS;

export async function processInventoryMessage(msgValue: string) {
    try {
        if (!msgValue) return;
        const event = JSON.parse(msgValue);
        const { eventType, productId, quantity, timestamp } = event;

        switch (eventType) {
            case STOCK_UPDATE:
                await InventoryService.updateStock(productId, quantity, timestamp);
                logger.info(`Processed stockUpdate for productId=${productId}, qty=${quantity} at ${timestamp}`);
                break;

            case ORDER_PLACED:
                await InventoryService.processOrder(productId, quantity, timestamp);
                logger.info(`Processed orderPlaced for productId=${productId}, qty=${quantity} at ${timestamp}`);
                break;

            default:
                logger.warn(`Unknown eventType=${eventType}`);
                break;
        }
    } catch (err: any) {
        logger.error(`Error processing message: ${err.message}`, { stack: err.stack });
        throw err; // This helps in testing to verify failures
    }
}

/**
 * Kafka Consumer Setup
 */
export async function consumeInventoryUpdates() {
    try {
        await consumer.connect();
        logger.info("Kafka consumer connected for inventory updates");

        await consumer.subscribe({ topic: INVENTORY_UPDATES, fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const msgValue = message.value?.toString();
                await processInventoryMessage(msgValue || "");
            },
        });
    } catch (err: any) {
        logger.error(`Failed to start Kafka consumer: ${err.message}`, { stack: err.stack });
    }
}
