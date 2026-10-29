const Game = require('../models/Game');
const User = require('../models/User');

// @desc    Get user game history
// @route   GET /api/games/history
const getGameHistory = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.query.userId;
        const query = userId
            ? {
                $or: [{ whitePlayer: userId }, { blackPlayer: userId }],
                status: { $in: ['CHECKMATE', 'STALEMATE', 'DRAW', 'RESIGNED', 'ABANDONED', 'TIMEOUT'] }
            }
            : { status: { $in: ['CHECKMATE', 'STALEMATE', 'DRAW', 'RESIGNED', 'ABANDONED', 'TIMEOUT'] } };

        const games = await Game.find(query)
            .sort({ updatedAt: -1 })
            .limit(50)
            .populate('whitePlayer', 'username avatar rating')
            .populate('blackPlayer', 'username avatar rating');

        res.json({
            success: true,
            count: games.length,
            games
        });
    } catch (err) {
        console.error('Fetch game history error:', err);
        res.status(500).json({ success: false, message: 'Server error retrieving history' });
    }
};

// @desc    Get a single game by Room ID or ID
// @route   GET /api/games/:roomId
const getGameById = async (req, res) => {
    try {
        const { roomId } = req.params;
        const game = await Game.findOne({
            $or: [{ roomId: roomId.toUpperCase() }, { _id: roomId.match(/^[0-9a-fA-F]{24}$/) ? roomId : null }]
        })
            .populate('whitePlayer', 'username avatar rating')
            .populate('blackPlayer', 'username avatar rating');

        if (!game) {
            return res.status(404).json({ success: false, message: 'Game not found' });
        }

        res.json({
            success: true,
            game
        });
    } catch (err) {
        console.error('Fetch game by ID error:', err);
        res.status(500).json({ success: false, message: 'Server error retrieving game' });
    }
};

// @desc    Get active games for lobby
// @route   GET /api/games/lobby
const getActiveLobbyGames = async (req, res) => {
    try {
        const games = await Game.find({
            status: { $in: ['WAITING', 'ACTIVE'] }
        })
            .sort({ updatedAt: -1 })
            .limit(20)
            .populate('whitePlayer', 'username avatar rating')
            .populate('blackPlayer', 'username avatar rating');

        res.json({
            success: true,
            games
        });
    } catch (err) {
        console.error('Fetch lobby games error:', err);
        res.status(500).json({ success: false, message: 'Server error retrieving lobby' });
    }
};

// @desc    Get top rated players
// @route   GET /api/games/leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find({})
            .sort({ rating: -1 })
            .limit(20)
            .select('username avatar rating gamesPlayed gamesWon gamesLost gamesDrawn');

        res.json({
            success: true,
            leaderboard: users
        });
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ success: false, message: 'Server error retrieving leaderboard' });
    }
};

// @desc    Create a new game via REST API
// @route   POST /api/games
const createGameREST = async (req, res) => {
    try {
        const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let roomId = '';
        let exists = true;
        while (exists) {
            roomId = '';
            for (let i = 0; i < 6; i++) {
                roomId += CHARS[Math.floor(Math.random() * CHARS.length)];
            }
            exists = await Game.exists({ roomId });
        }

        const initialTime = req.body.timeControl || 600;
        const inc = req.body.increment || 0;

        const game = await Game.create({
            roomId,
            whitePlayer: req.user ? req.user._id : null,
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            timeControl: { initial: initialTime, increment: inc },
            clocks: { white: initialTime, black: initialTime },
            status: 'WAITING'
        });

        res.status(201).json({
            success: true,
            roomId,
            game
        });
    } catch (err) {
        console.error('Create game error:', err);
        res.status(500).json({ success: false, message: 'Server error creating game' });
    }
};

// @desc    Join an existing game via REST API
// @route   POST /api/games/:roomId/join
const joinGameREST = async (req, res) => {
    try {
        const roomId = req.params.roomId.toUpperCase().trim();
        const game = await Game.findOne({ roomId });

        if (!game) {
            return res.status(404).json({ success: false, message: 'Game room not found' });
        }

        if (game.status === 'COMPLETED' || game.status === 'ABANDONED') {
            return res.status(400).json({ success: false, message: 'This game has already finished' });
        }

        if (!game.blackPlayer && req.user && String(game.whitePlayer) !== String(req.user._id)) {
            game.blackPlayer = req.user._id;
            game.status = 'ACTIVE';
            await game.save();
        }

        res.json({
            success: true,
            roomId,
            game
        });
    } catch (err) {
        console.error('Join game error:', err);
        res.status(500).json({ success: false, message: 'Server error joining game' });
    }
};

module.exports = {
    createGameREST,
    joinGameREST,
    getGameHistory,
    getGameById,
    getActiveLobbyGames,
    getLeaderboard
};

