import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, productId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  if (req.method === 'GET') {
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId: String(userId) },
        include: {
          products: {
            include: {
              product: {
                select: {
                  name: true,
                  pictures: true,
                },
              },
            },
          },
        },
      });

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found.' });
      }

      const productsWithDetails = cart.products.map((cartProduct: { id: any; productId: any; product: { name: any; pictures: any[]; }; }) => ({
        id: cartProduct.id,
        cartId: cart.id,
        productId: cartProduct.productId,
        productName: cartProduct.product?.name || 'Unnamed Product',
        firstPicture: cartProduct.product?.pictures[0] || null,
      }));

      return res.status(200).json({
        id: cart.id,
        userId: cart.userId,
        totalProducts: productsWithDetails.length,
        products: productsWithDetails,
      });
    } catch (error) {
      console.error('Error fetching cart details:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  else if (req.method === 'DELETE') {
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required for deletion.' });
    }

    try {
      const cartProduct = await prisma.cartProduct.findFirst({
        where: {
          cart: { userId: String(userId) },
          productId: String(productId),
        },
      });

      if (!cartProduct) {
        return res.status(404).json({ error: 'Cart product not found.' });
      }

      await prisma.cartProduct.delete({
        where: { id: cartProduct.id },
      });

      return res.status(204).end(); // ✅ No content
    } catch (error) {
      console.error('Error deleting product from cart:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
