import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../auth';


const prisma = new PrismaClient();

export default async function handler(req, res) {
  await authenticateToken(req, res, async() => {
  const {
    query: { id }, // userId ที่มาจาก query params
  } = req;

  if (req.method === 'GET') {
    if (!id) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
      // ค้นหา cart ตาม userId
      const cart = await prisma.cart.findUnique({
        where: {
          userId: id,
        },
        include: {
          products: {
            include: {
              product: true, // ดึงข้อมูลผลิตภัณฑ์ที่เชื่อมโยง
            },
          },
        },
      });

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found for this user.' });
      }

      // คำนวณจำนวนเงินทั้งหมด
      const totalAmount = cart.products.reduce((acc, cp) => {
        return acc + (cp.product.price || 0); // ค่าเริ่มต้นเป็น 0 หากราคาเป็น null
      }, 0);
      
      // สร้างลิงก์ชำระเงิน
      const paymentLink = createPaymentLink(totalAmount); // คุณสามารถสร้างฟังก์ชันนี้ได้เอง

      res.status(200).json({ totalAmount, paymentLink });
    } catch (error) {
      console.error('Error fetching cart:', error.message);
      res.status(500).json({ error: 'Error fetching cart', details: error.message });
    } finally {
      await prisma.$disconnect(); // ปิดการเชื่อมต่อ
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
});
}

// ฟังก์ชันสำหรับสร้างลิงก์ชำระเงิน PromptPay
function createPaymentLink(amount) {
  // คุณจะต้องใช้ข้อมูลที่สำคัญในการสร้างลิงก์เช่นเบอร์โทรศัพท์หรือหมายเลข PromptPay
  const promptPayNumber = "0943691074"; // เติมหมายเลข PromptPay ที่เกี่ยวข้อง
  return `https://promptpay.io/${promptPayNumber}/${amount}`;
}