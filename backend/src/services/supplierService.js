import prisma from "../config/database.js";

export const getSuppliers = async () => {
      return await prisma.supplier.findMany({
            orderBy: { createdAt: "desc" }
      });
};

export const getSupplierById = async (id) => {
      const supplier = await prisma.supplier.findUnique({
            where: { id: parseInt(id) }
      });

      if (!supplier) {
            const error = new Error("Supplier not found");
            error.statusCode = 404;
            throw error;
      }

      return supplier;
};

export const createSupplier = async ({ name, phone, email, address }) => {
      if (!name) {
            const error = new Error("Supplier name is required");
            error.statusCode = 400;
            throw error;
      }

      return await prisma.supplier.create({
            data: { name, phone, email, address }
      });
};

export const updateSupplier = async (id, data) => {
      const supplierId = parseInt(id);
      const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });

      if (!supplier) {
            const error = new Error("Supplier not found");
            error.statusCode = 404;
            throw error;
      }

      const { name, phone, email, address } = data;

      return await prisma.supplier.update({
            where: { id: supplierId },
            data: {
                  ...(name && { name }),
                  ...(phone !== undefined && { phone }),
                  ...(email !== undefined && { email }),
                  ...(address !== undefined && { address })
            }
      });
};

export const deleteSupplier = async (id) => {
      const supplierId = parseInt(id);
      const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });

      if (!supplier) {
            const error = new Error("Supplier not found");
            error.statusCode = 404;
            throw error;
      }

      await prisma.supplier.delete({ where: { id: supplierId } });
      return { message: "Supplier deleted successfully" };
};
