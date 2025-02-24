import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        try {
            // ค้นหาตะกร้าจากผู้ใช้
            const cart = await prisma.cart.findUnique({
                where: { userId: userId },
                include: {
                    products: true, // รวมผลิตภัณฑ์ในตะกร้า
                },
            });

            if (!cart) {
                return res.status(404).json({ error: 'Cart not found.' });
            }

            // แปลงข้อมูลผลิตภัณฑ์
            const productsWithDetails = await Promise.all(cart.products.map(async (cartProduct) => {
                // ดึงข้อมูลผลิตภัณฑ์จาก Products
                const product = await prisma.products.findUnique({
                    where: { id: cartProduct.productId },
                    select: {
                        name: true, // ดึงชื่อผลิตภัณฑ์
                        pictures: true, // ดึงภาพผลิตภัณฑ์
                    }
                });

                return {
                    id: cartProduct.id,
                    cartId: cart.id,
                    productId: cartProduct.productId,
                    productName: product?.name || 'Unnamed Product', // ใช้ชื่อจากผลิตภัณฑ์
                    firstPicture: product?.pictures[0] || null, // ใช้ภาพแรกจากผลิตภัณฑ์
                };
            }));

            return res.status(200).json({ id: cart.id, userId: cart.userId, products: productsWithDetails });
        } catch (error) {
            console.error('Error fetching cart details:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}