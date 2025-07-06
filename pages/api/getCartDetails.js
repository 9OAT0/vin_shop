import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    const userId = req.headers['x-user-id'];
    if (req.method === 'GET') {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { products: true },
        });

        if (!cart) return res.status(404).json({ error: 'Cart not found.' });
        return res.status(200).json(cart);
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}