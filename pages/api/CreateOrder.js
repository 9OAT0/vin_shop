import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId } = req.body;

    try {
      // ดึงข้อมูล Cart ของผู้ใช้
      const cart = await prisma.cart.findUnique({
        where: {
          userId: userId,
        },
        include: {
          products: true, // รวมข้อมูลผลิตภัณฑ์ใน Cart
        },
      });

      // ตรวจสอบว่าตะกร้ามีสินค้า
      if (!cart || cart.products.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // สร้างคำสั่งซื้อสำหรับแต่ละสินค้า
      const orders = await Promise.all(
        cart.products.map(({ productId }) => 
          prisma.order.create({
            data: {
              productId,
              userId,
              status: 'Pending',
              trackingId: 'TH1023551548'
            },
          })
        )
      );

      // ลบสินค้าจากตะกร้า
      await prisma.cartProduct.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      res.status(201).json({ orders });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Error creating order' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}