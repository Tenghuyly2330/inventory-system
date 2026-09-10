import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/image", protect, upload.single("image"), async (req, res, next) => {
      try {
            if (!req.file) {
                  return res.status(400).json({ success: false, message: "No image file provided" });
            }

            // convert buffer to base64
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;

            const result = await cloudinary.uploader.upload(dataURI, {
                  folder: "inventory-products",
            });

            res.status(200).json({
                  success: true,
                  message: "Image uploaded successfully",
                  url: result.secure_url,
            });
      } catch (error) {
            next(error);
      }
});

export default router;
