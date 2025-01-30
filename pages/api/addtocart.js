import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, productId } = req.body; // ดึง userId และ productId จาก body

    // ตรวจสอบว่า userId และ productId ถูกส่งมาหรือไม่
    if (!userId || !productId) {
      return res.status(400).json({ error: 'User ID and Product ID are required.' });
    }

    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { cart: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let cart;

      if (!user.cart) {
        // สร้าง Cart ใหม่
        cart = await prisma.cart.create({
          data: {
            userId: userId,
            products: {
              create: {
                productId: productId,
                firstPicture: await getProductFirstPicture(productId), // ดึงรูปภาพแรก
              },
            },
          },
        });

        return res.status(201).json(cart);
      } else {
        // ตรวจสอบว่าผลิตภัณฑ์อยู่ใน Cart หรือไม่
        const productExists = await prisma.cartProduct.findFirst({
          where: {
            cartId: user.cart.id,
            productId: productId,
          },
        });

        if (productExists) {
          return res.status(400).json({ error: 'Product already in cart' });
        }

        // เพิ่มสินค้าไปยัง Cart
        const cartProduct = await prisma.cartProduct.create({
          data: {
            cartId: user.cart.id,
            productId: productId,
            firstPicture: await getProductFirstPicture(productId), // ดึงรูปภาพแรก
          },
        });

        return res.status(201).json(cartProduct);
      }
    } catch (error) {
      console.error('Error adding to cart:', error.message); // แสดงข้อความข้อผิดพลาด
      return res.status(500).json({ error: 'Error adding to cart', details: error.message }); // ส่งข้อมูลแสดงข้อผิดพลาด
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// ฟังก์ชันสำหรับดึงรูปภาพแรกของผลิตภัณฑ์
async function getProductFirstPicture(productId) {
  const product = await prisma.products.findUnique({
    where: { id: productId },
  });
  return product?.pictures[0] || null; // คืนค่าภาพแรกหรือ null ถ้าไม่มี
}