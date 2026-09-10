import bcrypt from "bcryptjs";
import prisma from "../config/database.js";
import { generateToken } from "../utils/generateToken.js";

export const loginUser = async (email, password) => {
      if (!email || !password) {
            const error = new Error("Please provide email and password");
            error.statusCode = 400;
            throw error;
      }

      const user = await prisma.user.findUnique({
            where: { email }
      });

      if (!user) {
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            throw error;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
            const error = new Error("Invalid email or password");
            error.statusCode = 401;
            throw error;
      }

      const token = generateToken(user.id);

      return {
            user: {
                  id: user.id,
                  name: user.name,
                  email: user.email
            },
            token
      };
};

export const getCurrentUser = async (userId) => {
      const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                  id: true,
                  name: true,
                  email: true,
                  createdAt: true,
                  updatedAt: true
            }
      });

      if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
      }

      return user;
};