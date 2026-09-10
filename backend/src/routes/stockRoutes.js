import express from "express";
import {
      handleStockIn,
      handleStockOut,
      handleUpdateOrder,
      handleStockAdjustment,
      handleDeleteOrder,
      getHistory,
      getLowStock
} from "../controllers/stockController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/in", handleStockIn);
router.post("/out", handleStockOut);
router.post("/update-order", handleUpdateOrder);
router.post("/delete-order", handleDeleteOrder);
router.post("/adjustment", handleStockAdjustment);
router.get("/history", getHistory);
router.get("/low-stock", getLowStock);

export default router;
