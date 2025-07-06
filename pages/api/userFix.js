import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"; 

const prisma = new PrismaClient();

// Middleware ตรวจสอบ JWT Token
const authenticateToken = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    return decoded; 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// API Route Handler
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const userData = await authenticateToken(req, res);
      if (!userData) return;

      const userId = userData.id; 

      const user = await prisma.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // ส่งข้อมูลผู้ใช้ไป (เฉพาะฟิลด์ที่ต้องการ)
      return res.status(200).json({
        email: user.email,
        location: user.location,
        name: user.name,
        phoneNumber: user.phoneNumber,
        // ไม่ส่งรหัสผ่าน
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const userData = await authenticateToken(req, res);
      if (!userData) return;

      const userId = userData.id; // ใช้ userId ที่ถอดรหัสได้จาก Token
      const { name, email, location, password, phoneNumber } = req.body; // รับข้อมูลที่ต้องการอัปเดต

      // Data to Update
      const updatedData = {
        name,
        email,
        location,
        phoneNumber,
      };

      // ถ้ามีการเปลี่ยนรหัสผ่านก็เข้ารหัสรหัสผ่านใหม่
      if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        updatedData.password = hashedPassword; // อัปเดตรหัสผ่าน
      }

      const user = await prisma.users.update({
        where: { id: userId },
        data: updatedData,
      });

      // ส่งข้อมูลผู้ใช้ที่อัปเดต
      return res.status(200).json({
        email: user.email,
        location: user.location,
        name: user.name,
        // ไม่ส่งรหัสผ่าน
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}