import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const {
    query: { id }, // userId ที่มาจาก query params
  } = req;

  if (req.method === 'GET') {
    if (!id) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
      // ค้นหา cart ตาม userId
      const cart = await prisma.cart.findUnique({
        where: {
          userId: id,
        },
        include: {
          products: { // ค้นหา CartProduct ที่เชื่อมโยง
            include: {
              product: true, // ดึงข้อมูลผลิตภัณฑ์ที่เชื่อมโยง
            },
          },
        },
      });

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found for this user.' });
      }

      const productDetails = cart.products.map(cp => cp.product);

      res.status(200).json(productDetails);
    } catch (error) {
      console.error('Error fetching cart:', error.message);
      res.status(500).json({ error: 'Error fetching cart', details: error.message });
    } finally {
      await prisma.$disconnect(); // ปิดการเชื่อมต่อ
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}