import { PrismaClient } from '@prisma/client';
// ✅ เปลี่ยน bcrypt → bcryptjs เพื่อรองรับ Edge runtime
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ✅ บังคับ Node.js runtime เพื่อให้ API ใช้ bcryptjs ได้
export const runtime = 'nodejs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email, password, name, isAdmin } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // ✅ ตรวจสอบ email ซ้ำ
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    // ✅ เข้ารหัสรหัสผ่านด้วย bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ ระบุ role (USER เป็น default)
    const role = isAdmin ? 'ADMIN' : 'USER';

    const newUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        location: '',
        role,
      },
    });

    console.log(`✅ User created: ${newUser.id} (${newUser.email})`);

    return res.status(201).json({
      message: 'User created successfully',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return res.status(500).json({
      error: 'Error creating user',
      details: error.message,
    });
  }
}
