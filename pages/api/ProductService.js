import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// ตั้งค่า Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, pictures, price, size, description } = req.body;

      // ตรวจสอบข้อมูลเบื้องต้น
      if (!name || !pictures || !price || !size || !description) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      // ตรวจสอบว่า pictures เป็น array
      if (!Array.isArray(pictures)) {
        return res.status(400).json({ error: 'Pictures must be an array of base64 strings or URLs.' });
      }

      // อัปโหลดรูปภาพไปที่ Cloudinary
      const uploadedPictures = await Promise.all(
        pictures.map(async (picture) => {
          const result = await cloudinary.uploader.upload(picture, {
            folder: 'products', // โฟลเดอร์ใน Cloudinary
          });
          return result.secure_url; // URL ของรูปภาพที่อัปโหลดสำเร็จ
        })
      );

      // เพิ่มข้อมูลในฐานข้อมูล
      const product = await prisma.products.create({
        data: {
          name,
          pictures: uploadedPictures, // ใช้ URL ที่อัปโหลดแล้ว
          price: parseFloat(price), // แปลงราคาเป็น Float
          size,
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
