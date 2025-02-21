import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, productId } = req.body; // ดึง userId และ productId จาก body

        if (!userId || !productId) {
            return res.status(400).json({ error: 'User ID and Product ID are required.' });
        }

        console.log(`Received request with User ID: ${userId} and Product ID: ${productId}`);

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
                cart = await prisma.cart.create({
                    data: {
                        userId: userId,
                        products: {
                            create: {
                                productId: productId,
                                firstPicture: await getProductFirstPicture(productId),
                            },
                        },
                    },
                });

                return res.status(201).json(cart);
            } else {
                const productExists = await prisma.cartProduct.findFirst({
                    where: {
                        cartId: user.cart.id,
                        productId: productId,
                    },
                });

                if (productExists) {
                    return res.status(201).json({ error: 'Product already in cart' });
                }

                const cartProduct = await prisma.cartProduct.create({
                    data: {
                        cartId: user.cart.id,
                        productId: productId,
                        firstPicture: await getProductFirstPicture(productId),
                    },
                });

                return res.status(201).json(cartProduct);
            }
        } catch (error) {
            console.error('Error during operation:', {
                message: error.message,
                stack: error.stack,
            });
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
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