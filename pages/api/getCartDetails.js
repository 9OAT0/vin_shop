import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';


const prisma = new PrismaClient();

export default async function handler(req, res) {
  await authenticateToken(req, res, async() => {
  if (req.method === 'GET') {
    const { userId } = req.query;

    try {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          products: true, // รวมข้อมูลผลิตภัณฑ์
        },
      });

      res.status(200).json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching cart details' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
}