import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

export const runtime = 'nodejs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!SECRET_KEY) {
    console.error('SECRET_KEY is not defined in .env');
    return res.status(500).json({ error: 'Server misconfiguration: SECRET_KEY not defined' });
  }

  try {
    const user = await prisma.users.findFirst({ where: { email } });

    if (!user) {
      console.error('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Password mismatch for email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokenPayload = { id: user.id, role: user.role };

    const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '12h' });

    // ✅ Set Cookie (HTTP-only, Secure)
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=43200; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error:', error.message || error);
    res.status(500).json({ error: 'Login failed', details: error.message || error });
  }
}