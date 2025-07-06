import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';


const prisma = new PrismaClient();

export default async function handler(req, res) {
  await authenticateToken(req, res, async() => {
  if (req.method === 'GET') {
    try {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Fetch orders for the current month
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
      const statusSummary = {}; // เก็บข้อมูลแยกตามสถานะออเดอร์

      orders.forEach((order) => {
        if (!order || !order.createdAt) {
          console.warn('Order is missing required fields:', order);
          return;
        }

        const orderDate = order.createdAt.toISOString().split('T')[0];

        if (!summary[orderDate]) {
          summary[orderDate] = {
            date: orderDate,
            totalItems: 0,
            products: {},
          };
        }

        summary[orderDate].totalItems += 1;

        if (order.productId && order.product) {
          const productId = order.productId;

          if (!summary[orderDate].products[productId]) {
            summary[orderDate].products[productId] = {
              productId: productId,
              name: order.product.name || 'Unknown Product',
              quantity: 0,
            };
          }

          summary[orderDate].products[productId].quantity += 1;
        }

        // นับจำนวนคำสั่งซื้อแยกตามสถานะ และรวมข้อมูลสินค้าที่เกี่ยวข้อง
        if (order.status) {
          if (!statusSummary[order.status]) {
            statusSummary[order.status] = {
              count: 0,
              products: {},
            };
          }

          statusSummary[order.status].count += 1;

          if (order.productId && order.product) {
            const productId = order.productId;

            if (!statusSummary[order.status].products[productId]) {
              statusSummary[order.status].products[productId] = {
                productId: productId,
                name: order.product.name || 'Unknown Product',
                quantity: 0,
              };
            }

            statusSummary[order.status].products[productId].quantity += 1;
          }
        }
      });

      // เตรียมข้อมูลสำหรับแสดงผล
      const graphData = Object.entries(statusSummary).map(([status, data]) => ({
        status,
        count: data.count,
        products: Object.values(data.products),
      }));

      const result = {
        dailySummary: Object.values(summary),
        statusSummary: graphData,
      };

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching orders summary:', error);

      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';

      return res.status(500).json({
        error: 'Error fetching orders summary',
        details: errorMessage,
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
}
