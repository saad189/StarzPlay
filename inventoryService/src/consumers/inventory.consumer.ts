import { consumer } from "../config/kafka.config";
import logger from "../utils/logger";
import InventoryService from "../services/inventory.service";
import { KAFKA_CONSTANTS } from "../constants/kafka.contants";

const { TOPICS: { INVENTORY_UPDATES }, EVENT_TYPES: { STOCK_UPDATE, ORDER_PLACED } } = KAFKA_CONSTANTS;

export async function consumeInventoryUpdates() {
    try {
        //Connect consumer
        await consumer.connect();
        logger.info("Kafka consumer connected for inventory updates");

        //Subscribe to a topic 
        await consumer.subscribe({ topic: INVENTORY_UPDATES, fromBeginning: true });

        //  Run the consumer logic
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const msgValue = message.value?.toString();
                    if (!msgValue) return;

                    const event = JSON.parse(msgValue);
                    logger.info(`Received message on topic=${topic}: ${msgValue}`);

                    // Destructure & process event
                    const { eventType, productId, quantity } = event;

                    switch (eventType) {
                        case STOCK_UPDATE:
                            await InventoryService.updateStock(productId, quantity);
                            logger.info(`Processed stockUpdate for productId=${productId}, qty=${quantity}`);
                            break;

                        case ORDER_PLACED:
                            await InventoryService.processOrder(productId, quantity);
                            logger.info(`Processed orderPlaced for productId=${productId}, qty=${quantity}`);
                            break;

                        default:
                            logger.warn(`Unknown eventType=${eventType}`);
                            break;
                    }
                } catch (err: any) {
                    logger.error(`Error processing message: ${err.message}`, { stack: err.stack });
                }
            },
        });
    } catch (err: any) {
        logger.error(`Failed to start Kafka consumer: ${err.message}`, { stack: err.stack });
    }
}
