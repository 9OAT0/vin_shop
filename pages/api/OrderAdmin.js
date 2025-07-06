import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

export default async function handler(req, res) {
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
    return res.status(403).json({ error: 'Access denied. Only ADMIN can manage orders.' });
  }

  if (req.method === 'GET') {
    try {
      const orders = await prisma.order.findMany({
        include: {
          product: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found.' });
      }

      console.log(`✅ Admin fetched ${orders.length} orders`);
      return res.status(200).json(orders);
    } catch (error) {
      console.error('❌ Error fetching orders for admin:', error.message);
      return res.status(500).json({ error: 'Error fetching orders', details: error.message });
    }
  }

  else if (req.method === 'PUT') {
    const { orderId, status, trackingId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required to update.' });
    }

    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: status || undefined,
          trackingId: trackingId || undefined,
        },
        include: {
          product: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      console.log(`✅ Order ${orderId} updated by admin`);
      return res.status(200).json({ message: 'Order updated successfully', updatedOrder });
    } catch (error) {
      console.error('❌ Error updating order:', error.message);
      return res.status(500).json({ error: 'Error updating order', details: error.message });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}