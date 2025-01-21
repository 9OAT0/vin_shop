// pages/api/getCart.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
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
}