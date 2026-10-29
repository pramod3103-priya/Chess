const User = require('../models/User');
const Game = require('../models/Game');

// @desc    Get user profile by username
// @route   GET /api/users/:username
const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const recentGames = await Game.find({
            $or: [{ whitePlayer: user._id }, { blackPlayer: user._id }],
            status: { $in: ['CHECKMATE', 'STALEMATE', 'DRAW', 'RESIGNED', 'ABANDONED', 'TIMEOUT'] }
        })
            .sort({ updatedAt: -1 })
            .limit(10)
            .populate('whitePlayer', 'username rating')
            .populate('blackPlayer', 'username rating');

        res.json({
            success: true,
            user,
            recentGames
        });
    } catch (err) {
        console.error('User profile error:', err);
        res.status(500).json({ success: false, message: 'Server error retrieving profile' });
    }
};

module.exports = {
    getUserProfile
};

