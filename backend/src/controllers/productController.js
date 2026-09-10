import * as productService from "../services/productService.js";

export const getProducts = async (req, res, next) => {
      try {
            const { search, categoryId } = req.query;
            const data = await productService.getProducts({ search, categoryId });
            res.status(200).json({ success: true, data });
      } catch (error) {
            next(error);
      }
};

export const getProductById = async (req, res, next) => {
      try {
            const data = await productService.getProductById(req.params.id);
            res.status(200).json({ success: true, data });
      } catch (error) {
            next(error);
      }
};

export const createProduct = async (req, res, next) => {
      try {
            const data = await productService.createProduct(req.body);
            res.status(201).json({ success: true, message: "Product created successfully", data });
      } catch (error) {
            next(error);
      }
};

export const updateProduct = async (req, res, next) => {
      try {
            const data = await productService.updateProduct(req.params.id, req.body);
            res.status(200).json({ success: true, message: "Product updated successfully", data });
      } catch (error) {
            next(error);
      }
};

export const deleteProduct = async (req, res, next) => {
      try {
            const result = await productService.deleteProduct(req.params.id);
            res.status(200).json({ success: true, message: result.message });
      } catch (error) {
            next(error);
      }
};
