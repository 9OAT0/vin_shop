import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const userId = req.headers['x-user-id'];

  console.log(`Fetching orders for userId: ${userId}`);

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    console.log("Orders Retrieved:", orders);

    if (!orders || orders.length === 0) {
      console.log(`No orders found for userId: ${userId}`);
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    // แปลง orders ให้รวมรูปภาพแรกของแต่ละผลิตภัณฑ์
    const ordersWithPictures = orders.map(order => ({
      ...order,
      picture: order.product?.pictures[0] || null,
    }));

    return res.status(200).json(ordersWithPictures);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: 'Error fetching orders', details: error.message });
  }
}