import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query; // ดึง userId จาก query params

    try {
      // ค้นหาคำสั่งซื้อทั้งหมดที่เกี่ยวข้องกับ userId
      const orders = await prisma.order.findMany({
        where: {
          userId: userId,
        },
        include: {
          product: true, // รวมข้อมูลผลิตภัณฑ์ในคำสั่งซื้อ
        },
      });

      if (orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this user' });
      }

      res.status(200).json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching orders' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}