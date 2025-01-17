import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // ดึงข้อมูลผลิตภัณฑ์ทั้งหมด
      const allProducts = await prisma.products.findMany();
      
      // หากมีผลิตภัณฑ์มากกว่า 4 ชิ้น จะสุ่ม 4 ชิ้น
      const count = allProducts.length <= 4 ? allProducts.length : 4;

      const recommendedProducts = allProducts
        .sort(() => 0.5 - Math.random()) // สุ่มรายการ
        .slice(0, count); // ดึงรายการตามจำนวนที่มี

      res.status(200).json(recommendedProducts); // ส่งข้อมูลผลิตภัณฑ์ที่สุ่มมา
    } catch (error) {
      console.error('Error fetching recommendations:', error.message);
      res.status(500).json({ error: 'Error fetching recommendations', details: error.message });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}