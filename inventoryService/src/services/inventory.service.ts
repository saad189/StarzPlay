import { Inventory } from '../models/inventory.model';
import redisClient from "../config/redis.config";
import logger from '../utils/logger';
import { producer } from '../config/kafka.config';
import { KAFKA_CONSTANTS } from '../constants/kafka.contants';
import { ALLOWED_CONCURRENCY_RETRIES, LOW_STOCK_THRESHOLD } from '../constants/common.constants';

const { TOPICS: { LOW_STOCK_ALERTS, ORDER_UPDATE }, EVENT_TYPES: { LOW_STOCK, ORDER_PROCESSED } } = KAFKA_CONSTANTS;
class InventoryService {

  private static getRedisKey(productId: string) {
    return `stock:${productId}`;
  }

  static async getStock(productId: string) {

    try {
      const key = this.getRedisKey(productId);

      const cachedStock = await redisClient.get(key);
      if (cachedStock !== null) return parseInt(cachedStock, 10);

      const stock = await Inventory.findByPk(productId);
      const quantity = stock ? stock.quantity : 0;

      await redisClient.set(key, quantity);

      return quantity;

    } catch (error: any) {
      logger.error(`Error getting stock: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }

  private static async sendLowStockWarning(productId: string, quantity: number) {
    if (!producer) throw new Error('Producer not connected.');

    await producer.send({
      topic: LOW_STOCK_ALERTS,
      messages: [{ value: JSON.stringify({ productId, quantity, eventType: LOW_STOCK }) }]
    });
    logger.warn(`Low stock alert for productId=${productId}, remaining quantity=${quantity}`);

  }

  static async updateStock(productId: string, quantity: number, timestamp: string) {
    try {
      const key = this.getRedisKey(productId);
      await redisClient.set(key, quantity);

      // Db Sync
      Inventory.update({ quantity, timestamp: new Date(timestamp) }, { where: { productId } })
        .catch(err => logger.error(`DB update error: ${err.message}`));


      logger.info(`Updated stock for productId=${productId} to quantity=${quantity} at ${timestamp}`);

      if (quantity < LOW_STOCK_THRESHOLD) await this.sendLowStockWarning(productId, quantity);

      return { productId, quantity, timestamp };
    }
    catch (error: any) {
      logger.error(`Error updating stock: ${error.message}`, { stack: error.stack });
      throw error;
    }

  }

  static async processOrder(productId: string, quantity: number, timestamp: string) {
    const key = this.getRedisKey(productId);

    let isLowStock = false;

    for (let i = 0; i < ALLOWED_CONCURRENCY_RETRIES; ++i) {
      try {

        await redisClient.watch(key);

        const currentStockString = await redisClient.get(key);
        const currentStock = currentStockString ? parseInt(currentStockString, 10) : 0;

        // Stock Not Available
        if (currentStock < quantity) {
          isLowStock = true;
          await redisClient.unwatch();
          throw new Error(`Not enough stock for productId=${productId}`);
        }

        // Decrement Stock
        const multi = redisClient.multi();
        multi.decrBy(key, quantity);
        const execResult = await multi.exec();

        // If concurrency conflict, stop the current iteration
        if (execResult == null) continue;

        // Transaction succeeded; execResult contains results of each queued command
        const newStock = execResult[0] as number; // result of DECRBY

        logger.info(`Processed order for productId=${productId}, remaining quantity=${newStock}`);

        if (newStock < LOW_STOCK_THRESHOLD) {
          await this.sendLowStockWarning(productId, newStock);
        }

        Inventory.update(
          { quantity: newStock, timestamp: new Date(timestamp) },
          { where: { productId } }
        ).catch(err => logger.error(`DB update error: ${err.message}`));

        await producer.send({
          topic: ORDER_UPDATE,
          messages: [{ value: JSON.stringify({ productId, quantity, eventType: ORDER_PROCESSED }) }]
        });

        return { productId, quantity: newStock, timestamp };

      }

      catch (error: any) {

        if (isLowStock) {
          logger.error(`Error processing order: ${error.message}`, { stack: error.stack });
          throw error;
        }
        logger.warn(`Retrying processOrder due to concurrency conflict. Retries left: ${ALLOWED_CONCURRENCY_RETRIES - (i + 1)}. Error: ${error.message}`);

      }
    }

    throw new Error(`Transaction failed for productId=${productId} after multiple retries.`);

  }
}

export default InventoryService;