import { PrismaClient } from '@prisma/client';
import { authenticateToken } from './auth';


const prisma = new PrismaClient();

export default async function handler(req, res) {
    await authenticateToken(req, res, async () => {
        if (req.method === 'GET') {
            try {
                const users = await prisma.Users.findMany();
                res.status(200).json(users);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch users', details: error.message });
            }
        } else {
            res.status(405).json({ message: 'Method Not Allowed' });
        }
    }); // ✅ Fixed: Closing `)` correctly without `:`
}
