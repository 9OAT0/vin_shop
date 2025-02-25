import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../auth';


const prisma = new PrismaClient();

// API Handler สำหรับดึงและแก้ไขข้อมูลผลิตภัณฑ์
export default async function handler(req, res) {
  await authenticateToken(req, res, async() => {
  const { method } = req;
  const { id } = req.query; // รับ ID จาก URL

  if (method === 'GET') {
    try {
      const product = await prisma.products.findUnique({
        where: { id },
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.status(200).json(product); // ส่งคืนข้อมูลผลิตภัณฑ์
    } catch (error) {
      console.error('Error fetching product:', error.message);
      res.status(500).json({ error: 'Error fetching product', details: error.message });
    } finally {
      await prisma.$disconnect();
    }
  } else if (method === 'PUT') {
    const { name, price, size, description } = req.body;

    try {
      const updatedProduct = await prisma.products.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(price && { price: parseFloat(price) }),
          ...(size && { size }),
          ...(description && { description }),
          // หากต้องการอัปเดตรูปภาพ ให้ใช้โค้ดจัดการที่เหมาะสม
        },
      });

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error.message);
      res.status(500).json({ error: 'Error updating product', details: error.message });
    } finally {
      await prisma.$disconnect();
    }
  } else if (method === 'DELETE'){
    try {
      const deletedProduct = await prisma.products.delete({
        where: {id},
      });

      res.status(200).json({ message: 'Product deleted successfully', deletedProduct});
    } catch (error) {
      console.error('Error deleting product', error.message);
      res.status(500).json({ error: 'Error deleting product:', details: error.message }) 
    } finally {
      await prisma.$disconnect
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
  });
}