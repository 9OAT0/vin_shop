import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

export default async function handler(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.status(200).json({ 
            message: 'Authenticated',
            user: decoded 
        });
    } catch (err) {
        console.error('Error:', err.message || err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}