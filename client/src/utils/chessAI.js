/**
 * Client-Side Autonomous Chess AI Engine
 * Minimax with Alpha-Beta Pruning, Move Ordering, and Piece-Square Tables (PST).
 * Completely offline, zero server dependency.
 */

// Tomasz Michniewski's Piece-Square Tables (White perspective; flipped for Black)
const PAWN_PST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_PST = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_PST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_PST = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_MIDGAME_PST = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
];

const PIECE_VALUES = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
};

// Evaluate the board statically from White's perspective (+ for White, - for Black)
function evaluateBoard(chess) {
    if (chess.isCheckmate()) {
        // If turn is White, White is mated (-Infinity), else Black is mated (+Infinity)
        return chess.turn() === 'w' ? -999999 : 999999;
    }

    if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
        return 0;
    }

    let score = 0;
    const board = chess.board();

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;

            const val = PIECE_VALUES[piece.type] || 0;
            let pst = 0;

            const row = piece.color === 'w' ? r : 7 - r;
            const col = piece.color === 'w' ? c : 7 - c;

            switch (piece.type) {
                case 'p': pst = PAWN_PST[row][col]; break;
                case 'n': pst = KNIGHT_PST[row][col]; break;
                case 'b': pst = BISHOP_PST[row][col]; break;
                case 'r': pst = ROOK_PST[row][col]; break;
                case 'q': pst = QUEEN_PST[row][col]; break;
                case 'k': pst = KING_MIDGAME_PST[row][col]; break;
                default: pst = 0;
            }

            const total = val + pst;
            if (piece.color === 'w') {
                score += total;
            } else {
                score -= total;
            }
        }
    }

    // Small bonus for being the player with initiative (current turn)
    return score;
}

// Opening book for quick and diverse opening moves
const OPENING_BOOK = {
    // Initial position White moves
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [
        { from: 'e2', to: 'e4' }, // 1. e4 King's Pawn
        { from: 'd2', to: 'd4' }, // 1. d4 Queen's Pawn
        { from: 'g1', to: 'f3' }, // 1. Nf3 Reti
        { from: 'c2', to: 'c4' }  // 1. c4 English
    ],
    // Black responses to 1. e4
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3': [
        { from: 'e7', to: 'e5' }, // 1... e5 Open Game
        { from: 'c7', to: 'c5' }, // 1... c5 Sicilian
        { from: 'e7', to: 'e6' }, // 1... e6 French
        { from: 'c7', to: 'c6' }  // 1... c6 Caro-Kann
    ],
    // Black responses to 1. d4
    'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3': [
        { from: 'd7', to: 'd5' }, // 1... d5 Queen's Pawn Game
        { from: 'g8', to: 'f6' }, // 1... Nf6 Indian Defenses
        { from: 'e7', to: 'e6' }
    ]
};

// Order moves to optimize Alpha-Beta pruning cutoffs: Captures & checks first
function orderMoves(moves) {
    return moves.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Checks
        if (a.san && a.san.includes('+')) scoreA += 500;
        if (b.san && b.san.includes('+')) scoreB += 500;

        // MVV-LVA for captures
        if (a.captured) {
            scoreA += (PIECE_VALUES[a.captured] || 100) * 10 - (PIECE_VALUES[a.piece] || 100);
        }
        if (b.captured) {
            scoreB += (PIECE_VALUES[b.captured] || 100) * 10 - (PIECE_VALUES[b.piece] || 100);
        }

        // Promotions
        if (a.promotion) scoreA += 800;
        if (b.promotion) scoreB += 800;

        // Center control preference
        const centerSquares = ['e4', 'e5', 'd4', 'd5', 'c4', 'c5', 'f3', 'f6', 'c3', 'c6'];
        if (centerSquares.includes(a.to)) scoreA += 30;
        if (centerSquares.includes(b.to)) scoreB += 30;

        return scoreB - scoreA;
    });
}

// Alpha-Beta Minimax search
function minimax(chess, depth, alpha, beta, isMaximizing) {
    if (depth === 0 || chess.isGameOver()) {
        return evaluateBoard(chess);
    }

    const legalMoves = orderMoves(chess.moves({ verbose: true }));
    if (legalMoves.length === 0) {
        return evaluateBoard(chess);
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of legalMoves) {
            chess.move(move);
            const evaluation = minimax(chess, depth - 1, alpha, beta, false);
            chess.undo();

            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break; // Beta cutoff
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of legalMoves) {
            chess.move(move);
            const evaluation = minimax(chess, depth - 1, alpha, beta, true);
            chess.undo();

            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break; // Alpha cutoff
        }
        return minEval;
    }
}

/**
 * Calculates the best move for the AI opponent
 * @param {Chess} chess - Instance of chess.js
 * @param {'easy'|'medium'|'hard'} difficulty - AI difficulty level
 * @returns {object|null} - Best move object { from, to, promotion }
 */
export function getAIMove(chess, difficulty = 'medium') {
    if (!chess || chess.isGameOver()) return null;

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    const isWhite = chess.turn() === 'w';

    // Check opening book for instant, natural opening moves (Medium and Hard)
    if (difficulty !== 'easy') {
        const fenPrefix = chess.fen().split(' ').slice(0, 4).join(' ');
        const bookMoves = OPENING_BOOK[fenPrefix];
        if (bookMoves && bookMoves.length > 0) {
            const picked = bookMoves[Math.floor(Math.random() * bookMoves.length)];
            return {
                from: picked.from,
                to: picked.to,
                promotion: 'q'
            };
        }
    }

    // 1. EASY MODE (Depth 1 with intentional randomness / blunder factor)
    if (difficulty === 'easy') {
        // 35% chance to make a random legal move for casual play
        if (Math.random() < 0.35) {
            const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            return {
                from: randomMove.from,
                to: randomMove.to,
                promotion: randomMove.promotion || 'q'
            };
        }

        // Otherwise pick the best 1-ply capture or advance
        let bestMove = legalMoves[0];
        let bestVal = isWhite ? -Infinity : Infinity;

        for (const move of legalMoves) {
            chess.move(move);
            const val = evaluateBoard(chess);
            chess.undo();

            if (isWhite ? val > bestVal : val < bestVal) {
                bestVal = val;
                bestMove = move;
            }
        }
        return {
            from: bestMove.from,
            to: bestMove.to,
            promotion: bestMove.promotion || 'q'
        };
    }

    // 2. MEDIUM MODE (Depth 3 with positional evaluation)
    const searchDepth = difficulty === 'hard' ? 4 : 3;
    const orderedMoves = orderMoves([...legalMoves]);

    let bestMove = orderedMoves[0];
    let bestVal = isWhite ? -Infinity : Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of orderedMoves) {
        chess.move(move);
        const val = minimax(chess, searchDepth - 1, alpha, beta, !isWhite);
        chess.undo();

        if (isWhite) {
            if (val > bestVal) {
                bestVal = val;
                bestMove = move;
            }
            alpha = Math.max(alpha, val);
        } else {
            if (val < bestVal) {
                bestVal = val;
                bestMove = move;
            }
            beta = Math.min(beta, val);
        }
    }

    return {
        from: bestMove.from,
        to: bestMove.to,
        promotion: bestMove.promotion || 'q'
    };
}

export const findBestMove = getAIMove;
export { evaluateBoard };
