const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_pramod_chess_jwt_key_2026_dev');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth verification error:', err.message);
        return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
};

const optionalAuth = async (req, res, next) => {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_pramod_chess_jwt_key_2026_dev');
        req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
        req.user = null;
    }
    next();
};

module.exports = { protect, optionalAuth };

