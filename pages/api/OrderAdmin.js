// /pages/api/OrderAdmin.ts

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
        select: {
          id: true,
          status: true,
          trackingId: true,
          paymentSlip: true, // ✅ Include payment slip
          createdAt: true,
          updatedAt: true,
          product: {
            select: {
              id: true,
              name: true,
              pictures: true,
              price: true,
              size: true,
              description: true,
            },
          },
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

      console.log(`✅ Admin fetched ${orders.length} orders`);
      return res.status(200).json(orders);
    } catch (error) {
      console.error('❌ Error fetching orders for admin:', error.message);
      return res.status(500).json({ error: 'Error fetching orders', details: error.message });
    }
  }

  if (req.method === 'PUT') {
    const { orderId, status, trackingId } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: 'Order ID and Status are required.' });
    }

    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status,
          trackingId: trackingId || null,
        },
        select: {
          id: true,
          status: true,
          trackingId: true,
          paymentSlip: true, // ✅ Include payment slip after update
          createdAt: true,
          updatedAt: true,
          product: {
            select: {
              id: true,
              name: true,
              pictures: true,
              price: true,
              size: true,
              description: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      console.log(`✅ Order ${orderId} updated by admin`);
      return res.status(200).json({
        message: 'Order updated successfully',
        updatedOrder,
      });
    } catch (error) {
      console.error('❌ Error updating order:', error.message);
      return res.status(500).json({ error: 'Error updating order', details: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}