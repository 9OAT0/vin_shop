import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId } = req.body; // ดึง userId จากร่างคำขอ

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
      // ค้นหาตะกร้าสำหรับผู้ใช้
      const cart = await prisma.cart.findUnique({
        where: { userId: userId },
        include: {
          products: {
            include: {
              product: true, // ดึงข้อมูลผลิตภัณฑ์ที่เชื่อมโยง
            },
          },
        },
      });

      // ตรวจสอบว่าตะกร้ามีผลิตภัณฑ์อยู่หรือไม่
      if (!cart || cart.products.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // คำนวณยอดรวมจากตะกร้า
      const totalAmount = cart.products.reduce((acc, cp) => {
        // ตรวจสอบว่า cp.product มีค่าไม่เป็น undefined
        const price = cp.product?.price || 0; // ใช้ค่าปริยายเป็น 0 ถ้าไม่มีราคา
        return acc + price; 
      }, 0);

      // สร้างลิงก์ชำระเงิน
      const paymentLink = createPaymentLink(totalAmount);

      res.status(200).json({ totalAmount, paymentLink });
    } catch (error) {
      console.error('Error creating payment link:', error.message); // แสดงข้อความที่เกิดข้อผิดพลาด
      res.status(500).json({ error: 'Error creating payment link', details: error.message });
    } finally {
      await prisma.$disconnect(); // ปิดการเชื่อมต่อ
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

// ฟังก์ชันสร้างลิงก์ชำระเงิน PromptPay
function createPaymentLink(amount) {
  const promptPayNumber = "0943691074"; // หมายเลข PromptPay
  return `https://promptpay.io/${promptPayNumber}/${amount}`;
}