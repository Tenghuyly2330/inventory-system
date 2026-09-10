import * as categoryService from "../services/categoryService.js";

export const getCategories = async (req, res, next) => {
      try {
            const data = await categoryService.getCategories();
            res.status(200).json({ success: true, data });
      } catch (error) {
            next(error);
      }
};

export const getCategoryById = async (req, res, next) => {
      try {
            const data = await categoryService.getCategoryById(req.params.id);
            res.status(200).json({ success: true, data });
      } catch (error) {
            next(error);
      }
};

export const createCategory = async (req, res, next) => {
      try {
            const data = await categoryService.createCategory(req.body);
            res.status(201).json({ success: true, message: "Category created successfully", data });
      } catch (error) {
            next(error);
      }
};

export const updateCategory = async (req, res, next) => {
      try {
            const data = await categoryService.updateCategory(req.params.id, req.body);
            res.status(200).json({ success: true, message: "Category updated successfully", data });
      } catch (error) {
            next(error);
      }
};

export const deleteCategory = async (req, res, next) => {
      try {
            const result = await categoryService.deleteCategory(req.params.id);
            res.status(200).json({ success: true, message: result.message });
      } catch (error) {
            next(error);
      }
};
