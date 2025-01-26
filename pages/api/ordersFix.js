import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { orderId } = req.query; // ดึง orderId จากพารามิเตอร์ใน URL

  if (method === 'GET') {
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    try {
      // ดึงข้อมูลคำสั่งซื้อจากฐานข้อมูล
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // ส่งข้อมูลเฉพาะที่ต้องการกลับ เช่น status และ trackingId
      const response = {
        status: order.status,
        trackingId: order.trackingId,
      };

      // ส่งข้อมูลคำสั่งซื้อกลับ
      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Error fetching order', details: error.message });
    }
  } else if (method === 'PUT') {
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    const { status, trackingId } = req.body; // ดึงข้อมูลใหม่สำหรับการอัปเดต

    try {
      // อัปเดตข้อมูลคำสั่งซื้อ
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: status !== undefined ? status : undefined,
          trackingId: trackingId !== undefined ? trackingId : undefined,
        },
      });

      res.status(200).json(updatedOrder); // ส่งข้อมูลคำสั่งซื้อที่อัปเดตกลับ
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Error updating order', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}