import { Request, Response } from "express";
import InventoryService from "../services/inventory.service";
import { StatusCodes } from "http-status-codes";

class InventoryController {

  static async getStockLevels(request: Request, response: Response) {

    try {
      const { productId } = request.params;
      const stock = await InventoryService.getStock(productId);

      response.status(StatusCodes.OK).json({ productId, stock });
    } catch (error: any) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }

  }

  static async updateStock(request: Request, response: Response) {
    try {
      const { productId, quantity } = request.body;
      const updatedStock = await InventoryService.updateStock(productId, quantity);

      response.status(StatusCodes.OK).json(updatedStock);
    } catch (error: any) {
      response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

}

export default InventoryController;
