import prisma from "../config/database.js";

export const stockIn = async ({ productId, supplierId, quantity, note }, userId) => {
      const qty = parseInt(quantity);
      const prodId = parseInt(productId);

      if (!prodId || !qty || qty <= 0) {
            const error = new Error("Valid productId and positive quantity are required");
            error.statusCode = 400;
            throw error;
      }

      return await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({ where: { id: prodId } });
            if (!product) {
                  const error = new Error("Product not found");
                  error.statusCode = 404;
                  throw error;
            }

            let supId = supplierId ? parseInt(supplierId) : null;
            if (supId) {
                  const supplier = await tx.supplier.findUnique({ where: { id: supId } });
                  if (!supplier) {
                        const error = new Error("Supplier not found");
                        error.statusCode = 404;
                        throw error;
                  }
            }

            const updatedProduct = await tx.product.update({
                  where: { id: prodId },
                  data: { quantity: product.quantity + qty }
            });

            const movement = await tx.stockMovement.create({
                  data: {
                        productId: prodId,
                        supplierId: supId,
                        type: "IN",
                        quantity: qty,
                        note,
                        createdBy: userId
                  },
                  include: {
                        product: { select: { name: true, sku: true } },
                        supplier: { select: { name: true } },
                        user: { select: { name: true, email: true } }
                  }
            });

            return { product: updatedProduct, movement };
      });
};

export const stockOut = async ({ productId, quantity, note }, userId) => {
      const qty = parseInt(quantity);
      const prodId = parseInt(productId);

      if (!prodId || !qty || qty <= 0) {
            const error = new Error("Valid productId and positive quantity are required");
            error.statusCode = 400;
            throw error;
      }

      return await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({ where: { id: prodId } });
            if (!product) {
                  const error = new Error("Product not found");
                  error.statusCode = 404;
                  throw error;
            }

            if (qty > product.quantity) {
                  const error = new Error("Not enough stock");
                  error.statusCode = 400;
                  throw error;
            }

            const updatedProduct = await tx.product.update({
                  where: { id: prodId },
                  data: { quantity: product.quantity - qty }
            });

            const movement = await tx.stockMovement.create({
                  data: {
                        productId: prodId,
                        type: "OUT",
                        quantity: qty,
                        note,
                        createdBy: userId
                  },
                  include: {
                        product: { select: { name: true, sku: true } },
                        user: { select: { name: true, email: true } }
                  }
            });

            return { product: updatedProduct, movement };
      });
};

export const stockAdjustment = async ({ productId, newQuantity, note }, userId) => {
      const prodId = parseInt(productId);
      const targetQty = parseInt(newQuantity);

      if (!prodId || targetQty < 0 || isNaN(targetQty)) {
            const error = new Error("Valid productId and non-negative newQuantity are required");
            error.statusCode = 400;
            throw error;
      }

      return await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({ where: { id: prodId } });
            if (!product) {
                  const error = new Error("Product not found");
                  error.statusCode = 404;
                  throw error;
            }

            const diff = targetQty - product.quantity;

            const updatedProduct = await tx.product.update({
                  where: { id: prodId },
                  data: { quantity: targetQty }
            });

            const movement = await tx.stockMovement.create({
                  data: {
                        productId: prodId,
                        type: "ADJUSTMENT",
                        quantity: Math.abs(diff),
                        note: note ? `${note} (Change: ${diff >= 0 ? "+" : ""}${diff})` : `Adjusted quantity from ${product.quantity} to ${targetQty}`,
                        createdBy: userId
                  },
                  include: {
                        product: { select: { name: true, sku: true } },
                        user: { select: { name: true, email: true } }
                  }
            });

            return { product: updatedProduct, movement };
      });
};

export const updateOrder = async ({ orderId, cart, note }, userId) => {
      if (!orderId || !Array.isArray(cart) || cart.length === 0) {
            const error = new Error("Order ID and non-empty cart items are required.");
            error.statusCode = 400;
            throw error;
      }

      return await prisma.$transaction(async (tx) => {
            // 1. Find existing stock movements for this order ID
            const existingMovements = await tx.stockMovement.findMany({
                  where: {
                        note: {
                              contains: `[Order #${orderId}]`
                        }
                  }
            });

            // 2. Restore stock for products in existing movements
            for (const mov of existingMovements) {
                  if (mov.type === "OUT") {
                        await tx.product.update({
                              where: { id: mov.productId },
                              data: {
                                    quantity: {
                                          increment: mov.quantity
                                    }
                              }
                        });
                  }
            }

            // 3. Delete old movements for this order
            if (existingMovements.length > 0) {
                  await tx.stockMovement.deleteMany({
                        where: {
                              id: {
                                    in: existingMovements.map((m) => m.id)
                              }
                        }
                  });
            }

            // 4. Process updated cart items
            const createdMovements = [];
            for (const item of cart) {
                  const prodId = parseInt(item.productId || item.product?.id);
                  const qty = parseInt(item.qty || item.quantity);

                  const product = await tx.product.findUnique({ where: { id: prodId } });
                  if (!product) {
                        const error = new Error(`Product ID ${prodId} not found.`);
                        error.statusCode = 404;
                        throw error;
                  }

                  if (qty > product.quantity) {
                        const error = new Error(`Not enough stock for "${product.name}". Available stock after restoration: ${product.quantity}.`);
                        error.statusCode = 400;
                        throw error;
                  }

                  const updatedProduct = await tx.product.update({
                        where: { id: prodId },
                        data: { quantity: product.quantity - qty }
                  });

                  const movement = await tx.stockMovement.create({
                        data: {
                              productId: prodId,
                              type: "OUT",
                              quantity: qty,
                              note,
                              createdBy: userId
                        },
                        include: {
                              product: { select: { id: true, name: true, sku: true } },
                              user: { select: { id: true, name: true, email: true } }
                        }
                  });

                  createdMovements.push(movement);
            }

            return { orderId, movements: createdMovements };
      });
};

export const getStockHistory = async ({ search, type, productId }) => {
      const where = {};

      if (type) {
            where.type = type;
      }

      if (productId) {
            where.productId = parseInt(productId);
      }

      if (search) {
            where.OR = [
                  { product: { name: { contains: search, mode: "insensitive" } } },
                  { product: { sku: { contains: search, mode: "insensitive" } } },
                  { note: { contains: search, mode: "insensitive" } }
            ];
      }

      return await prisma.stockMovement.findMany({
            where,
            include: {
                  product: { select: { id: true, name: true, sku: true, price: true, quantity: true } },
                  supplier: { select: { id: true, name: true } },
                  user: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: "desc" }
      });
};

export const deleteOrder = async ({ orderId, movementId, userId }) => {
      return await prisma.$transaction(async (tx) => {
            let existingMovements = [];

            if (orderId) {
                  existingMovements = await tx.stockMovement.findMany({
                        where: {
                              note: { contains: `[Order #${orderId}]` }
                        }
                  });
            } else if (movementId) {
                  const m = await tx.stockMovement.findUnique({
                        where: { id: parseInt(movementId) }
                  });
                  if (m) existingMovements = [m];
            }

            if (existingMovements.length === 0) {
                  const error = new Error("No transactions found to delete.");
                  error.statusCode = 404;
                  throw error;
            }

            for (const mov of existingMovements) {
                  const product = await tx.product.findUnique({ where: { id: mov.productId } });
                  if (product) {
                        let restoredQty = product.quantity;
                        if (mov.type === "OUT") {
                              restoredQty += mov.quantity;
                        } else if (mov.type === "IN") {
                              restoredQty = Math.max(0, restoredQty - mov.quantity);
                        }

                        await tx.product.update({
                              where: { id: mov.productId },
                              data: { quantity: restoredQty }
                        });
                  }
            }

            const movementIds = existingMovements.map((m) => m.id);
            await tx.stockMovement.deleteMany({
                  where: { id: { in: movementIds } }
            });

            return { success: true, count: existingMovements.length };
      });
};

export const getLowStockProducts = async () => {
      const products = await prisma.product.findMany({
            include: {
                  category: { select: { id: true, name: true } }
            },
            orderBy: { quantity: "asc" }
      });

      return products.filter(p => p.quantity <= p.minimumStock);
};
