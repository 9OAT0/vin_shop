import { PrismaClient } from '@prisma/client';
import { checkUserRole } from './auth'; // Import the role-checking middleware

const prisma = new PrismaClient();

export default async function handler(req, res) {
    // Check if the user is an admin
    await checkUserRole('ADMIN')(req, res, async () => {
        if (req.method === 'GET') {
            try {
                // Fetch all orders along with product data
                const orders = await prisma.order.findMany({
                    include: {
                        product: true, // Include product information in each order
                    },
                });

                // Check if there are no orders
                if (!orders || orders.length === 0) {
                    return res.status(404).json({ message: 'No orders found for admin.' });
                }

                console.log("All Orders Retrieved:", orders); // Log for debugging

                return res.status(200).json(orders); // Return the list of orders
            } catch (error) {
                console.error('Error fetching orders for admin:', error); // Log error
                return res.status(500).json({ error: 'Error fetching orders', details: error.message });
            }
        } else {
            res.setHeader('Allow', ['GET']); // Specify allowed methods
            return res.status(405).end(`Method ${req.method} Not Allowed`); // Handle non-GET requests
        }
    });
}