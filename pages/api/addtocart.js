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

            let cart;

            if (!user.cart) {
                // Create a new cart if the user does not have one
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

                    return res.status(202).json({ error: 'Product already in cart' });

                }

                // Fetch product details to get the product name
                const product = await prisma.products.findUnique({
                    where: { id: productId },
                });

                if (!product) {
                    return res.status(404).json({ error: 'Product not found' });
                }

                // Create a new cart product
                const cartProduct = await prisma.cartProduct.create({
                    data: {
                        cartId: user.cart.id,
                        productId: productId,
                        firstPicture: await getProductFirstPicture(productId),
                        productName: product.name, // Set the name from the fetched product
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

// Function to get the first picture of a product
async function getProductFirstPicture(productId) {
    const product = await prisma.products.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
    }
    return product.pictures[0] || null; // Return the first picture or null
}