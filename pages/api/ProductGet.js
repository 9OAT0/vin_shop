import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API Handler สำหรับดึงข้อมูลผลิตภัณฑ์ทั้งหมด
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.products.findMany(); // ใช้ products ตามที่ได้ตั้งค่าใน schema
      res.status(200).json(products); // ส่งผลลัพธ์กลับ
    } catch (error) {
      console.error('Error fetching products:', error.message);
      res.status(500).json({ error: 'Error fetching products', details: error.message });
    } finally {
      await prisma.$disconnect(); // ปิดการเชื่อมต่อ
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}