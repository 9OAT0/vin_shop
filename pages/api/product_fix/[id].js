import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  const userRole = req.headers['x-user-role'];
  const { method } = req;
  const { id } = req.query;

  if (method === "GET") {
    try {
      const product = await prisma.products.findUnique({ where: { id } });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // ✅ แปลงรูปจาก JSON string เป็น array
      if (typeof product.pictures === "string") {
        try {
          product.pictures = JSON.parse(product.pictures);
        } catch (error) {
          console.error("Error parsing pictures:", error);
          product.pictures = [product.pictures];
        }
      }

      res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Error fetching product", details: error.message });
    }
  }

  else if (method === "PUT") {
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: "Access denied. Only admins can update products." });
    }

    const { name, price, size, description } = req.body;
    const pictures = req.files?.map(file => file.path) || [];

    try {
      const existingProduct = await prisma.products.findUnique({ where: { id } });

      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const updatedProduct = await prisma.products.update({
        where: { id },
        data: {
          name,
          price: parseFloat(price),
          size,
          description,
          pictures: pictures.length > 0 ? pictures : existingProduct.pictures,
        },
      });

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Error updating product", details: error.message });
    }
  }

  else if (method === "DELETE") {
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: "Access denied. Only admins can delete products." });
    }

    try {
      const deletedProduct = await prisma.products.delete({
        where: { id },
      });

      res.status(200).json({ message: "Product deleted successfully", deletedProduct });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Error deleting product", details: error.message });
    }
  }

  else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}