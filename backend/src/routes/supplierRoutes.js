import express from "express";
import {
      getSuppliers,
      getSupplierById,
      createSupplier,
      updateSupplier,
      deleteSupplier
} from "../controllers/supplierController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
      .get(getSuppliers)
      .post(createSupplier);

router.route("/:id")
      .get(getSupplierById)
      .put(updateSupplier)
      .delete(deleteSupplier);

export default router;
