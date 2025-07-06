import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ error: 'User ID and Product ID are required.' });
        }

        console.log(`Received request with User ID: ${userId} and Product ID: ${productId}`);

        try {
            const user = await prisma.users.findUnique({
                where: { id: userId },
                include: { cart: true }, // Only include cart
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Fetch product details to get the product name and picture
            const product = await prisma.products.findUnique({
                where: { id: productId },
            });

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            let cart;

            if (!user.cart) {
                // Create a new cart if the user does not have one
                cart = await prisma.cart.create({
                    data: {
                        userId: userId,
                        products: {
                            create: {
                                productId: productId,
                                productName: product.name, // Include product name
                                firstPicture: product.pictures[0] || null, // Set first picture
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
                    return res.status(409).json({ error: 'Product already in cart' });
                }

                // Create a new cart product
                const cartProduct = await prisma.cartProduct.create({
                    data: {
                        cartId: user.cart.id,
                        productId: productId,
                        productName: product.name, // Use the fetched product name
                        firstPicture: product.pictures[0] || null, // Use the fetched first picture
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