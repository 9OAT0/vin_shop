import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY; // ✅ ใช้ key เดียวกับระบบ

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    console.log(`✅ Password reset successful for user ID: ${userId}`);
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid reset link.' });
    }
    res.status(500).json({
      error: 'Failed to reset password',
      details: error.message || 'An unknown error occurred.',
    });
  }
}