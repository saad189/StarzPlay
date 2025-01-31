import { Inventory } from '../models/inventory.model';
import redisClient from "../config/redis.config";

class InventoryService {

  static async getStock(productId: string) {

    const cachedStock = await redisClient.get(`stock:${productId}`);
    if (cachedStock !== null) return parseInt(cachedStock, 10);

    const stock = await Inventory.findByPk(productId);
    return stock ? stock.quantity : 0;
  }

  static async updateStock(productId: string, quantity: number) {
    await Inventory.update({ quantity }, { where: { productId } });

    await redisClient.set(`stock:${productId}`, quantity);
    return { productId, quantity };
  }
}

export default InventoryService;