// pages/api/addToCart.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, productId } = req.body;

    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { cart: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.cart) {
        // สร้าง Cart ใหม่
        const newCart = await prisma.cart.create({
          data: {
            userId: userId,
            products: {
              create: {
                productId: productId,
              },
            },
          },
        });
        return res.status(201).json(newCart);
      }

      // ตรวจสอบว่าผลิตภัณฑ์อยู่ใน Cart หรือไม่
      const productExists = await prisma.cartProduct.findFirst({
        where: {
          cartId: user.cart.id,
          productId: productId,
        },
      });

      if (productExists) {
        return res.status(400).json({ error: 'Product already in cart' });
      }

      // เพิ่มสินค้าไปยัง Cart
      const cartProduct = await prisma.cartProduct.create({
        data: {
          cartId: user.cart.id,
          productId: productId,
        },
      });

      res.status(201).json(cartProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error adding to cart' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}