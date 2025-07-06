import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.products.findMany();
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error.message);
      res.status(500).json({ error: 'Error fetching products', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}