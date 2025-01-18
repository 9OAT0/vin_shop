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
      const newCart = await prisma.cart.create({
        data: {
          userId: userId,
          products: [productId],
        },
      });
      return newCart;
    }

    if (user.cart.products.includes(productId)) {
      throw new Error('Product already in cart');
    }

    const updatedCart = await prisma.cart.update({
      where: { id: user.cart.id },
      data: {
        products: {
          push: productId,
        },
      },
    });

    return updatedCart;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}