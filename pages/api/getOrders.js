import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  await authenticateToken(req, res, async (user) => { // Pass the user object
    if (req.method === 'GET') {
      const { userId } = req.query; // Get userId from query params

      console.log(`Fetching orders for userId: ${userId}`);

      try {
        let orders;

        // Check if the authenticated user is an admin
        if (user.role === 'ADMIN') {
          // If the user is an admin, fetch all orders
          orders = await prisma.order.findMany({
            include: {
              product: true, // Include product information in the order
            },
          });
        } else {
          // If not admin, verify userId is provided and fetch orders for the specific user
          if (!userId) {
            return res.status(400).json({ error: 'User ID must be provided' });
          }

          orders = await prisma.order.findMany({
            where: { userId: userId },
            include: {
              product: true, // Include product information in the order
            },
          });
        }

        console.log("Orders Retrieved:", orders); 

        // Check if there are no orders
        if (!orders || orders.length === 0) {
          console.log(`No orders found for userId: ${userId}`);
          return res.status(404).json({ message: 'No orders found for this user' });
        }

        // Transform orders to include the first image of each product
        const ordersWithPictures = orders.map(order => ({
          ...order,
          picture: order.product?.pictures[0] || null, // First image from product
        }));

        return res.status(200).json(ordersWithPictures); // Return orders
      } catch (error) {
        console.error('Error fetching orders:', error); // Log error
        return res.status(500).json({ error: 'Error fetching orders', details: error.message });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}