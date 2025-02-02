import { Request, Response } from "express";
import InventoryService from "../services/inventory.service";
import { StatusCodes } from "http-status-codes";

class InventoryController {

  static async getStockLevels(request: Request, response: Response) {

    try {
      const { productId } = request.params;
      const quantity = await InventoryService.getStock(productId);

      response.status(StatusCodes.OK).json({ productId, quantity });
    } catch (error: any) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }

  }

  static async updateStock(request: Request, response: Response) {
    try {
      const { productId, quantity, timestamp } = request.body;
      const updatedStock = await InventoryService.updateStock(productId, quantity, timestamp);

      response.status(StatusCodes.OK).json(updatedStock);
    } catch (error: any) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

}

export default InventoryController;
