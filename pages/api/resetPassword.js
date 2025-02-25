import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; 
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

export default async function resetPasswordHandler(req, res) {
    if (req.method === 'POST') {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            // เข้ารหัสรหัสผ่านใหม่
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // อัปเดตรหัสผ่านของผู้ใช้ในฐานข้อมูล
            await prisma.users.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });

            res.status(200).json({ message: 'Password has been reset successfully' });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ error: 'Failed to reset password', details: error.message || 'An unknown error occurred.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}