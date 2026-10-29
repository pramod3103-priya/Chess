const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || 'super_secret_pramod_chess_jwt_key_2026_dev',
        { expiresIn: '30d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const { username, email, password, avatar } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username, email and password'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.trim();

        // Check if user already exists
        const userExists = await User.findOne({
            $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: userExists.email === normalizedEmail
                    ? 'An account with this email already exists'
                    : 'This username is already taken'
            });
        }

        const user = await User.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password,
            avatar: avatar || '♟️'
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                rating: user.rating,
                gamesPlayed: user.gamesPlayed,
                gamesWon: user.gamesWon,
                gamesLost: user.gamesLost,
                gamesDrawn: user.gamesDrawn
            },
            token
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server error during registration'
        });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const loginId = req.body.loginId || req.body.identifier || req.body.email || req.body.username;
        const { password } = req.body;

        if (!loginId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email/username and password'
            });
        }

        const trimmed = loginId.trim();

        // Support login by email OR username
        const user = await User.findOne({
            $or: [
                { email: trimmed.toLowerCase() },
                { username: trimmed }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. User not found.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Password incorrect.'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                rating: user.rating,
                gamesPlayed: user.gamesPlayed,
                gamesWon: user.gamesWon,
                gamesLost: user.gamesLost,
                gamesDrawn: user.gamesDrawn
            },
            token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    register,
    login,
    getMe
};

