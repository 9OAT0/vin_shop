import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

export const runtime = 'nodejs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // ✅ ตรวจ JWT ใน Cookie
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please login first.' });
  }

  let userPayload;
  try {
    userPayload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  // ✅ ตรวจ role: เฉพาะ USER เท่านั้น
  if (userPayload.role !== 'USER') {
    return res.status(403).json({ error: 'Access denied. Only USER can view their cart.' });
  }

  const userId = userPayload.id;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        products: {
          include: { product: true }, // ✅ ดึงรายละเอียดสินค้าด้วย
        },
      },
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('❌ Error fetching cart items:', error.message);
    res.status(500).json({ error: 'Error fetching cart items', details: error.message });
  }
}
