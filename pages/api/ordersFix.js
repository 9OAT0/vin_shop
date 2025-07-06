import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { orderId } = req.query;
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required.' });
  }

  if (method === 'GET') {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { product: true },
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      // ✅ USER → ดูได้เฉพาะ order ของตัวเอง
      if (userRole === 'USER' && order.userId !== userId) {
        return res.status(403).json({ error: 'Access denied. You can only view your own orders.' });
      }

      const response = {
        status: order.status,
        trackingId: order.trackingId,
        product: {
          name: order.product.name,
          picture: order.product.pictures[0] || null,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Error fetching order', details: error.message });
    }
  } else if (method === 'PUT') {
    // ✅ ADMIN → แก้ไขได้ทุก order
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Only admins can update orders.' });
    }

    const { status, trackingId } = req.body;

    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: status ?? undefined,
          trackingId: trackingId ?? undefined,
        },
      });

      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Error updating order', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}