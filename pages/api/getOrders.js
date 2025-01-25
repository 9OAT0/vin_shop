import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query; 

    if (!userId) {
      return res.status(400).json({ error: 'User ID must be provided' });
    }

    console.log(`Fetching orders for userId: ${userId}`);

    try {
      // ค้นหาคำสั่งซื้อ
      const orders = await prisma.order.findMany({
        where: { userId: userId },
        // include ตามข้อมูลที่มีใน schema จริง (ตรวจสอบ schema ของคุณ)
      });

      console.log("Orders Retrieved:", orders);

      // ตรวจสอบคำสั่งซื้อ
      if (!orders || orders.length === 0) {
        console.log(`No orders found for userId: ${userId}`);
        return res.status(404).json({ message: 'No orders found for this user' });
      }

      return res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Error fetching orders', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}