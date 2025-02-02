import { consumer } from "../config/kafka.config";
import logger from "../utils/logger";
import InventoryService from "../services/inventory.service";
import { KAFKA_CONSTANTS } from "../constants/kafka.contants";
import { ALLOWED_RETRIES } from "../constants/common.constants";

const { TOPICS: { INVENTORY_UPDATES, ORDER_UPDATE, LOW_STOCK_ALERTS }, EVENT_TYPES: { STOCK_UPDATE, ORDER_PLACED } } = KAFKA_CONSTANTS;

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
    let retries = ALLOWED_RETRIES;
    while (retries > 0) {
        try {
            await consumer.connect();
            logger.info("Kafka consumer connected for inventory updates");
            await Promise.all([
                consumer.subscribe({ topic: INVENTORY_UPDATES, fromBeginning: true }),
                // consumer.subscribe({ topic: LOW_STOCK_ALERTS, fromBeginning: true }),
                // consumer.subscribe({ topic: ORDER_UPDATE, fromBeginning: true })
            ]);

            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const msgValue = message.value?.toString();
                    await processInventoryMessage(msgValue || "");
                },
            });
            break; // Exit loop if successful
        } catch (err: any) {
            retries -= 1;
            logger.error(`Failed to start Kafka consumer: ${err.message}. Retries left: ${retries}`, { stack: err.stack });
            if (retries === 0) {
                throw err; // Rethrow error if no retries left
            }
        }
    }
}
