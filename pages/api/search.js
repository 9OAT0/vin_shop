import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    // ใช้ middleware เพื่อป้องกันการเข้าถึง
    await authenticateToken(req, res, async () => {
        if (req.method === 'GET') {
            const { name } = req.query;

            if (!name) {
                return res.status(400).json({ message: 'Name query parameter is required' });
            }

            try {
                const products = await prisma.products.findMany({
                    where: {
                        name: {
                            contains: name,
                            mode: 'insensitive',
                        },
                    },
                });

                if (products.length === 0) {
                    return res.status(404).json({ message: 'No products found' });
                }

                res.status(200).json(products);
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).json({ error: 'Failed to fetch products', details: error.message });
            }
        } else {
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    });
}