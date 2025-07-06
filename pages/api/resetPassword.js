import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function resetPasswordHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  try {
    // ✅ ตรวจสอบ token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // ✅ ตรวจสอบว่าผู้ใช้ยังมีอยู่
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // ✅ เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ อัปเดตรหัสผ่านใน DB
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    console.log(`🔑 Password reset successful for user ${user.email}`);

    // ✅ (Optional) ลบ token จาก PasswordReset log
    await prisma.passwordReset.deleteMany({
      where: { userId },
    });

    return res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.warn('⏰ Token expired:', error.message);
      return res.status(401).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    if (error.name === 'JsonWebTokenError') {
      console.warn('❌ Invalid token:', error.message);
      return res.status(401).json({ error: 'Invalid reset token.' });
    }

    console.error('❌ Error resetting password:', error);
    return res.status(500).json({
      error: 'Failed to reset password',
      details: error.message || 'An unknown error occurred.',
    });
  }
}