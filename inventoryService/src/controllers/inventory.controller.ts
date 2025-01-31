import { Request, Response } from "express";
import InventoryService from "../services/inventory.service";

class InventoryController {

  static async getStockLevels(request: Request, response: Response) {

    const { productId } = request.params;
    const stock = await InventoryService.getStock(productId);

    response.json({ productId, stock });
  }

  static async updateStock(request: Request, response: Response) {

    const { productId, quantity } = request.body;
    const updatedStock = await InventoryService.updateStock(productId, quantity);

    response.json(updatedStock);
  }
}

export default InventoryController;
