import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId } = req.body; // ดึง userId จากร่างคำขอ

    try {
      // ดึงข้อมูล User, รวมถึงที่อยู่ (address) และ Cart
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          cart: {
            include: {
              products: {
                include: {
                  product: true, // รวมข้อมูลผลิตภัณฑ์
                },
              },
            },
          },
        },
      });

      // ตรวจสอบว่าผู้ใช้มี Cart และ Cart มีสินค้า
      if (!user || !user.cart || user.cart.products.length === 0) {
        return res.status(400).json({ error: 'Cart is empty or user not found' });
      }

      // สร้างคำสั่งซื้อสำหรับแต่ละสินค้า
      const orders = await Promise.all(
        user.cart.products.map(({ productId, product }) =>
          prisma.order.create({
            data: {
              productId,
              userId,
              picture: product.pictures[0] || null, // เพิ่มรูปภาพลงในคำสั่งซื้อ
              address: user.location, // เพิ่มที่อยู่จาก User
              status: 'Pending', // สถานะคำสั่งซื้อเริ่มต้น
              trackingId: `TH${Math.floor(Math.random() * 1000000000)}`, // สร้าง Tracking ID แบบสุ่ม
            },
          })
        )
      );

      // ลบสินค้าจาก Cart
      await prisma.cartProduct.deleteMany({
        where: {
          cartId: user.cart.id,
        },
      });

      res.status(201).json({ orders }); // ส่งข้อมูลคำสั่งซื้อกลับ
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Error creating order', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
