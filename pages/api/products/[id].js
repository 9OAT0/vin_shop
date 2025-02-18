import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { method } = req;
    const { id } = req.query; // ดึง ID จาก query parameters

    if (method === 'GET') {
        try {
            const product = await prisma.products.findUnique({
                where: { id: id }, // แปลง ID เป็น Number
            });

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.status(200).json(product); // ส่งคืนข้อมูลผลิตภัณฑ์
        } catch (error) {
            console.error('Error fetching product:', error.message);
            res.status(500).json({ error: 'Error fetching product', details: error.message });
        } finally {
            await prisma.$disconnect(); // ปิดการเชื่อมต่อ
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}