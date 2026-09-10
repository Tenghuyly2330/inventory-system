import * as stockService from "../services/stockService.js";

export const handleStockIn = async (req, res, next) => {
      try {
            const result = await stockService.stockIn(req.body, req.user.id);
            res.status(200).json({
                  success: true,
                  message: "Stock added successfully",
                  data: result
            });
      } catch (error) {
            next(error);
      }
};

export const handleStockOut = async (req, res, next) => {
      try {
            const result = await stockService.stockOut(req.body, req.user.id);
            res.status(200).json({
                  success: true,
                  message: "Stock removed successfully",
                  data: result
            });
      } catch (error) {
            next(error);
      }
};

export const handleUpdateOrder = async (req, res, next) => {
      try {
            const result = await stockService.updateOrder(req.body, req.user.id);
            res.status(200).json({
                  success: true,
                  message: "Order updated successfully",
                  data: result
            });
      } catch (error) {
            next(error);
      }
};

export const handleStockAdjustment = async (req, res, next) => {
      try {
            const result = await stockService.stockAdjustment(req.body, req.user.id);
            res.status(200).json({
                  success: true,
                  message: "Stock adjusted successfully",
                  data: result
            });
      } catch (error) {
            next(error);
      }
};

export const getHistory = async (req, res, next) => {
      try {
            const { search, type, productId } = req.query;
            const data = await stockService.getStockHistory({ search, type, productId });
            res.status(200).json({ success: true, data });
      } catch (error) {
            next(error);
      }
};

export const getLowStock = async (req, res, next) => {
      try {
            const data = await stockService.getLowStockProducts();
            res.status(200).json({ success: true, data });
      } catch (error) {
            next(error);
      }
};

export const handleDeleteOrder = async (req, res, next) => {
      try {
            const result = await stockService.deleteOrder(req.body, req.user.id);
            res.status(200).json({
                  success: true,
                  message: "Order deleted and inventory restored successfully",
                  data: result
            });
      } catch (error) {
            next(error);
      }
};
