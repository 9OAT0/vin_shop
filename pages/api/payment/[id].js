import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const userId = req.headers['x-user-id']; // ✅ จาก Global Middleware
  const userRole = req.headers['x-user-role'];
  const {
    query: { id }, // 🆔 userId จาก URL param
  } = req;

  if (req.method === 'GET') {
    // ✅ ตรวจสอบสิทธิ์: USER ดูได้เฉพาะของตัวเอง
    if (userRole === 'USER' && id !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only view your own cart.' });
    }

    try {
      const cart = await prisma.cart.findUnique({
        where: { userId: id },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) {
        return res.status(404).json({ error: 'Cart not found for this user.' });
      }

      const totalAmount = cart.products.reduce((acc, cp) => {
        return acc + (cp.product.price || 0);
      }, 0);

      const paymentLink = createPaymentLink(totalAmount);

      res.status(200).json({ totalAmount, paymentLink });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ error: 'Error fetching cart', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// ✅ ฟังก์ชันสร้างลิงก์ PromptPay
function createPaymentLink(amount) {
  const promptPayNumber = "0943691074"; // PromptPay ของร้านค้า
  return `https://promptpay.io/${promptPayNumber}/${amount}`;
}
