import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ✅ บังคับใช้ Node.js runtime เพื่อรองรับ bcrypt & Prisma
export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email, password, name } = req.body;

  // ✅ ตรวจสอบฟิลด์ที่ต้องมี
  if (!email || !password || !name) {
    return res.status(400).json({
      error: 'All fields are required (email, password, name)',
    });
  }

  try {
    // ✅ ตรวจสอบว่า email ซ้ำหรือไม่
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    // ✅ เข้ารหัสรหัสผ่านด้วย bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ สร้างผู้ใช้ใหม่ (role: USER เท่านั้น)
    const newUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        location: '', // ค่า default
        role: 'USER', // 🔥 ห้ามสร้าง ADMIN ผ่าน API นี้
      },
    });

    console.log(`✅ User created: ${newUser.id} (${newUser.email})`);

    // ✅ ส่ง response กลับ
    return res.status(201).json({
      message: 'User created successfully',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return res.status(500).json({
      error: 'Error creating user',
      details: error.message || 'Internal Server Error',
    });
  }
}