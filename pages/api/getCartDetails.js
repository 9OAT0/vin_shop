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

            // รวมจำนวนผลิตภัณฑ์ในตะกร้า
            const totalProducts = cart.products.length;

            return res.status(200).json({
                id: cart.id,
                userId: cart.userId,
                totalProducts, // เพิ่มข้อมูลจำนวนผลิตภัณฑ์ที่นี่
                products: productsWithDetails
            });
        } catch (error) {
            console.error('Error fetching cart details:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else if (req.method === 'DELETE') {
        const { userId, productId } = req.query;

        if (!userId || !productId) {
            return res.status(400).json({ error: 'User ID and Product ID are required.' });
        }

        try {
            // ค้นหาตะกร้าของผู้ใช้
            const cart = await prisma.cart.findUnique({
                where: { userId: userId },
                include: {
                    products: true, // รวมผลิตภัณฑ์ในตะกร้า
                },
            });

            if (!cart) {
                return res.status(404).json({ error: 'Cart not found.' });
            }

            // ค้นหาผลิตภัณฑ์ในตะกร้า
            const cartProduct = cart.products.find(cp => cp.productId === productId);

            if (!cartProduct) {
                return res.status(404).json({ error: 'Cart product not found.' });
            }

            // ลบผลิตภัณฑ์จากตะกร้า
            await prisma.cartProduct.delete({
                where: { id: cartProduct.id },
            });

            return res.status(204).end(); // Successfully deleted, return no content
        } catch (error) {
            console.error('Error deleting product from cart:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}