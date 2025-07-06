import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (method === 'GET') {
    try {
      const product = await prisma.products.findUnique({
        where: { id },
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // ✅ แปลง pictures จาก JSON string เป็น Array (ถ้าจำเป็น)
      if (typeof product.pictures === 'string') {
        try {
          product.pictures = JSON.parse(product.pictures);
        } catch (error) {
          console.error("Error parsing pictures:", error);
          product.pictures = [product.pictures];
        }
      }

      res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Error fetching product', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
