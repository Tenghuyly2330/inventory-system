import prisma from "../config/database.js";

export const getCategories = async () => {
      return await prisma.category.findMany({
            include: {
                  _count: {
                        select: { products: true }
                  }
            },
            orderBy: { createdAt: "desc" }
      });
};

export const getCategoryById = async (id) => {
      const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
                  _count: {
                        select: { products: true }
                  }
            }
      });

      if (!category) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
      }

      return category;
};

export const createCategory = async ({ name, description }) => {
      if (!name) {
            const error = new Error("Category name is required");
            error.statusCode = 400;
            throw error;
      }

      const existing = await prisma.category.findUnique({
            where: { name }
      });

      if (existing) {
            const error = new Error("Category with this name already exists");
            error.statusCode = 409;
            throw error;
      }

      return await prisma.category.create({
            data: { name, description }
      });
};

export const updateCategory = async (id, { name, description }) => {
      const catId = parseInt(id);
      const category = await prisma.category.findUnique({ where: { id: catId } });

      if (!category) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
      }

      if (name && name !== category.name) {
            const existing = await prisma.category.findUnique({ where: { name } });
            if (existing) {
                  const error = new Error("Category with this name already exists");
                  error.statusCode = 409;
                  throw error;
            }
      }

      return await prisma.category.update({
            where: { id: catId },
            data: {
                  ...(name && { name }),
                  ...(description !== undefined && { description })
            }
      });
};

export const deleteCategory = async (id) => {
      const catId = parseInt(id);
      const category = await prisma.category.findUnique({
            where: { id: catId },
            include: {
                  _count: {
                        select: { products: true }
                  }
            }
      });

      if (!category) {
            const error = new Error("Category not found");
            error.statusCode = 404;
            throw error;
      }

      if (category._count.products > 0) {
            const error = new Error("Cannot delete category with associated products");
            error.statusCode = 400;
            throw error;
      }

      await prisma.category.delete({ where: { id: catId } });
      return { message: "Category deleted successfully" };
};
