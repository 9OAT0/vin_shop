import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        phoneNumber: true, // ✅ เพิ่ม phoneNumber
        location: true     // ✅ เพิ่ม location
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user); // ✅ ไม่ต้องห่อใน { user }
  } catch (err) {
    console.error('❌ Token verification error:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}