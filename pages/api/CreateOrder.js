import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './CouldinaryConfig'; 
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';

const prisma = new PrismaClient();

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const { name } = req.body;
    const timestamp = Date.now();
    return {
      folder: 'paymentSlip',
      allowedFormat: ['jpg', 'png', 'jpeg'],
      public_id: `${name}_${timestamp}`
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const config = {
  api: {
    bodyParser: false,
  },
}; 

export default async function handler(req, res) {
  await authenticateToken(req, res, async () => {
  if (req.method === 'POST') {
    upload.single('paymentSlip')(req, res, async (err) => {
      if(err) {
        return res.status(500).json({error: 'Error uploading file', details: err.message });
      }
  
    const { userId } = req.body; // ดึง userId จากร่างคำขอ
    const paymentSlip = req.file ? req.file.path : null;

    try {
      // ดึงข้อมูล User, รวมถึงที่อยู่ (address) และ Cart
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          cart: {
            include: {
              products: {
                include: {
                  product: true, // รวมข้อมูลผลิตภัณฑ์
                },
              },
            },
          },
        },
      });

      // ตรวจสอบว่าผู้ใช้มี Cart และ Cart มีสินค้า
      if (!user || !user.cart || user.cart.products.length === 0) {
        return res.status(400).json({ error: 'Cart is empty or user not found' });
      }

      // สร้างคำสั่งซื้อสำหรับแต่ละสินค้า
      const orders = await Promise.all(
        user.cart.products.map(({ productId, product }) =>
          prisma.order.create({
            data: {
              productId,
              userId,
              picture: product.pictures[0] || null, // เพิ่มรูปภาพลงในคำสั่งซื้อ
              paymentSlip: paymentSlip || null,
              address: user.location, // เพิ่มที่อยู่จาก User
              status: 'Pending', // สถานะคำสั่งซื้อเริ่มต้น
              trackingId: `TH${Math.floor(Math.random() * 1000000000)}`, // สร้าง Tracking ID แบบสุ่ม
            },
          })
        )
      );

      // ลบสินค้าจาก Cart
      await prisma.cartProduct.deleteMany({
        where: {
          cartId: user.cart.id,
        },
      });

      res.status(201).json({ orders }); // ส่งข้อมูลคำสั่งซื้อกลับ
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Error creating order', details: error.message });
    }
  });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  });
}
