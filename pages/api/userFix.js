import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userRole = req.headers['x-user-role'];

  if (req.method === 'GET') {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          email: true,
          location: true,
          name: true,
          phoneNumber: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, location, password, phoneNumber } = req.body;

      const updatedData = {
        ...(name && { name }),
        ...(location && { location }),
        ...(phoneNumber && { phoneNumber }),
      };

      if (password) {
        updatedData.password = await bcrypt.hash(password, 10);
      }

      const user = await prisma.users.update({
        where: { id: userId },
        data: updatedData,
        select: {
          email: true,
          location: true,
          name: true,
          phoneNumber: true,
        },
      });

      return res.status(200).json(user);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
