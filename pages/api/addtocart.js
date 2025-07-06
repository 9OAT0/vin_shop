import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  let userPayload;
  try {
    userPayload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('❌ Error verifying token:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const userId = userPayload.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const product = await prisma.products.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {
        products: {
          create: {
            productId,
            productName: product.name,
            firstPicture: product.pictures[0] || null,
          },
        },
      },
      create: {
        userId,
        products: {
          create: {
            productId,
            productName: product.name,
            firstPicture: product.pictures[0] || null,
          },
        },
      },
      include: { products: true },
    });

    res.status(201).json({ message: 'Product added to cart', cart });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart', details: error.message });
  }
}
