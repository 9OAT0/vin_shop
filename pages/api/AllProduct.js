import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // ดึงข้อมูลจาก collection "Product"
        const products = await prisma.products.findMany();

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        const formattedProducts = products.map(product => ({
            ...product,
            pictures: product.pictures ? product.pictures.split(' , ') : ['default.jpg'], // แปลง string เป็น array
            price: product.price || 0,
            size: product.size || 'N/A',
            description: product.description || 'No description available',
          }));          

        res.status(200).json(formattedProducts);
    } catch (error) {
        console.error('Error fetching products:', error.message || error);
        res.status(500).json({ error: 'Failed to fetch products', details: error.message || error });
    }
}
