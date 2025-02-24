import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY; // Your secret key from the .env file

export const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from headers

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' }); // Use res.status()
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' }); // Use res.status()
        }

        req.user = user; // Store verified user's data in req
        next(); // Proceed to the next middleware or route handler
    });
};

// Middleware to check if user is an admin or a regular user
export const checkUserRole = (expectedRole) => {
    return (req, res, next) => {
        authenticateToken(req, res, () => {
            if (req.user.role !== expectedRole) {
                console.log(req.user.role)
                return res.status(403).json({ error: `Access denied. ${expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1)} only.` });
            }
            next();
        });
    };
};