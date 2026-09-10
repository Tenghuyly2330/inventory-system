import express from "express";
import {
      getProducts,
      getProductById,
      createProduct,
      updateProduct,
      deleteProduct
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
      .get(getProducts)
      .post(createProduct);

router.route("/:id")
      .get(getProductById)
      .put(updateProduct)
      .delete(deleteProduct);

export default router;
