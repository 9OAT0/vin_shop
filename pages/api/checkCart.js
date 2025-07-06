import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const userId = req.headers['x-user-id'];

    try {
        const cartItems = await prisma.cartProduct.findMany({
            where: {
                cart: { userId },
            },
        });

        return res.status(200).json(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error.message);
        return res.status(500).json({ error: 'Error fetching cart items' });
    }
}