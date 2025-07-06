import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userId = req.headers['x-user-id'];

  try {
    // ✅ ค้นหาตะกร้าของ user
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        products: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // ✅ คำนวณยอดรวม
    const totalAmount = cart.products.reduce((acc, cp) => {
      const price = cp.product?.price || 0;
      return acc + price;
    }, 0);

    // ✅ สร้างลิงก์ PromptPay
    const paymentLink = createPaymentLink(totalAmount);

    res.status(200).json({ totalAmount, paymentLink });
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: 'Error creating payment link', details: error.message });
  }
}

// ✅ ฟังก์ชันสร้างลิงก์ชำระเงิน PromptPay
function createPaymentLink(amount) {
  const promptPayNumber = "0943691074"; // หมายเลข PromptPay
  return `https://promptpay.io/${promptPayNumber}/${amount}`;
}
