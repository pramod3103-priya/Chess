const { Chess } = require('chess.js');

/**
 * Creates a new chess.js instance from an optional FEN
 */
function createChessInstance(fen) {
    if (fen) {
        return new Chess(fen);
    }
    return new Chess();
}

/**
 * Validate and execute a move on a Chess instance.
 * @param {Chess} chess - chess.js instance
 * @param {{ from: string, to: string, promotion?: string }} moveData
 * @returns {object|null} The executed Move object or null if illegal
 */
function validateAndMakeMove(chess, { from, to, promotion = 'q' }) {
    try {
        const move = chess.move({
            from: from.toLowerCase(),
            to: to.toLowerCase(),
            promotion: promotion ? promotion.toLowerCase() : 'q'
        });
        return move;
    } catch (err) {
        return null;
    }
}

/**
 * Check game termination status
 * @param {Chess} chess
 * @returns {{ isGameOver: boolean, status: string, winner: string|null, result: string }}
 */
function getGameStatus(chess) {
    if (chess.isCheckmate()) {
        const winnerColor = chess.turn() === 'w' ? 'b' : 'w';
        const winnerName = winnerColor === 'w' ? 'White' : 'Black';
        return {
            isGameOver: true,
            status: 'CHECKMATE',
            winner: winnerColor,
            result: `Checkmate! ${winnerName} wins.`
        };
    }

    if (chess.isDraw()) {
        let resultReason = 'Draw.';
        let status = 'DRAW';

        if (chess.isStalemate()) {
            status = 'STALEMATE';
            resultReason = 'Draw by Stalemate.';
        } else if (chess.isThreefoldRepetition()) {
            resultReason = 'Draw by Threefold Repetition.';
        } else if (chess.isInsufficientMaterial()) {
            resultReason = 'Draw by Insufficient Material.';
        } else {
            resultReason = 'Draw by 50-move rule.';
        }

        return {
            isGameOver: true,
            status,
            winner: 'draw',
            result: resultReason
        };
    }

    return {
        isGameOver: false,
        status: 'ACTIVE',
        winner: null,
        result: ''
    };
}

module.exports = {
    createChessInstance,
    validateAndMakeMove,
    getGameStatus
};

