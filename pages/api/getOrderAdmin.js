import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const userRole = req.headers['x-user-role'];

    // ✅ Optional: ตรวจ role อีกชั้น (แต่ Global Middleware เช็คแล้ว)
    if (userRole !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    try {
        // ✅ ดึง Orders ทั้งหมด (รวมข้อมูล Product)
        const orders = await prisma.order.findMany({
            include: { product: true },
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found.' });
        }

        console.log("📦 All Orders Retrieved:", orders);
        return res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders for admin:', error);
        return res.status(500).json({ error: 'Error fetching orders', details: error.message });
    }
}