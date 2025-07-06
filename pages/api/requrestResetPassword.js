import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

if (!JWT_SECRET || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('❌ Missing required environment variables (JWT_SECRET, EMAIL_USER, EMAIL_PASS)');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
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
            console.warn(`⚠️ User not found for email: ${email}`);
            return res.status(404).json({ error: 'User not found' });
        }

        // ป้องกัน spam: ตรวจสอบว่าผู้ใช้ขอลิงก์ล่าสุดใน 5 นาทีหรือไม่
        const lastReset = await prisma.passwordReset.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });

        if (lastReset && Date.now() - new Date(lastReset.createdAt).getTime() < 5 * 60 * 1000) {
            return res.status(429).json({ error: 'Please wait 5 minutes before requesting another reset.' });
        }

        // สร้าง JWT token สำหรับรีเซ็ต
        const payload = { id: user.id };
        const resetToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

        const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Save reset request log
        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                token: resetToken,
            },
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });

        const htmlBody = `
            <h2>Password Reset Request</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <a href="${resetUrl}" style="display:inline-block;background:#0070f3;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Reset Password</a>
            <p>This link will expire in <strong>12 hours</strong>.</p>
            <p>If you didn’t request this, you can safely ignore this email.</p>
        `;

        await transporter.sendMail({
            from: `"Support" <${EMAIL_USER}>`,
            to: email,
            subject: '🔐 Password Reset Request',
            html: htmlBody,
        });

        console.log(`✅ Password reset email sent to ${email}`);
        return res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.error('❌ Error during password reset:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}