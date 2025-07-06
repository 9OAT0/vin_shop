import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

export default async function handler(req, res) {
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

  const userId = userPayload.id;

  if (req.method === 'GET') {
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          products: {
            include: { product: true },
          },
        },
      });

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found.' });
      }

      const productsWithDetails = cart.products.map(cp => ({
        id: cp.id,
        productId: cp.productId,
        productName: cp.product?.name || 'Unnamed Product',
        firstPicture: cp.product?.pictures[0] || null,
      }));

      res.status(200).json({
        cartId: cart.id,
        userId: cart.userId,
        totalProducts: productsWithDetails.length,
        products: productsWithDetails,
      });
    } catch (error) {
      console.error('❌ Error fetching cart:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  else if (req.method === 'DELETE') {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required in request body.' });
    }

    try {
      const cart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found.' });
      }

      const cartProduct = await prisma.cartProduct.findFirst({
        where: {
          cartId: cart.id,
          productId: productId,
        },
      });

      if (!cartProduct) {
        return res.status(404).json({ error: 'Cart product not found.' });
      }

      await prisma.cartProduct.delete({
        where: { id: cartProduct.id },
      });

      console.log(`✅ Deleted product ${productId} from cart ${cart.id}`);
      return res.status(204).end();
    } catch (error) {
      console.error('❌ Error deleting product from cart:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}