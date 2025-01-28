import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, password } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || !email || !password ) {
        return res.status(400).json({ message: 'Name, email, password, and location are required' });
    }

    if (!SECRET_KEY) {
        console.error('SECRET_KEY is not defined in .env');
        return res.status(500).json({ error: 'Server misconfiguration: SECRET_KEY not defined' });
    }

    try {
        // ตรวจสอบว่าอีเมลนี้มีผู้ใช้ในระบบอยู่แล้วหรือไม่
        const existingUser = await prisma.Users.findFirst({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // แฮชรหัสผ่านก่อนเก็บ
        const hashedPassword = await bcrypt.hash(password, 10);

        // สร้างผู้ใช้ใหม่ในฐานข้อมูล
        const user = await prisma.Users.create({
            data: {
                name,
                email,
                password: hashedPassword, // เก็บรหัสผ่านแบบ hash
                location: " ",
            },
        });

        // สร้าง JWT token
        const tokenPayload = { id: user.id, email: user.email };
        const user_id = user.id;

        const token = jwt.sign(tokenPayload, SECRET_KEY, {
            expiresIn: '12h',
        });

        res.status(201).json({ message: 'User created successfully', token, user_id });

    } catch (error) {
        console.error('Error:', error.message || error);
        res.status(500).json({ error: 'Signup failed', details: error.message || error });
    }
}
