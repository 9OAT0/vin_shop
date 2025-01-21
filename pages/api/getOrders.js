// pages/api/getOrders.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query; // ดึง userId จาก query params

    if (!userId) {
      return res.status(400).json({ error: 'User ID must be provided' });
    }

    console.log(`Fetching orders for userId: ${userId}`);

    try {
      const orders = await prisma.order.findMany({
        where: { userId: userId }, // การค้นหาตาม userId
        include: { product: true }, // รวมข้อมูลผลิตภัณฑ์
      });

      // ตรวจสอบว่า orders ไม่มีค่า null
      if (!orders || Array.isArray(orders) && orders.length === 0) {
        console.log(`No orders found for userId: ${userId}`);
        return res.status(404).json({ message: 'No orders found for this user' });
      }

      // ส่งคำสั่งขายกลับไป
      return res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error); // แสดงข้อผิดพลาด
      return res.status(500).json({ error: 'Error fetching orders' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}