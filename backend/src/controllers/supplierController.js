import * as supplierService from "../services/supplierService.js";

export const getSuppliers = async (req, res, next) => {
      try {
            const data = await supplierService.getSuppliers();
            res.status(200).json({ success: true, data });
      } catch (error) {
            next(error);
      }
};

export const getSupplierById = async (req, res, next) => {
      try {
            const data = await supplierService.getSupplierById(req.params.id);
            res.status(200).json({ success: true, data });
      } catch (error) {
            next(error);
      }
};

export const createSupplier = async (req, res, next) => {
      try {
            const data = await supplierService.createSupplier(req.body);
            res.status(201).json({ success: true, message: "Supplier created successfully", data });
      } catch (error) {
            next(error);
      }
};

export const updateSupplier = async (req, res, next) => {
      try {
            const data = await supplierService.updateSupplier(req.params.id, req.body);
            res.status(200).json({ success: true, message: "Supplier updated successfully", data });
      } catch (error) {
            next(error);
      }
};

export const deleteSupplier = async (req, res, next) => {
      try {
            const result = await supplierService.deleteSupplier(req.params.id);
            res.status(200).json({ success: true, message: result.message });
      } catch (error) {
            next(error);
      }
};
