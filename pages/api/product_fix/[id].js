import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../CouldinaryConfig";  // ✅ ใช้ Named Import ที่ถูกต้อง
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../auth";

const prisma = new PrismaClient();

// ✅ ตั้งค่า `multer-storage-cloudinary`
const storage = new CloudinaryStorage({
  cloudinary,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params: async (req, file) => {
    const { name } = req.body || { name: "unknown" };
    const timestamp = Date.now();
    return {
      folder: "products",
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: `${name}_${timestamp}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ จำกัดขนาด 5MB
});

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  try {
    await authenticateToken(req, res, async () => {
      const { method } = req;
      const { id } = req.query; // ✅ ใช้ `String` ตรงๆ ไม่ต้องแปลงเป็น `Int`

      if (method === "GET") {
        try {
          const product = await prisma.products.findUnique({ where: { id } });

          // ✅ ป้องกัน error หาก `pictures` เป็น `null` หรือ `String` ตรงๆ
          if (product && typeof product.pictures === "string") {
            try {
              product.pictures = JSON.parse(product.pictures); // ✅ แปลง `JSON String` เป็น `Array`
            } catch (error) {
              console.error("❌ Failed to parse pictures JSON:", error.message);
              product.pictures = [product.pictures]; // ✅ ถ้า error ให้เก็บรูปใน Array
            }
          }

          res.status(200).json(product);
        } catch (error) {
          console.error("❌ Error fetching product:", error.message);
          return res.status(500).json({ error: "Error fetching product", details: error.message });
        } finally {
          await prisma.$disconnect();
        }
      }

      else if (method === "PUT") {
        upload.array("pictures", 5)(req, res, async (err) => {
          if (err) {
            console.error("❌ Error uploading file:", err.message);
            return res.status(400).json({ error: "Error uploading file: " + err.message });
          }

          const { name, price, size, description } = req.body;
          let pictures = [];

          if (req.files && req.files.length > 0) {
            pictures = req.files.map((file) => file.path); // ✅ ได้ URL ของรูปภาพจาก Cloudinary
          }

          try {
            const existingProduct = await prisma.products.findUnique({ where: { id } });

            if (!existingProduct) {
              console.error("❌ Product not found:", id);
              return res.status(404).json({ error: "Product not found" });
            }

            // ✅ ถ้าไม่มีการอัปโหลดรูปใหม่ ให้ใช้รูปเก่า
            if (pictures.length === 0 && existingProduct.pictures) {
              pictures = JSON.parse(existingProduct.pictures);
            }

            const updatedProduct = await prisma.products.update({
              where: { id },
              data: {
                name,
                price: parseFloat(price),
                size,
                description,
                pictures: Array.isArray(pictures) ? pictures : JSON.parse(pictures), // ✅ แปลงเป็น `String[]`
              },
            });
            

            res.status(200).json(updatedProduct);
          } catch (error) {
            console.error("❌ Error updating product:", error.message);
            return res.status(500).json({ error: "Error updating product", details: error.message });
          }
        });
      }

      else if (method === "DELETE") {
        try {
          const deletedProduct = await prisma.products.delete({
            where: { id },
          });

          res.status(200).json({ message: "✅ Product deleted successfully", deletedProduct });
        } catch (error) {
          console.error("❌ Error deleting product:", error.message);
          return res.status(500).json({ error: "Error deleting product", details: error.message });
        } finally {
          await prisma.$disconnect();
        }
      }

      else {
        return res.status(405).json({ error: "Method Not Allowed" });
      }
    });
  } catch (error) {
    console.error("❌ API Handler Error:", error.message);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}
