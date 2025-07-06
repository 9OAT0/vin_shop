import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please login as admin.' });
  }

  let userPayload;
  try {
    userPayload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  if (userPayload.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Only ADMIN can view order summary.' });
  }

  try {
    const allOrders = await prisma.order.findMany({
      include: {
        product: { select: { name: true, price: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.product?.price || 0), 0);

    // 🗂 All Time Summary: Group by Status
    const allTimeStatusSummary = {};
    allOrders.forEach(order => {
      const status = order.status;
      if (!allTimeStatusSummary[status]) {
        allTimeStatusSummary[status] = { count: 0, revenue: 0, orders: [] };
      }
      allTimeStatusSummary[status].count += 1;
      allTimeStatusSummary[status].revenue += order.product?.price || 0;
      allTimeStatusSummary[status].orders.push({
        id: order.id,
        productName: order.product?.name || 'Unknown',
        price: order.product?.price || 0,
        status: order.status,
        createdAt: order.createdAt,
        customer: {
          id: order.user?.id || 'N/A',
          name: order.user?.name || 'Unknown User',
          email: order.user?.email || 'N/A',
        },
      });
    });

    // 📅 Monthly Summary: Group by Month + Status
    const monthlyStatusSummary = {};
    allOrders.forEach(order => {
      const monthKey = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const status = order.status;

      if (!monthlyStatusSummary[monthKey]) {
        monthlyStatusSummary[monthKey] = {};
      }
      if (!monthlyStatusSummary[monthKey][status]) {
        monthlyStatusSummary[monthKey][status] = { count: 0, revenue: 0, orders: [] };
      }

      monthlyStatusSummary[monthKey][status].count += 1;
      monthlyStatusSummary[monthKey][status].revenue += order.product?.price || 0;
      monthlyStatusSummary[monthKey][status].orders.push({
        id: order.id,
        productName: order.product?.name || 'Unknown',
        price: order.product?.price || 0,
        status: order.status,
        createdAt: order.createdAt,
        customer: {
          id: order.user?.id || 'N/A',
          name: order.user?.name || 'Unknown User',
          email: order.user?.email || 'N/A',
        },
      });
    });

    // 📆 Daily Summary (Today)
    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dailyOrders = allOrders.filter(order =>
      order.createdAt.toISOString().startsWith(todayKey)
    );

    const dailyStatusSummary = {};
    dailyOrders.forEach(order => {
      const status = order.status;
      if (!dailyStatusSummary[status]) {
        dailyStatusSummary[status] = { count: 0, revenue: 0, orders: [] };
      }
      dailyStatusSummary[status].count += 1;
      dailyStatusSummary[status].revenue += order.product?.price || 0;
      dailyStatusSummary[status].orders.push({
        id: order.id,
        productName: order.product?.name || 'Unknown',
        price: order.product?.price || 0,
        status: order.status,
        createdAt: order.createdAt,
        customer: {
          id: order.user?.id || 'N/A',
          name: order.user?.name || 'Unknown User',
          email: order.user?.email || 'N/A',
        },
      });
    });

    return res.status(200).json({
      allTime: {
        totalOrders,
        totalRevenue,
        groupedByStatus: allTimeStatusSummary,
      },
      monthlySummary: monthlyStatusSummary,
      todaySummary: dailyStatusSummary,
    });
  } catch (error) {
    console.error('❌ Error fetching order summary:', error);
    return res.status(500).json({
      error: 'Error fetching order summary',
      details: error.message,
    });
  }
}