import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

export const runtime = 'nodejs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // ✅ ตรวจ JWT จาก Cookie
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please login first.' });
  }

  let userPayload;
  try {
    userPayload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  // ✅ ตรวจ role (เฉพาะ USER เท่านั้น)
  if (userPayload.role !== 'USER') {
    return res.status(403).json({ error: 'Access denied. Only USER can add to cart.' });
  }

  const userId = userPayload.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required.' });
  }

  console.log(`🛒 User ${userId} adding Product ${productId}`);

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { cart: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let cart;

    if (!user.cart) {
      // ✅ Create a new cart if user doesn't have one
      cart = await prisma.cart.create({
        data: {
          userId: userId,
          products: {
            create: {
              productId,
              productName: product.name,
              firstPicture: product.pictures[0] || null,
            },
          },
        },
      });

      return res.status(201).json({ message: 'Cart created and product added', cart });
    } else {
      // ✅ Check if product already exists in cart
      const productExists = await prisma.cartProduct.findFirst({
        where: {
          cartId: user.cart.id,
          productId,
        },
      });

      if (productExists) {
        return res.status(409).json({ error: 'Product already in cart' });
      }

      // ✅ Add product to existing cart
      const cartProduct = await prisma.cartProduct.create({
        data: {
          cartId: user.cart.id,
          productId,
          productName: product.name,
          firstPicture: product.pictures[0] || null,
        },
      });

      return res.status(201).json({ message: 'Product added to cart', cartProduct });
    }
  } catch (error) {
    console.error('❌ Error during add to cart:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}