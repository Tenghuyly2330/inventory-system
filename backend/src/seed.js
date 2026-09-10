import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./config/database.js";

const seedDatabase = async () => {
      try {
            console.log("Seeding database...");

            // 1. Seed Admin User
            const adminEmail = "admin@example.com";
            const adminPassword = "admin123";

            let admin = await prisma.user.findUnique({
                  where: { email: adminEmail }
            });

            if (!admin) {
                  const hashedPassword = await bcrypt.hash(adminPassword, 10);
                  admin = await prisma.user.create({
                        data: {
                              name: "Admin",
                              email: adminEmail,
                              password: hashedPassword
                        }
                  });
                  console.log("Admin user created: admin@example.com / admin123");
            } else {
                  console.log("Admin user already exists");
            }

            // 2. Seed Sample Categories
            const categoriesData = [
                  { name: "Electronics", description: "Electronic devices and gadgets" },
                  { name: "Office Supplies", description: "Stationery, paper, and office accessories" },
                  { name: "Furniture", description: "Office and home furniture" },
                  { name: "Accessories", description: "Computer and tech accessories" }
            ];

            const categoryMap = {};
            for (const cat of categoriesData) {
                  const category = await prisma.category.upsert({
                        where: { name: cat.name },
                        update: {},
                        create: cat
                  });
                  categoryMap[cat.name] = category.id;
            }
            console.log("Categories seeded successfully.");

            // 3. Seed Sample Suppliers
            const suppliersData = [
                  { name: "ABC Supplier", phone: "+1 555-0101", email: "info@abcsupplier.com", address: "123 Tech Lane, NY" },
                  { name: "Global Electronics", phone: "+1 555-0102", email: "sales@globalelectronics.com", address: "456 Commerce Blvd, CA" },
                  { name: "Office Supply Co.", phone: "+1 555-0103", email: "contact@officesupply.com", address: "789 Industrial Pkwy, TX" }
            ];

            const suppliers = [];
            for (const sup of suppliersData) {
                  const existing = await prisma.supplier.findFirst({ where: { name: sup.name } });
                  if (!existing) {
                        const created = await prisma.supplier.create({ data: sup });
                        suppliers.push(created);
                  } else {
                        suppliers.push(existing);
                  }
            }
            console.log("Suppliers seeded successfully.");

            // 4. Seed Sample Products
            const productsData = [
                  { name: "Laptop", sku: "ELE-LAP-001", categoryName: "Electronics", price: 1200.00, quantity: 20, minimumStock: 5, description: "High performance workstation laptop" },
                  { name: "Mouse", sku: "ACC-MOU-002", categoryName: "Accessories", price: 25.00, quantity: 50, minimumStock: 10, description: "Ergonomic wireless mouse" },
                  { name: "Keyboard", sku: "ACC-KEY-003", categoryName: "Accessories", price: 45.00, quantity: 30, minimumStock: 8, description: "Mechanical RGB keyboard" },
                  { name: "Monitor", sku: "ELE-MON-004", categoryName: "Electronics", price: 300.00, quantity: 4, minimumStock: 5, description: "27-inch 4K Ultra HD Monitor" },
                  { name: "Office Chair", sku: "FUR-CHA-005", categoryName: "Furniture", price: 180.00, quantity: 12, minimumStock: 3, description: "Breathable mesh executive chair" },
                  { name: "Desk", sku: "FUR-DES-006", categoryName: "Furniture", price: 250.00, quantity: 2, minimumStock: 5, description: "Adjustable height standing desk" }
            ];

            for (const prod of productsData) {
                  const { categoryName, ...prodFields } = prod;
                  const categoryId = categoryMap[categoryName];

                  await prisma.product.upsert({
                        where: { sku: prodFields.sku },
                        update: {},
                        create: {
                              ...prodFields,
                              categoryId
                        }
                  });
            }
            console.log("Products seeded successfully.");
            console.log("Database seeding completed!");
      } catch (error) {
            console.error("Error seeding database:", error);
      } finally {
            await prisma.$disconnect();
      }
};

seedDatabase();
