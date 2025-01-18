import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, productId } = req.body;

    try {
      const cart = await addToCart(userId, productId);
      res.status(200).json(cart);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function addToCart(userId, productId) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { cart: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.cart) {
      // สร้าง Cart ใหม่และเพิ่มผลิตภัณฑ์แรก
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
      return newCart;
    }

    // ตรวจสอบว่าผลิตภัณฑ์อยู่ใน cart แล้วหรือไม่
    const productExists = await prisma.cartProduct.findFirst({
      where: {
        cartId: user.cart.id,
        productId: productId,
      },
    });

    if (productExists) {
      throw new Error('สินค้านี้มีอยู่ในตะกร้าแล้ว');
    }

    // อัปเดต cart โดยการเพิ่ม CartProduct ใหม่
    const updatedCart = await prisma.cart.update({
      where: { id: user.cart.id },
      data: {
        products: {
          create: {
            productId: productId,
          },
        },
      },
    });

    return updatedCart;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}