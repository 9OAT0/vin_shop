import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!SECRET_KEY) {
        console.error('SECRET_KEY is not defined in .env');
        return res.status(500).json({ error: 'Server misconfiguration: SECRET_KEY not defined' });
    }

    try {
        const user = await prisma.Users.findFirst({
            where: { email },
        });

        console.log(user)

        if (!user) {
            console.error('User not found for email:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Hash comparison: entered password vs stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        console.log("Password entered:", password);
        console.log("Stored password hash:", user.password);  // This is the hashed password from DB
        console.log("Is password valid:", isPasswordValid);

        if (!isPasswordValid) {
            console.log('Password mismatch for email:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const tokenPayload = { id: user.id, role: user.role };
        const user_id = user.id
        const user_role = user.role

        console.log(tokenPayload)
        console.log(user)

        if (!tokenPayload.id || !tokenPayload.role) {
            console.error('Invalid payload:', tokenPayload);
            return res.status(500).json({ error: 'Failed to generate token', role, id });
        }

        const token = jwt.sign(tokenPayload, SECRET_KEY, {
            expiresIn: '12h',
        });

        res.status(200).json({ message: 'Login successful', token, user_id , user_role });
    } catch (error) {
        console.error('Error:', error.message || error);
        res.status(500).json({ error: 'Login failed', details: error.message || error });
    }
}