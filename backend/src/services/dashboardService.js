import prisma from "../config/database.js";

export const getDashboardStats = async () => {
      const [totalProducts, totalCategories, totalSuppliers, products, recentMovements] = await Promise.all([
            prisma.product.count(),
            prisma.category.count(),
            prisma.supplier.count(),
            prisma.product.findMany({ select: { quantity: true, minimumStock: true } }),
            prisma.stockMovement.findMany({
                  take: 5,
                  orderBy: { createdAt: "desc" },
                  include: {
                        product: { select: { id: true, name: true, sku: true } },
                        supplier: { select: { id: true, name: true } },
                        user: { select: { id: true, name: true } }
                  }
            })
      ]);

      const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
      const lowStockProducts = products.filter(p => p.quantity <= p.minimumStock).length;

      return {
            totalProducts,
            totalCategories,
            totalSuppliers,
            totalStock,
            lowStockProducts,
            recentMovements
      };
};
