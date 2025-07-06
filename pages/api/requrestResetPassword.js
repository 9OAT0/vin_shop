import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY; // ✅ ใช้ key เดียวกับระบบ

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User not found for email: ${email}`);
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ สร้าง reset token
    const resetToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '12h' });
    const resetUrl = `https://yourdomain.com/reset-password?token=${resetToken}`;

    // ✅ ตั้งค่า Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset.\n\nClick the link to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
    });

    console.log(`✅ Password reset link sent to ${email}`);
    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Error while sending reset password email:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}