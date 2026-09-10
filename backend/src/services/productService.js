import prisma from "../config/database.js";

export const getProducts = async ({ search, categoryId }) => {
      const where = {};

      if (search) {
            where.OR = [
                  { name: { contains: search, mode: "insensitive" } },
                  { sku: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } }
            ];
      }

      if (categoryId) {
            where.categoryId = parseInt(categoryId);
      }

      const products = await prisma.product.findMany({
            where,
            include: {
                  category: {
                        select: { id: true, name: true }
                  }
            },
            orderBy: { createdAt: "desc" }
      });

      return products.map(product => ({
            ...product,
            status: product.quantity === 0
                  ? "Out of Stock"
                  : product.quantity <= product.minimumStock
                        ? "Low Stock"
                        : "In Stock"
      }));
};

export const getProductById = async (id) => {
      const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                  category: {
                        select: { id: true, name: true }
                  }
            }
      });

      if (!product) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
      }

      return {
            ...product,
            status: product.quantity === 0
                  ? "Out of Stock"
                  : product.quantity <= product.minimumStock
                        ? "Low Stock"
                        : "In Stock"
      };
};

export const createProduct = async (data) => {
      const { categoryId, name, sku, description, price, quantity = 0, minimumStock = 0, imageUrl } = data;

      if (!categoryId || !name || !sku || price === undefined) {
            const error = new Error("categoryId, name, sku, and price are required");
            error.statusCode = 400;
            throw error;
      }

      if (price < 0 || quantity < 0 || minimumStock < 0) {
            const error = new Error("price, quantity, and minimumStock must be non-negative");
            error.statusCode = 400;
            throw error;
      }

      const categoryExists = await prisma.category.findUnique({
            where: { id: parseInt(categoryId) }
      });
      if (!categoryExists) {
            const error = new Error("Category does not exist");
            error.statusCode = 400;
            throw error;
      }

      const existingSku = await prisma.product.findUnique({
            where: { sku }
      });
      if (existingSku) {
            const error = new Error("Product with this SKU already exists");
            error.statusCode = 409;
            throw error;
      }

      return await prisma.product.create({
            data: {
                  categoryId: parseInt(categoryId),
                  name,
                  sku,
                  description,
                  price: parseFloat(price),
                  quantity: parseInt(quantity),
                  minimumStock: parseInt(minimumStock),
                  imageUrl: imageUrl || null
            },
            include: {
                  category: { select: { id: true, name: true } }
            }
      });
};

export const updateProduct = async (id, data) => {
      const productId = parseInt(id);
      const existingProduct = await prisma.product.findUnique({ where: { id: productId } });

      if (!existingProduct) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
      }

      const { categoryId, name, sku, description, price, quantity, minimumStock, imageUrl } = data;

      if (sku && sku !== existingProduct.sku) {
            const duplicateSku = await prisma.product.findUnique({ where: { sku } });
            if (duplicateSku) {
                  const error = new Error("Product with this SKU already exists");
                  error.statusCode = 409;
                  throw error;
            }
      }

      if (categoryId) {
            const categoryExists = await prisma.category.findUnique({ where: { id: parseInt(categoryId) } });
            if (!categoryExists) {
                  const error = new Error("Category does not exist");
                  error.statusCode = 400;
                  throw error;
            }
      }

      if (
            (price !== undefined && price < 0) ||
            (quantity !== undefined && quantity < 0) ||
            (minimumStock !== undefined && minimumStock < 0)
      ) {
            const error = new Error("price, quantity, and minimumStock must be non-negative");
            error.statusCode = 400;
            throw error;
      }

      return await prisma.product.update({
            where: { id: productId },
            data: {
                  ...(categoryId && { categoryId: parseInt(categoryId) }),
                  ...(name && { name }),
                  ...(sku && { sku }),
                  ...(description !== undefined && { description }),
                  ...(price !== undefined && { price: parseFloat(price) }),
                  ...(quantity !== undefined && { quantity: parseInt(quantity) }),
                  ...(minimumStock !== undefined && { minimumStock: parseInt(minimumStock) }),
                  ...(imageUrl !== undefined && { imageUrl: imageUrl || null })
            },
            include: {
                  category: { select: { id: true, name: true } }
            }
      });
};

export const deleteProduct = async (id) => {
      const productId = parseInt(id);
      const product = await prisma.product.findUnique({ where: { id: productId } });

      if (!product) {
            const error = new Error("Product not found");
            error.statusCode = 404;
            throw error;
      }

      await prisma.product.delete({ where: { id: productId } });
      return { message: "Product deleted successfully" };
};
