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

  // ✅ ดึง token จาก cookie
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please login first.' });
  }

  // ✅ ถอด JWT เพื่อดึง userId
  let userPayload;
  try {
    userPayload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  const userId = userPayload.id;

  try {
    console.log(`📦 Fetching orders for userId: ${userId}`);

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        product: true, // ✅ รวมข้อมูลสินค้า
      },
      orderBy: { createdAt: 'desc' }, // 🕒 ล่าสุดก่อน
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    // ✅ รวมข้อมูล พร้อม paymentSlip
    const ordersWithDetails = orders.map(order => ({
      id: order.id,
      status: order.status,
      trackingId: order.trackingId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paymentSlip: order.paymentSlip, // ✅ เพิ่มตรงนี้
      product: {
        id: order.product.id,
        name: order.product.name,
        price: order.product.price,
        picture: order.product.pictures[0] || null,
      },
    }));

    console.log(`✅ Found ${ordersWithDetails.length} orders for userId: ${userId}`);
    return res.status(200).json(ordersWithDetails);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return res.status(500).json({ error: 'Error fetching orders', details: error.message });
  }
}
