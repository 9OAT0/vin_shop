import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export default async function requestPasswordReset(req, res) {
    if (req.method === 'POST') {
        const { email } = req.body;

        // ตรวจสอบอีเมล
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        try {
            // ตรวจสอบว่าผู้ใช้มีอยู่จริง
            const user = await prisma.users.findUnique({
                where: { email: email },
            });

            // เพิ่มการตรวจสอบค่า user
            if (!user) {
                console.error(`User not found for email: ${email}`);
                return res.status(404).json({ error: 'User not found' });
            }

            // ตรวจสอบค่า user.id
            if (!user.id) {
                console.error(`Invalid user data: missing user ID`);
                return res.status(500).json({ error: 'Invalid user data' });
            }

            // สร้าง Token รีเซ็ตรหัสผ่าน
            const payload = { id: user.id };
            const resetToken = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '12h',
            });

            // สร้าง URL รีเซ็ตรหัสผ่าน
            const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

            // ตั้งค่า Nodemailer เพื่อส่งอีเมล
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // ส่งอีเมลที่มีลิงค์รีเซ็ตรหัสผ่าน
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Request',
                text: `You requested to reset your password. Click the link to reset it: ${resetUrl}`,
            });

            // ส่งกลับว่าอีเมลได้ถูกส่ง
            res.status(200).json({ message: 'Password reset link sent to your email.' });
        } catch (error) {
            console.error('Error while sending reset password email:', error);
            res.status(500).json({ error: 'Internal server error', details: 'Something went wrong while processing your request.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
