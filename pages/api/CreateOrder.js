import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const config = {
  api: { bodyParser: false }, // ✅ Multer ต้องการ bodyParser: false
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const userId = req.headers['x-user-id'];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userRole = req.headers['x-user-role'];
  const paymentSlip = req.files?.[0]?.path || null; // ✅ Multer ทำ upload ให้แล้ว

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        cart: {
          include: {
            products: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!user || !user.cart || user.cart.products.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or user not found' });
    }

    // ✅ สร้าง Order สำหรับแต่ละสินค้าใน Cart
    const orders = await Promise.all(
      user.cart.products.map(({ productId, product }) =>
        prisma.order.create({
          data: {
            productId,
            userId,
            picture: product.pictures[0] || null,
            paymentSlip,
            address: user.location,
            status: 'Pending',
            trackingId: `TH${Math.floor(Math.random() * 1_000_000_000)}`,
          },
        })
      )
    );

    // ✅ ล้าง Cart หลังสั่งซื้อเสร็จ
    await prisma.cartProduct.deleteMany({
      where: { cartId: user.cart.id },
    });

    res.status(201).json({ orders });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order', details: error.message });
  }
}