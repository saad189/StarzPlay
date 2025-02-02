import { Inventory } from '../models/inventory.model';
import redisClient from "../config/redis.config";
import logger from '../utils/logger';
import { producer } from '../config/kafka.config';
import { KAFKA_CONSTANTS } from '../constants/kafka.contants';
import { LOW_STOCK_THRESHOLD } from '../constants/common.constants';

const { TOPICS: { LOW_STOCK_ALERTS, ORDER_UPDATE }, EVENT_TYPES: { LOW_STOCK, ORDER_PROCESSED } } = KAFKA_CONSTANTS;
class InventoryService {

  static async getStock(productId: string) {

    try {
      const cachedStock = await redisClient.get(`stock:${productId}`);
      if (cachedStock !== null) return parseInt(cachedStock, 10);

      const stock = await Inventory.findByPk(productId);
      const quantity = stock ? stock.quantity : 0;

      await redisClient.set(`stock:${productId}`, quantity);

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

      const [updatedCount] = await Inventory.update({ quantity, timestamp: new Date(timestamp) }, { where: { productId } });
      if (updatedCount == 0) throw new Error(`Product ${productId} not found`);

      await redisClient.set(`stock:${productId}`, quantity);
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
    try {
      const currentStock = await this.getStock(productId);

      if (currentStock < quantity) throw new Error(`Insufficient stock for productId=${productId}`);

      const updatedStock = await this.updateStock(productId, currentStock - quantity, timestamp);
      logger.info(`Processed order for productId=${productId}, remaining quantity=${updatedStock.quantity}`);

      await producer.send({
        topic: ORDER_UPDATE,
        messages: [{ value: JSON.stringify({ productId, quantity, eventType: ORDER_PROCESSED }) }]
      });

      return updatedStock;

    } catch (error: any) {
      logger.error(`Error processing order: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }
}

export default InventoryService;