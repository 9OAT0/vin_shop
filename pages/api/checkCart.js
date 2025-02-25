// pages/api/checkCart.js
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  await authenticateToken(req, res, async() => {
  if (req.method === 'GET') {
    const { userId } = req.query;

    try {
      const cartItems = await prisma.cartProduct.findMany({
        where: {
          cart: {
            userId: userId,
          },
        },
      });

      res.status(200).json(cartItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching cart items' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
}