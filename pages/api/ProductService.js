import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // รับข้อมูลจาก body ของ request
      const { name, Picture, Price, Size, description } = req.body;

      // ตรวจสอบข้อมูลเบื้องต้น
      if (!name || !Picture || !Price || !Size || !description) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      // เพิ่มข้อมูลในฐานข้อมูล
      const product = await prisma.product.create({
        data: {
          name,
          Picture,
          Price,
          Size,
          description,
        },
      });

      return res.status(201).json({ message: 'Product added successfully!', product });
    } catch (error) {
      console.error('Error adding product:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
