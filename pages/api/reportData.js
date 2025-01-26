import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // ดึงข้อมูลคำสั่งซื้อในเดือนนี้
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

      // ตรวจสอบว่า `orders` ไม่ใช่ `null` หรือ `undefined`
      if (!orders || orders.length === 0) {
        return res.status(200).json({ message: 'No orders found for this month.' });
      }

      // สรุปข้อมูลคำสั่งซื้อตามวันที่
      const summary = {};

      orders.forEach((order) => {
        // ตรวจสอบว่า `order.createdAt` และ `order.product` มีค่าหรือไม่
        if (!order.createdAt) {
          console.warn('Order is missing createdAt field:', order);
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
      });

      const result = Object.values(summary);

      return res.status(200).json(result.length > 0 ? result : { message: 'No orders found for this month.' });
    } catch (error) {
      console.error('Error fetching orders summary:', error);

      // ตรวจสอบว่า `error` เป็นวัตถุหรือไม่
      const errorMessage = error?.message || 'An unknown error occurred.';

      return res.status(500).json({
        error: 'Error fetching orders summary',
        details: errorMessage,
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
