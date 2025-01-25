import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query; // ใช้ query string

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
      // ค้นหา cart โดยใช้ userId
      const cart = await prisma.cart.findUnique({
        where: {
          userId: userId,
        },
        include: {
          products: { 
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found for this user.' });
      }

      // ดึงข้อมูลผลิตภัณฑ์ใน cart
      const productDetails = cart.products.map(cp => cp.product);

      res.status(200).json(productDetails);
    } catch (error) {
      console.error('Error fetching cart:', error.message);
      res.status(500).json({ error: 'Error fetching cart', details: error.message });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}