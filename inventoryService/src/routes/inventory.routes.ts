import { Router } from "express";
import InventoryController from "../controllers/inventory.controller";


const router = Router();


router.get("/stock-levels/:productId", InventoryController.getStockLevels);
router.put("/update-stock", InventoryController.updateStock);

export default router;
