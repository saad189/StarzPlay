import { StockModel } from '../models/stock.model';
import { redis } from "../config/redis.config";


class InventoryService {

  static async getStock(productId: string) {

    const cachedStock = await redis.get(`stock:${productId}`);
    if (cachedStock !== null) return parseInt(cachedStock, 10);

    const stock = await StockModel.findByPk(productId);
    return stock ? stock.quantity : 0;
  }

  static async updateStock(productId: number, quantity: number) {
    await StockModel.upsert({ productId, quantity });
    await redis.set(`stock:${productId}`, quantity);
    return { productId, quantity };
  }
}

export default InventoryService;