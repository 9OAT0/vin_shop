import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const userRole = req.headers['x-user-role'];

  // ✅ ตรวจ Role = ADMIN
  if (userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  if (req.method === 'GET') {
    try {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: {
          product: true,
        },
      });

      if (!orders || orders.length === 0) {
        return res.status(200).json({ message: 'No orders found for this month.' });
      }

      const summary = {};
      const statusSummary = {};

      orders.forEach((order) => {
        if (!order?.createdAt) return;

        const orderDate = order.createdAt.toISOString().split('T')[0];

        summary[orderDate] ??= { date: orderDate, totalItems: 0, products: {} };
        summary[orderDate].totalItems++;

        if (order.productId && order.product) {
          const { productId, name } = order.product;
          summary[orderDate].products[productId] ??= { productId, name, quantity: 0 };
          summary[orderDate].products[productId].quantity++;
        }

        if (order.status) {
          statusSummary[order.status] ??= { count: 0, products: {} };
          statusSummary[order.status].count++;

          if (order.productId && order.product) {
            const { productId, name } = order.product;
            statusSummary[order.status].products[productId] ??= { productId, name, quantity: 0 };
            statusSummary[order.status].products[productId].quantity++;
          }
        }
      });

      const graphData = Object.entries(statusSummary).map(([status, data]) => ({
        status,
        count: data.count,
        products: Object.values(data.products),
      }));

      res.status(200).json({
        dailySummary: Object.values(summary),
        statusSummary: graphData,
      });
    } catch (error) {
      console.error('Error fetching orders summary:', error);
      res.status(500).json({
        error: 'Error fetching orders summary',
        details: error instanceof Error ? error.message : 'Unknown error.',
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}