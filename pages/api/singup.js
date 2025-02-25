// pages/api/register.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, name, isAdmin } = req.body;

    if (!email || !password || !name ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = isAdmin ? 'ADMIN' : 'USER'; // Assign role based on isAdmin flag

    try {
      const newUser = await prisma.users.create({
        data: {
          email,
          password: hashedPassword,
          name,
          location: '',
          role, // Assign role
        },
      });
      return res.status(201).json({ message: 'User created successfully', userId: newUser.id });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Error creating user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}