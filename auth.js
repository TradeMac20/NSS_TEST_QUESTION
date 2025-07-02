const jwt = require('jsonwebtoken');
require('dotenv').config();

secret = process.env.JWT_TOKEN;
const str_secret = String(secret);

//Serving as a middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided.' });
    }
    // Check if the token is in the format "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token malformed.' });
    }
    // Verify the token using the secret key
    jwt.verify(token, str_secret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token.' });
        }
        req.user = decoded; // Attach the decoded user info to the request object
        next();
    });
}

module.exports = authenticateToken;