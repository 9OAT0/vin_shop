import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  // ✅ ตรวจ JWT จาก cookie
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please login.' });
  }

  let userPayload;
  try {
    userPayload = jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  const userId = userPayload.id;

  if (req.method === 'GET') {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          location: true,
          phoneNumber: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
      if (process.env.NODE_ENV === 'development') await prisma.$disconnect();
    }
  }

  else if (req.method === 'PUT') {
    const { name, email, location, password, phoneNumber } = req.body;

    try {
      // ✅ ตรวจสอบ email ซ้ำ (แต่ยกเว้น email ของตัวเอง)
      if (email) {
        const existing = await prisma.users.findFirst({
          where: { email, NOT: { id: userId } },
        });
        if (existing) {
          return res.status(409).json({ error: 'This email is already in use by another user.' });
        }
      }

      const updatedData = {};
      if (name?.trim()) updatedData.name = name.trim();
      if (location?.trim()) updatedData.location = location.trim();
      if (phoneNumber?.trim()) updatedData.phoneNumber = phoneNumber.trim();
      if (email?.trim()) updatedData.email = email.trim();
      if (password?.trim()) {
        updatedData.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(updatedData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: updatedData, // ✅ ใช้ updatedData ที่ filter แล้ว
        select: {
          id: true,
          email: true,
          name: true,
          location: true,
          phoneNumber: true,
        },
      });


      console.log(`✅ User updated:`, {
        name: updatedUser.name,
        phone: updatedUser.phoneNumber,
        location: updatedUser.location,
        email: updatedUser.email,
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    } finally {
      if (process.env.NODE_ENV === 'development') await prisma.$disconnect();
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}