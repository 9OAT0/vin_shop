import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';


const prisma = new PrismaClient();

export default async function handler(req, res) {
  await authenticateToken(req, res, async() => {
  if (req.method === 'GET') {
    const { userId } = req.query; // ดึง userId จาก query params

    // ตรวจสอบว่า userId ถูกต้องหรือไม่
    if (!userId) {
      return res.status(400).json({ error: 'User ID must be provided' });
    }

    console.log(`Fetching orders for userId: ${userId}`);

    try {
      // ค้นหาคำสั่งซื้อทั้งหมดที่เกี่ยวข้องกับ userId
      const orders = await prisma.order.findMany({
        where: { userId: userId },
        include: {
          product: true, // รวมข้อมูลผลิตภัณฑ์ในคำสั่งซื้อ
        },
      });

      // Log คำสั่งซื้อที่ได้
      console.log("Orders Retrieved:", orders); 

      // ตรวจสอบว่ามีคำสั่งซื้อหรือไม่
      if (!orders || orders.length === 0) {
        console.log(`No orders found for userId: ${userId}`);
        return res.status(404).json({ message: 'No orders found for this user' });
      }

      // แปลง orders ให้รวมรูปภาพแรกของแต่ละผลิตภัณฑ์
      const ordersWithPictures = orders.map(order => ({
        ...order,
        picture: order.product?.pictures[0] || null, // รูปภาพแรกจากผลิตภัณฑ์
      }));

      return res.status(200).json(ordersWithPictures); // ส่งคำสั่งซื้อกลับ
    } catch (error) {
      console.error('Error fetching orders:', error); // Log ข้อผิดพลาด
      return res.status(500).json({ error: 'Error fetching orders', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
}