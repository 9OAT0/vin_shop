import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from './CouldinaryConfig';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import getRawBody from 'raw-body';

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

// ✅ Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, _file) => {
    const timestamp = Date.now();
    return {
      folder: 'paymentSlip',
      allowedFormats: ['jpg', 'png', 'jpeg'],
      public_id: `slip_${timestamp}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const config = {
  api: { bodyParser: false }, // ❌ ต้องปิดให้ Multer ทำงาน
};

// ✅ Helper อ่าน JSON body เมื่อไม่มี file upload
async function parseJsonBody(req) {
  const rawBody = await getRawBody(req);
  return JSON.parse(rawBody.toString());
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    let body = {};

    if (req.headers['content-type'].includes('application/json')) {
      // ✅ ถ้าเป็น JSON body (PromptPay)
      body = await parseJsonBody(req);
    }

    // ✅ ตรวจ JWT
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated. Please login first.' });
    }

    const userPayload = jwt.verify(token, SECRET_KEY);
    const userId = userPayload.id;

    if (body.onlyPayment) {
      // ✅ แค่สร้างลิงก์ PromptPay
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          cart: { include: { products: { include: { product: true } } } },
        },
      });

      if (!user || !user.cart || user.cart.products.length === 0) {
        return res.status(400).json({ error: 'Cart is empty or user not found' });
      }

      const totalAmount = user.cart.products.reduce((acc, cp) => {
        return acc + (cp.product.price || 0);
      }, 0);

      const paymentLink = createPaymentLink(totalAmount);
      return res.status(200).json({ totalAmount, paymentLink });
    }

    // ✅ ถ้าเป็น FormData + File upload → ใช้ Multer
    upload.single('paymentSlip')(req, res, async (err) => {
      if (err) {
        console.error('❌ Upload error:', err.message);
        return res.status(500).json({ error: 'Error uploading file', details: err.message });
      }

      const paymentSlip = req.file ? req.file.path : null;

      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          cart: { include: { products: { include: { product: true } } } },
        },
      });

      if (!user || !user.cart || user.cart.products.length === 0) {
        return res.status(400).json({ error: 'Cart is empty or user not found' });
      }

      if (!user.location || user.location.trim() === '') {
        return res.status(400).json({ error: 'User address is required before placing an order.' });
      }

      const orders = await Promise.all(
        user.cart.products.map(({ productId, product }) =>
          prisma.order.create({
            data: {
              productId,
              userId,
              picture: product.pictures[0] || null,
              paymentSlip,
              address: user.location,
              status: 'Pending',
              trackingId: `TH${Math.floor(Math.random() * 1000000000)}`,
            },
          })
        )
      );

      await prisma.cartProduct.deleteMany({ where: { cartId: user.cart.id } });

      return res.status(201).json({ message: 'Order created successfully', orders });
    });
  } catch (error) {
    console.error('❌ Error in /api/payment:', error.message);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}

// ✅ ฟังก์ชันสร้างลิงก์ PromptPay
function createPaymentLink(amount) {
  const promptPayNumber = '0943691074';
  return `https://promptpay.io/${promptPayNumber}/${amount}`;
}