const mongoose = require('mongoose');

const moveSchema = new mongoose.Schema({
    player: {
        type: String,
        enum: ['w', 'b'],
        required: true
    },
    san: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    promotion: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const gameSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true,
        trim: true
    },
    whitePlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    blackPlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    whitePlayerToken: {
        type: String,
        default: null
    },
    blackPlayerToken: {
        type: String,
        default: null
    },
    whiteName: {
        type: String,
        default: 'White'
    },
    blackName: {
        type: String,
        default: 'Black'
    },
    fen: {
        type: String,
        default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    },
    pgn: {
        type: String,
        default: ''
    },
    moves: [moveSchema],
    timeControl: {
        initial: { type: Number, default: 600 }, // seconds (10 min)
        increment: { type: Number, default: 0 }
    },
    clocks: {
        white: { type: Number, default: 600 },
        black: { type: Number, default: 600 }
    },
    status: {
        type: String,
        enum: [
            'WAITING',
            'ACTIVE',
            'COMPLETED',
            'CHECKMATE',
            'STALEMATE',
            'DRAW',
            'RESIGNED',
            'CANCELLED',
            'ABANDONED',
            'TIMEOUT'
        ],
        default: 'WAITING'
    },
    winner: {
        type: String,
        enum: ['w', 'b', 'draw', null],
        default: null
    },
    loser: {
        type: String,
        enum: ['w', 'b', null],
        default: null
    },
    result: {
        type: String,
        default: ''
    },
    endedAt: {
        type: Date,
        default: null
    },
    spectators: [
        {
            socketId: String,
            username: String
        }
    ],
    ratingChange: {
        white: { type: Number, default: 0 },
        black: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

gameSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Game', gameSchema);

