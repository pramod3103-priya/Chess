const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;
const DEFAULT_TIME = 600; // 10 minutes per player in seconds
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 6-character alphanumeric (no ambiguous 0/O, 1/I)

// Serve frontend static files
app.use(express.static(path.join(__dirname)));

// In-memory room store: roomCode -> roomData
const rooms = new Map();

function generateRoomCode() {
    let code = '';
    let attempts = 0;
    do {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        attempts++;
        if (attempts > 500) break;
    } while (rooms.has(code));
    return code;
}

function stopClock(room) {
    if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
    }
}

function startClock(room) {
    stopClock(room);
    room.lastMoveTimestamp = Date.now();
    room.timerInterval = setInterval(() => {
        if (room.status !== 'playing') {
            stopClock(room);
            return;
        }

        const activeColor = room.chess.turn() === 'w' ? 'white' : 'black';
        const opponentColor = activeColor === 'white' ? 'black' : 'white';

        room.clocks[activeColor]--;

        // Emit clock sync every second
        io.to(room.code).emit('clock_tick', {
            clocks: room.clocks,
            turn: room.chess.turn()
        });

        // Time out check
        if (room.clocks[activeColor] <= 0) {
            room.clocks[activeColor] = 0;
            room.status = 'gameover';
            room.winner = opponentColor;
            room.endReason = 'Time Out';
            stopClock(room);

            io.to(room.code).emit('game_over', {
                winner: opponentColor,
                endReason: `${activeColor === 'white' ? 'White' : 'Black'} ran out of time!`,
                clocks: room.clocks
            });
        }
    }, 1000);
}

function sanitizeRoomData(room, playerColor) {
    return {
        roomCode: room.code,
        status: room.status,
        color: playerColor,
        fen: room.chess.fen(),
        pgn: room.chess.pgn(),
        history: room.chess.history({ verbose: true }),
        turn: room.chess.turn(),
        inCheck: room.chess.inCheck(),
        clocks: room.clocks,
        whiteConnected: !!(room.players.white && room.players.white.connected),
        blackConnected: !!(room.players.black && room.players.black.connected),
        whiteName: room.players.white ? room.players.white.name : 'Player 1',
        blackName: room.players.black ? room.players.black.name : 'Player 2'
    };
}

io.on('connection', (socket) => {
    let currentRoomCode = null;
    let playerColor = null;

    // 1. Create Room (Player 1 / White)
    socket.on('create_room', (data, callback) => {
        try {
            const code = generateRoomCode();
            const sessionToken = crypto.randomBytes(16).toString('hex');
            const playerName = (data && data.name && data.name.trim()) || 'Player 1';

            const room = {
                code,
                chess: new Chess(),
                status: 'waiting',
                createdAt: Date.now(),
                players: {
                    white: {
                        socketId: socket.id,
                        name: playerName,
                        token: sessionToken,
                        connected: true
                    },
                    black: null
                },
                clocks: {
                    white: DEFAULT_TIME,
                    black: DEFAULT_TIME
                },
                timerInterval: null,
                rematchRequested: { white: false, black: false },
                abandonTimeout: null
            };

            rooms.set(code, room);
            socket.join(code);
            currentRoomCode = code;
            playerColor = 'white';

            if (typeof callback === 'function') {
                callback({
                    success: true,
                    roomCode: code,
                    color: 'white',
                    sessionToken
                });
            }
        } catch (err) {
            console.error('Error creating room:', err);
            if (typeof callback === 'function') {
                callback({ success: false, error: 'Server error while creating room.' });
            }
        }
    });

    // 2. Join Room (Player 2 / Black)
    socket.on('join_room', (data, callback) => {
        try {
            if (!data || !data.roomCode) {
                if (typeof callback === 'function') {
                    return callback({ success: false, error: 'Please enter a 6-character room code.' });
                }
                return;
            }

            const code = data.roomCode.trim().toUpperCase();
            const room = rooms.get(code);

            if (!room) {
                if (typeof callback === 'function') {
                    return callback({ success: false, error: 'Room not found. Check code and try again.' });
                }
                return;
            }

            // Check if reconnecting
            if (data.sessionToken) {
                if (room.players.white && room.players.white.token === data.sessionToken) {
                    room.players.white.socketId = socket.id;
                    room.players.white.connected = true;
                    socket.join(code);
                    currentRoomCode = code;
                    playerColor = 'white';

                    if (room.abandonTimeout) {
                        clearTimeout(room.abandonTimeout);
                        room.abandonTimeout = null;
                    }

                    socket.to(code).emit('player_reconnected', { color: 'white' });
                    if (typeof callback === 'function') {
                        callback({
                            success: true,
                            roomCode: code,
                            color: 'white',
                            gameState: sanitizeRoomData(room, 'white')
                        });
                    }
                    return;
                } else if (room.players.black && room.players.black.token === data.sessionToken) {
                    room.players.black.socketId = socket.id;
                    room.players.black.connected = true;
                    socket.join(code);
                    currentRoomCode = code;
                    playerColor = 'black';

                    if (room.abandonTimeout) {
                        clearTimeout(room.abandonTimeout);
                        room.abandonTimeout = null;
                    }

                    socket.to(code).emit('player_reconnected', { color: 'black' });
                    if (typeof callback === 'function') {
                        callback({
                            success: true,
                            roomCode: code,
                            color: 'black',
                            gameState: sanitizeRoomData(room, 'black')
                        });
                    }
                    return;
                }
            }

            // Room slot availability check
            if (room.players.black) {
                if (typeof callback === 'function') {
                    return callback({ success: false, error: 'Room is already full (2 players are in game).' });
                }
                return;
            }

            // Join as Black
            const sessionToken = crypto.randomBytes(16).toString('hex');
            const playerName = (data.name && data.name.trim()) || 'Player 2';

            room.players.black = {
                socketId: socket.id,
                name: playerName,
                token: sessionToken,
                connected: true
            };
            room.status = 'playing';

            socket.join(code);
            currentRoomCode = code;
            playerColor = 'black';

            // Clear abandon timeout if set
            if (room.abandonTimeout) {
                clearTimeout(room.abandonTimeout);
                room.abandonTimeout = null;
            }

            // Start clock
            startClock(room);

            // Notify joiner
            if (typeof callback === 'function') {
                callback({
                    success: true,
                    roomCode: code,
                    color: 'black',
                    sessionToken,
                    gameState: sanitizeRoomData(room, 'black')
                });
            }

            // Notify both players game has started
            io.to(code).emit('game_start', {
                roomCode: code,
                fen: room.chess.fen(),
                turn: room.chess.turn(),
                clocks: room.clocks,
                whiteName: room.players.white.name,
                blackName: room.players.black.name
            });
        } catch (err) {
            console.error('Error joining room:', err);
            if (typeof callback === 'function') {
                callback({ success: false, error: 'Server error while joining room.' });
            }
        }
    });

    // 3. Make Move (Authoritative Chess.js Server Validation)
    socket.on('make_move', (data, callback) => {
        try {
            if (!currentRoomCode || !rooms.has(currentRoomCode)) {
                if (typeof callback === 'function') callback({ success: false, error: 'Invalid room.' });
                return;
            }

            const room = rooms.get(currentRoomCode);

            if (room.status !== 'playing') {
                if (typeof callback === 'function') callback({ success: false, error: 'Game is not active.' });
                return;
            }

            // Turn enforcement: only active player can move
            const currentTurn = room.chess.turn(); // 'w' or 'b'
            const expectedColor = currentTurn === 'w' ? 'white' : 'black';

            if (playerColor !== expectedColor) {
                if (typeof callback === 'function') callback({ success: false, error: "Not your turn." });
                return;
            }

            // Validate move with authoritative server-side chess.js
            let moveResult = null;
            try {
                moveResult = room.chess.move({
                    from: data.from,
                    to: data.to,
                    promotion: data.promotion || 'q'
                });
            } catch (moveErr) {
                moveResult = null;
            }

            if (!moveResult) {
                if (typeof callback === 'function') callback({ success: false, error: 'Illegal move.' });
                return;
            }

            // Check game termination
            let isGameOver = false;
            let winner = null;
            let endReason = null;

            if (room.chess.isCheckmate()) {
                isGameOver = true;
                winner = expectedColor;
                endReason = `Checkmate! ${expectedColor === 'white' ? 'White' : 'Black'} wins! 🎉`;
                room.status = 'gameover';
                stopClock(room);
            } else if (room.chess.isDraw()) {
                isGameOver = true;
                room.status = 'gameover';
                stopClock(room);
                if (room.chess.isStalemate()) {
                    endReason = 'Draw by Stalemate.';
                } else if (room.chess.isThreefoldRepetition()) {
                    endReason = 'Draw by Threefold Repetition.';
                } else if (room.chess.isInsufficientMaterial()) {
                    endReason = 'Draw by Insufficient Material.';
                } else {
                    endReason = 'Draw by 50-Move Rule.';
                }
            }

            // Broadcast move to all players in the room
            io.to(currentRoomCode).emit('move_made', {
                move: moveResult,
                fen: room.chess.fen(),
                turn: room.chess.turn(),
                inCheck: room.chess.inCheck(),
                isGameOver,
                winner,
                endReason,
                clocks: room.clocks,
                history: room.chess.history({ verbose: true })
            });

            if (typeof callback === 'function') {
                callback({ success: true, move: moveResult });
            }
        } catch (err) {
            console.error('Error executing move:', err);
            if (typeof callback === 'function') {
                callback({ success: false, error: 'Server error processing move.' });
            }
        }
    });

    // 4. Player Resigns
    socket.on('resign_game', (data, callback) => {
        if (!currentRoomCode || !rooms.has(currentRoomCode)) return;
        const room = rooms.get(currentRoomCode);

        if (room.status !== 'playing') return;

        const winner = playerColor === 'white' ? 'black' : 'white';
        room.status = 'gameover';
        room.winner = winner;
        room.endReason = `${playerColor === 'white' ? 'White' : 'Black'} resigned.`;
        stopClock(room);

        io.to(currentRoomCode).emit('game_over', {
            winner,
            endReason: `${playerColor === 'white' ? 'White' : 'Black'} resigned. ${winner === 'white' ? 'White' : 'Black'} wins!`,
            clocks: room.clocks
        });

        if (typeof callback === 'function') callback({ success: true });
    });

    // 5. Rematch Request & Agreement
    socket.on('request_rematch', (data, callback) => {
        if (!currentRoomCode || !rooms.has(currentRoomCode)) return;
        const room = rooms.get(currentRoomCode);

        if (room.status !== 'gameover') return;

        room.rematchRequested[playerColor] = true;
        const otherColor = playerColor === 'white' ? 'black' : 'white';

        if (room.rematchRequested[otherColor]) {
            // Both players agreed to rematch: swap colors and reset board
            room.chess = new Chess();
            room.status = 'playing';
            room.clocks = { white: DEFAULT_TIME, black: DEFAULT_TIME };
            room.rematchRequested = { white: false, black: false };

            // Swap player roles
            const temp = room.players.white;
            room.players.white = room.players.black;
            room.players.black = temp;

            startClock(room);

            // Notify both players of new match with swapped colors
            if (room.players.white && room.players.white.socketId) {
                io.to(room.players.white.socketId).emit('rematch_started', {
                    color: 'white',
                    fen: room.chess.fen(),
                    clocks: room.clocks,
                    whiteName: room.players.white.name,
                    blackName: room.players.black.name
                });
            }
            if (room.players.black && room.players.black.socketId) {
                io.to(room.players.black.socketId).emit('rematch_started', {
                    color: 'black',
                    fen: room.chess.fen(),
                    clocks: room.clocks,
                    whiteName: room.players.white.name,
                    blackName: room.players.black.name
                });
            }
        } else {
            // Notify opponent that rematch was offered
            socket.to(currentRoomCode).emit('rematch_offered', {
                offeredBy: playerColor
            });
            if (typeof callback === 'function') callback({ success: true, waiting: true });
        }
    });

    // 6. Leave Room
    socket.on('leave_room', (data, callback) => {
        if (!currentRoomCode || !rooms.has(currentRoomCode)) {
            if (typeof callback === 'function') callback({ success: true });
            return;
        }
        const room = rooms.get(currentRoomCode);
        socket.to(currentRoomCode).emit('player_left', {
            color: playerColor,
            playerName: (playerColor && room.players[playerColor]) ? room.players[playerColor].name : 'Opponent'
        });

        if (room.status === 'playing') {
            room.status = 'gameover';
            stopClock(room);
        }
        if (playerColor && room.players[playerColor]) {
            room.players[playerColor].connected = false;
        }

        socket.leave(currentRoomCode);
        currentRoomCode = null;
        playerColor = null;

        if (typeof callback === 'function') callback({ success: true });
    });

    // 7. Handle Disconnection
    socket.on('disconnect', () => {
        if (!currentRoomCode || !rooms.has(currentRoomCode)) return;
        const room = rooms.get(currentRoomCode);

        if (playerColor && room.players[playerColor]) {
            room.players[playerColor].connected = false;
            socket.to(currentRoomCode).emit('player_disconnected', {
                color: playerColor,
                playerName: room.players[playerColor].name
            });
        }

        // If both players disconnected, start room clean-up timeout (5 minutes)
        const whiteConnected = room.players.white && room.players.white.connected;
        const blackConnected = room.players.black && room.players.black.connected;

        if (!whiteConnected && !blackConnected) {
            stopClock(room);
            room.abandonTimeout = setTimeout(() => {
                stopClock(room);
                rooms.delete(currentRoomCode);
                console.log(`Cleaned up abandoned room: ${currentRoomCode}`);
            }, 5 * 60 * 1000); // 5 minutes
        }
    });
});

server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`♟ Pramod Chess Server running on http://localhost:${PORT}`);
    console.log(`===============================================`);
});