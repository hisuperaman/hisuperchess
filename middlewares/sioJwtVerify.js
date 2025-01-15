const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

function sioVerifyToken(socket, next) {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
        return next(new Error('Cookie header missing'));
    }

    const cookies = Object.fromEntries(
        cookieHeader.split('; ').map((c) => c.split('='))
    );

    const token = cookies.token;

    if (!token) {
        return next(new Error('Token missing'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.id = decoded.id;
        return next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return next(new Error('Invalid token'));
    }
}

module.exports = sioVerifyToken;