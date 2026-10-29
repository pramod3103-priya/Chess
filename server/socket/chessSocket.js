const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Game = require('../models/Game');
const User = require('../models/User');
const { createChessInstance, validateAndMakeMove, getGameStatus } = require('../services/chessService');
const { calculateElo } = require('../services/ratingService');

// Active in-memory games: roomId -> RoomState
const activeRooms = new Map();

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomId() {
    let id = '';
    let attempts = 0;
    do {
        id = '';
        for (let i = 0; i < 6; i++) {
            id += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        attempts++;
        if (attempts > 500) break;
    } while (activeRooms.has(id));
    return id;
}

function stopRoomClock(room) {
    if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
    }
}

function startRoomClock(io, room) {
    stopRoomClock(room);
    room.timerInterval = setInterval(async () => {
        try {
            if (room.status !== 'ACTIVE') {
                stopRoomClock(room);
                return;
            }

            const activeColor = room.chess.turn() === 'w' ? 'white' : 'black';
            const opponentColor = activeColor === 'white' ? 'black' : 'white';

            room.clocks[activeColor]--;

            io.to(room.roomId).emit('clockTick', {
                clocks: room.clocks,
                turn: room.chess.turn()
            });

            // Time out handling
            if (room.clocks[activeColor] <= 0) {
                room.clocks[activeColor] = 0;
                room.status = 'TIMEOUT';
                stopRoomClock(room);

                const winnerColor = opponentColor === 'white' ? 'w' : 'b';
                const winnerName = opponentColor === 'white' ? room.whiteName : room.blackName;
                const loserName = activeColor === 'white' ? room.whiteName : room.blackName;
                const reason = `${loserName} ran out of time! ${winnerName} wins.`;

                await finalizeGame(io, room, {
                    status: 'TIMEOUT',
                    winner: winnerColor,
                    result: reason
                });
            }
        } catch (clockErr) {
            console.error('[Clock Interval Error]', clockErr);
        }
    }, 1000);
}

// Finalize Game: save to MongoDB, update ratings, and broadcast gameOver
async function finalizeGame(io, room, { status, winner, loser, result }) {
    room.status = status;
    room.winner = winner || null;
    room.loser = loser || (winner === 'w' ? 'b' : (winner === 'b' ? 'w' : null));
    room.result = result || '';
    room.endedAt = new Date();
    stopRoomClock(room);

    let ratingChange = { white: 0, black: 0 };

    try {
        let whiteUser = null;
        let blackUser = null;

        if (room.whiteUserId) {
            whiteUser = await User.findById(room.whiteUserId);
        }
        if (room.blackUserId) {
            blackUser = await User.findById(room.blackUserId);
        }

        if (whiteUser && blackUser) {
            const elo = calculateElo(whiteUser.rating, blackUser.rating, winner);
            ratingChange = {
                white: elo.deltaA,
                black: elo.deltaB
            };

            whiteUser.rating = elo.newRatingA;
            whiteUser.gamesPlayed += 1;
            if (winner === 'w') whiteUser.gamesWon += 1;
            else if (winner === 'b') whiteUser.gamesLost += 1;
            else whiteUser.gamesDrawn += 1;
            await whiteUser.save();

            blackUser.rating = elo.newRatingB;
            blackUser.gamesPlayed += 1;
            if (winner === 'b') blackUser.gamesWon += 1;
            else if (winner === 'w') blackUser.gamesLost += 1;
            else blackUser.gamesDrawn += 1;
            await blackUser.save();
        } else if (whiteUser) {
            whiteUser.gamesPlayed += 1;
            if (winner === 'w') whiteUser.gamesWon += 1;
            else if (winner === 'b') whiteUser.gamesLost += 1;
            else whiteUser.gamesDrawn += 1;
            await whiteUser.save();
        } else if (blackUser) {
            blackUser.gamesPlayed += 1;
            if (winner === 'b') blackUser.gamesWon += 1;
            else if (winner === 'w') blackUser.gamesLost += 1;
            else blackUser.gamesDrawn += 1;
            await blackUser.save();
        }

        // Update MongoDB Game document
        await Game.findOneAndUpdate(
            { roomId: room.roomId },
            {
                fen: room.chess.fen(),
                pgn: room.chess.pgn(),
                moves: room.moves,
                clocks: room.clocks,
                status: room.status,
                winner: room.winner,
                loser: room.loser,
                result: room.result,
                endedAt: room.endedAt,
                ratingChange,
                updatedAt: new Date()
            }
        );
    } catch (dbErr) {
        console.error('Error finalizing game in DB:', dbErr);
    }

    io.to(room.roomId).emit('gameOver', {
        status: room.status,
        winner: room.winner,
        loser: room.loser,
        result: room.result,
        clocks: room.clocks,
        fen: room.chess.fen(),
        endedAt: room.endedAt,
        ratingChange
    });
}

function getSanitizedGameState(room, socketId, playerToken) {
    let role = 'spectator';
    let myColor = null;

    if (
        (playerToken && room.whitePlayerToken === playerToken) ||
        (socketId && room.whiteSocketId === socketId)
    ) {
        role = 'player';
        myColor = 'w';
    } else if (
        (playerToken && room.blackPlayerToken === playerToken) ||
        (socketId && room.blackSocketId === socketId)
    ) {
        role = 'player';
        myColor = 'b';
    }

    return {
        roomId: room.roomId,
        status: room.status,
        fen: room.chess.fen(),
        pgn: room.chess.pgn(),
        turn: room.chess.turn(),
        inCheck: room.chess.inCheck(),
        clocks: room.clocks,
        timeControl: room.timeControl,
        moves: room.moves,
        whitePlayer: {
            id: room.whiteUserId,
            name: room.whiteName,
            connected: room.whiteConnected
        },
        blackPlayer: {
            id: room.blackUserId,
            name: room.blackName,
            connected: room.blackConnected
        },
        spectatorsCount: room.spectators.size,
        role,
        myColor,
        winner: room.winner,
        result: room.result,
        drawOfferedBy: room.drawOfferedBy
    };
}

module.exports = function initializeChessSocket(io) {
    io.on('connection', (socket) => {
        let currentRoomId = null;

        // Decode optional JWT from handshake auth token
        let authenticatedUser = null;
        try {
            const token = socket.handshake.auth && socket.handshake.auth.token;
            if (token) {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET || 'super_secret_pramod_chess_jwt_key_2026_dev'
                );
                authenticatedUser = decoded;
            }
        } catch (e) {
            authenticatedUser = null;
        }

        const getSocketPlayerToken = () => {
            return (socket.handshake.auth && socket.handshake.auth.playerToken) || socket.id;
        };

        // ====================================================================
        // 1. CREATE GAME
        // ====================================================================
        const handleCreateGame = async (data = {}, callback) => {
            try {
                const roomId = generateRoomId();
                const initialSeconds = Number(data.timeControl) || 600;
                const increment = Number(data.increment) || 0;
                const playerName = (data.playerName && data.playerName.trim()) ||
                    (socket.handshake.auth.username) || 'Player 1';
                const userId = authenticatedUser ? authenticatedUser.id : null;
                const playerToken = data.playerToken || getSocketPlayerToken();

                const chess = createChessInstance();

                const room = {
                    roomId,
                    chess,
                    status: 'WAITING',
                    timeControl: { initial: initialSeconds, increment },
                    clocks: { white: initialSeconds, black: initialSeconds },
                    moves: [],
                    whiteSocketId: socket.id,
                    blackSocketId: null,
                    whitePlayerToken: playerToken,
                    blackPlayerToken: null,
                    whiteUserId: userId,
                    blackUserId: null,
                    whiteName: playerName,
                    blackName: 'Waiting for opponent...',
                    whiteConnected: true,
                    blackConnected: false,
                    spectators: new Map(),
                    timerInterval: null,
                    drawOfferedBy: null,
                    winner: null,
                    result: '',
                    abandonTimeout: null
                };

                activeRooms.set(roomId, room);
                socket.join(roomId);
                currentRoomId = roomId;

                // Persist to MongoDB
                await Game.create({
                    roomId,
                    whitePlayer: userId,
                    whiteName: playerName,
                    whitePlayerToken: playerToken,
                    fen: chess.fen(),
                    timeControl: { initial: initialSeconds, increment },
                    clocks: { white: initialSeconds, black: initialSeconds },
                    status: 'WAITING'
                });

                console.log(`[Socket] Room ${roomId} created by ${playerName} (${socket.id}) token: ${playerToken}`);

                const state = getSanitizedGameState(room, socket.id, playerToken);

                if (typeof callback === 'function') {
                    callback({
                        success: true,
                        roomId,
                        color: 'w',
                        role: 'player',
                        gameState: state
                    });
                }

                socket.emit('gameState', state);
            } catch (err) {
                console.error('Error creating game:', err);
                if (typeof callback === 'function') {
                    callback({ success: false, message: 'Server error while creating room' });
                }
            }
        };

        socket.on('createGame', handleCreateGame);
        socket.on('create_room', handleCreateGame);
        socket.on('createRoom', handleCreateGame);

        // ====================================================================
        // 2. JOIN GAME
        // ====================================================================
        const handleJoinGame = async (data = {}, callback) => {
            try {
                if (!data || !data.roomId) {
                    if (typeof callback === 'function') {
                        return callback({ success: false, message: 'Please provide a room code' });
                    }
                    return;
                }

                const roomId = data.roomId.trim().toUpperCase();
                let room = activeRooms.get(roomId);

                if (room && room.status === 'CANCELLED') {
                    if (typeof callback === 'function') {
                        return callback({ success: false, message: 'This room has been closed.' });
                    }
                    socket.emit('errorMessage', { message: 'This room has been closed.' });
                    return;
                }

                // If not in memory, restore from MongoDB
                if (!room) {
                    const dbGame = await Game.findOne({ roomId });
                    if (!dbGame) {
                        if (typeof callback === 'function') {
                            return callback({ success: false, message: 'Game room not found.' });
                        }
                        return;
                    }

                    if (dbGame.status === 'CANCELLED') {
                        if (typeof callback === 'function') {
                            return callback({ success: false, message: 'This room has been closed.' });
                        }
                        socket.emit('errorMessage', { message: 'This room has been closed.' });
                        return;
                    }

                    const chess = createChessInstance(dbGame.fen);
                    room = {
                        roomId: dbGame.roomId,
                        chess,
                        status: dbGame.status,
                        timeControl: dbGame.timeControl || { initial: 600, increment: 0 },
                        clocks: dbGame.clocks || { white: 600, black: 600 },
                        moves: dbGame.moves || [],
                        whiteSocketId: null,
                        blackSocketId: null,
                        whitePlayerToken: dbGame.whitePlayerToken || null,
                        blackPlayerToken: dbGame.blackPlayerToken || null,
                        whiteUserId: dbGame.whitePlayer,
                        blackUserId: dbGame.blackPlayer,
                        whiteName: dbGame.whiteName || 'White',
                        blackName: dbGame.blackName || 'Black',
                        whiteConnected: false,
                        blackConnected: false,
                        spectators: new Map(),
                        timerInterval: null,
                        drawOfferedBy: null,
                        winner: dbGame.winner,
                        result: dbGame.result,
                        abandonTimeout: null
                    };
                    activeRooms.set(roomId, room);
                }

                const playerName = (data.playerName && data.playerName.trim()) ||
                    (socket.handshake.auth.username) || 'Player 2';
                const userId = authenticatedUser ? authenticatedUser.id : null;
                const playerToken = data.playerToken || getSocketPlayerToken();

                // ------------------------------------------------------------
                // Check 1: Is this White player (Creator reconnect / join)?
                // ------------------------------------------------------------
                const isWhite = (room.whitePlayerToken && playerToken && room.whitePlayerToken === playerToken) ||
                    (room.whiteUserId && userId && String(room.whiteUserId) === String(userId)) ||
                    (room.whiteSocketId === socket.id);

                if (isWhite) {
                    room.whiteSocketId = socket.id;
                    room.whiteConnected = true;
                    if (playerToken && !room.whitePlayerToken) room.whitePlayerToken = playerToken;
                    socket.join(roomId);
                    currentRoomId = roomId;

                    if (room.abandonTimeout) {
                        clearTimeout(room.abandonTimeout);
                        room.abandonTimeout = null;
                    }

                    const whiteState = getSanitizedGameState(room, socket.id, playerToken);
                    console.log(`[Socket] White player recognized/reconnected: ${room.whiteName} (${socket.id}) in ${roomId}`);

                    if (typeof callback === 'function') {
                        callback({
                            success: true,
                            roomId,
                            color: 'w',
                            role: 'player',
                            gameState: whiteState
                        });
                    }

                    socket.emit('gameState', whiteState);
                    socket.to(roomId).emit('playerReconnected', { color: 'w', name: room.whiteName });
                    return;
                }

                // ------------------------------------------------------------
                // Check 2: Is this Black player (reconnecting)?
                // ------------------------------------------------------------
                const isBlack = (room.blackPlayerToken && playerToken && room.blackPlayerToken === playerToken) ||
                    (room.blackUserId && userId && String(room.blackUserId) === String(userId)) ||
                    (room.blackSocketId === socket.id);

                if (isBlack) {
                    room.blackSocketId = socket.id;
                    room.blackConnected = true;
                    if (playerToken && !room.blackPlayerToken) room.blackPlayerToken = playerToken;
                    socket.join(roomId);
                    currentRoomId = roomId;

                    if (room.abandonTimeout) {
                        clearTimeout(room.abandonTimeout);
                        room.abandonTimeout = null;
                    }

                    const blackState = getSanitizedGameState(room, socket.id, playerToken);
                    console.log(`[Socket] Black player reconnected: ${room.blackName} (${socket.id}) in ${roomId}`);

                    if (typeof callback === 'function') {
                        callback({
                            success: true,
                            roomId,
                            color: 'b',
                            role: 'player',
                            gameState: blackState
                        });
                    }

                    socket.emit('gameState', blackState);
                    socket.to(roomId).emit('playerReconnected', { color: 'b', name: room.blackName });
                    return;
                }

                // ------------------------------------------------------------
                // Check 3: Is Black slot available and room in WAITING status?
                // ------------------------------------------------------------
                const canJoinAsBlack = (!room.blackSocketId || !room.blackConnected) &&
                    (!room.blackPlayerToken || room.blackPlayerToken === playerToken) &&
                    room.status === 'WAITING';

                if (canJoinAsBlack) {
                    room.blackSocketId = socket.id;
                    room.blackPlayerToken = playerToken;
                    room.blackUserId = userId;
                    room.blackName = playerName;
                    room.blackConnected = true;
                    room.status = 'ACTIVE';

                    socket.join(roomId);
                    currentRoomId = roomId;

                    // Update MongoDB
                    await Game.findOneAndUpdate(
                        { roomId },
                        {
                            blackPlayer: userId,
                            blackName: playerName,
                            blackPlayerToken: playerToken,
                            status: 'ACTIVE'
                        }
                    );

                    // Start Server Clock
                    startRoomClock(io, room);

                    console.log(`[Socket] ${playerName} joined ${roomId} as Black. Game is now ACTIVE!`);

                    const blackState = getSanitizedGameState(room, socket.id, playerToken);

                    if (typeof callback === 'function') {
                        callback({
                            success: true,
                            roomId,
                            color: 'b',
                            role: 'player',
                            gameState: blackState
                        });
                    }

                    // Send individual state to Black
                    socket.emit('gameStarted', blackState);
                    socket.emit('gameState', blackState);

                    // Send individual state to White
                    if (room.whiteSocketId) {
                        const whiteState = getSanitizedGameState(room, room.whiteSocketId, room.whitePlayerToken);
                        io.to(room.whiteSocketId).emit('gameStarted', whiteState);
                        io.to(room.whiteSocketId).emit('gameState', whiteState);
                    }

                    // Notify room
                    io.to(roomId).emit('playerJoined', {
                        color: 'b',
                        name: playerName
                    });

                    return;
                }

                // ------------------------------------------------------------
                // Check 4: Join as Spectator
                // ------------------------------------------------------------
                room.spectators.set(socket.id, playerName);
                socket.join(roomId);
                currentRoomId = roomId;

                console.log(`[Socket] Spectator joined: ${playerName} in ${roomId}`);
                const specState = getSanitizedGameState(room, socket.id, playerToken);

                if (typeof callback === 'function') {
                    callback({
                        success: true,
                        roomId,
                        color: null,
                        role: 'spectator',
                        gameState: specState
                    });
                }

                socket.emit('gameState', specState);
            } catch (err) {
                console.error('Error joining game:', err);
                if (typeof callback === 'function') {
                    callback({ success: false, message: 'Server error while joining room' });
                }
            }
        };

        socket.on('joinGame', handleJoinGame);
        socket.on('join_room', handleJoinGame);
        socket.on('joinRoom', handleJoinGame);

        // ====================================================================
        // 3. MAKE MOVE (Authoritative chess.js Server Validation)
        // ====================================================================
        const handleMakeMove = async (data = {}, callback) => {
            try {
                const targetRoomId = (data.roomId || currentRoomId || '').toUpperCase();
                if (!targetRoomId || !activeRooms.has(targetRoomId)) {
                    if (typeof callback === 'function') {
                        return callback({ success: false, message: 'Active game not found' });
                    }
                    return;
                }

                const room = activeRooms.get(targetRoomId);

                // Security Check 1: Game must be ACTIVE
                if (room.status !== 'ACTIVE') {
                    if (typeof callback === 'function') {
                        return callback({ success: false, message: 'Game is not active' });
                    }
                    return;
                }

                // Security Check 2: Identify player color (via socket ID or playerToken)
                const playerToken = data.playerToken || getSocketPlayerToken();
                let playerColor = null;

                if (room.whiteSocketId === socket.id || (playerToken && room.whitePlayerToken === playerToken)) {
                    playerColor = 'w';
                    room.whiteSocketId = socket.id;
                } else if (room.blackSocketId === socket.id || (playerToken && room.blackPlayerToken === playerToken)) {
                    playerColor = 'b';
                    room.blackSocketId = socket.id;
                }

                if (!playerColor) {
                    if (typeof callback === 'function') {
                        return callback({ success: false, message: 'Spectators cannot make moves' });
                    }
                    return;
                }

                // Security Check 3: It must be that player's turn
                const currentTurn = room.chess.turn(); // 'w' or 'b'
                if (playerColor !== currentTurn) {
                    if (typeof callback === 'function') {
                        return callback({ success: false, message: "Not your turn." });
                    }
                    return;
                }

                // Security Check 4: Validate legal move with authoritative chess.js
                const moveResult = validateAndMakeMove(room.chess, {
                    from: data.from,
                    to: data.to,
                    promotion: data.promotion || 'q'
                });

                if (!moveResult) {
                    if (typeof callback === 'function') {
                        return callback({ success: false, message: 'Illegal move.' });
                    }
                    return;
                }

                // Reset any pending draw offer on move
                room.drawOfferedBy = null;

                // Add time increment to the player who just moved
                const activeColorName = playerColor === 'w' ? 'white' : 'black';
                if (room.timeControl.increment > 0) {
                    room.clocks[activeColorName] += room.timeControl.increment;
                }

                // Record move
                const moveRecord = {
                    player: playerColor,
                    san: moveResult.san,
                    from: moveResult.from,
                    to: moveResult.to,
                    promotion: moveResult.promotion || null,
                    timestamp: new Date()
                };
                room.moves.push(moveRecord);

                // Check termination conditions
                const gameStatus = getGameStatus(room.chess);

                if (gameStatus.isGameOver) {
                    await finalizeGame(io, room, gameStatus);
                } else {
                    Game.findOneAndUpdate(
                        { roomId: room.roomId },
                        {
                            fen: room.chess.fen(),
                            pgn: room.chess.pgn(),
                            $push: { moves: moveRecord },
                            clocks: room.clocks,
                            updatedAt: new Date()
                        }
                    ).catch(err => console.error('DB move update error:', err));
                }

                // Broadcast moveMade to all players and spectators
                io.to(room.roomId).emit('moveMade', {
                    move: moveResult,
                    fen: room.chess.fen(),
                    turn: room.chess.turn(),
                    inCheck: room.chess.inCheck(),
                    clocks: room.clocks,
                    moves: room.moves,
                    isGameOver: gameStatus.isGameOver,
                    status: room.status,
                    winner: room.winner,
                    result: room.result
                });

                if (typeof callback === 'function') {
                    callback({ success: true, move: moveResult });
                }
            } catch (err) {
                console.error('Error executing move:', err);
                if (typeof callback === 'function') {
                    callback({ success: false, message: 'Server error processing move' });
                }
            }
        };

        socket.on('makeMove', handleMakeMove);
        socket.on('make_move', handleMakeMove);

        // ====================================================================
        // 4. RESIGN GAME
        // ====================================================================
        const handleResign = async (data = {}, callback) => {
            const targetRoomId = (data.roomId || currentRoomId || '').toUpperCase();
            if (!targetRoomId || !activeRooms.has(targetRoomId)) {
                if (typeof callback === 'function') callback({ success: false, message: 'Game not found' });
                return;
            }
            const room = activeRooms.get(targetRoomId);

            if (room.status !== 'ACTIVE') {
                if (typeof callback === 'function') callback({ success: false, message: 'Game is not active' });
                return;
            }

            const playerToken = data.playerToken || getSocketPlayerToken();
            let resignColor = null;
            if (room.whiteSocketId === socket.id || (playerToken && room.whitePlayerToken === playerToken)) resignColor = 'w';
            else if (room.blackSocketId === socket.id || (playerToken && room.blackPlayerToken === playerToken)) resignColor = 'b';

            if (!resignColor) {
                if (typeof callback === 'function') callback({ success: false, message: 'Spectators cannot resign' });
                return;
            }

            const winnerColor = resignColor === 'w' ? 'b' : 'w';
            const winnerName = winnerColor === 'w' ? room.whiteName : room.blackName;
            const loserName = resignColor === 'w' ? room.whiteName : room.blackName;
            const reason = `${loserName} resigned. ${winnerName} wins!`;

            io.to(room.roomId).emit('gameResigned', {
                winner: winnerColor,
                loser: resignColor,
                winnerName,
                loserName,
                result: reason
            });

            await finalizeGame(io, room, {
                status: 'RESIGNED',
                winner: winnerColor,
                loser: resignColor,
                result: reason
            });

            if (typeof callback === 'function') callback({ success: true });
        };

        socket.on('resignGame', handleResign);
        socket.on('resign', handleResign);

        // ====================================================================
        // 5. LEAVE GAME
        // ====================================================================
        const handleLeaveGame = async (data = {}, callback) => {
            const targetRoomId = (data.roomId || currentRoomId || '').toUpperCase();
            if (!targetRoomId || !activeRooms.has(targetRoomId)) {
                if (typeof callback === 'function') callback({ success: false, message: 'Game not found' });
                return;
            }
            const room = activeRooms.get(targetRoomId);
            const playerToken = data.playerToken || getSocketPlayerToken();

            let playerColor = null;
            let leavingName = '';
            if (room.whiteSocketId === socket.id || (playerToken && room.whitePlayerToken === playerToken)) {
                playerColor = 'w';
                leavingName = room.whiteName;
            } else if (room.blackSocketId === socket.id || (playerToken && room.blackPlayerToken === playerToken)) {
                playerColor = 'b';
                leavingName = room.blackName;
            }

            if (room.status === 'ACTIVE' && playerColor) {
                const loserColor = playerColor;
                const winnerColor = playerColor === 'w' ? 'b' : 'w';
                const winnerName = winnerColor === 'w' ? room.whiteName : room.blackName;
                const reason = `${leavingName} left the game. ${winnerName} wins!`;

                io.to(room.roomId).emit('playerLeft', {
                    leftColor: playerColor,
                    leftName: leavingName,
                    winner: winnerColor,
                    result: reason
                });

                await finalizeGame(io, room, {
                    status: 'RESIGNED',
                    winner: winnerColor,
                    loser: loserColor,
                    result: reason
                });
            } else if (room.status === 'WAITING' && playerColor === 'w') {
                await Game.findOneAndUpdate(
                    { roomId: room.roomId },
                    { status: 'CANCELLED', result: 'Host cancelled and left the room.', endedAt: new Date() }
                );
                io.to(room.roomId).emit('gameCancelled', {
                    roomId: room.roomId,
                    message: 'Host left the room before game started.'
                });
                activeRooms.delete(room.roomId);
            } else if (room.spectators.has(socket.id)) {
                room.spectators.delete(socket.id);
            }

            socket.leave(room.roomId);
            if (typeof callback === 'function') callback({ success: true });
        };

        socket.on('leaveGame', handleLeaveGame);
        socket.on('leave_room', handleLeaveGame);

        // ====================================================================
        // 6. CANCEL GAME (Waiting Room)
        // ====================================================================
        const handleCancelGame = async (data = {}, callback) => {
            const targetRoomId = (data.roomId || currentRoomId || '').toUpperCase();
            if (!targetRoomId || !activeRooms.has(targetRoomId)) {
                if (typeof callback === 'function') callback({ success: false, message: 'Room not found' });
                return;
            }
            const room = activeRooms.get(targetRoomId);

            if (room.status !== 'WAITING') {
                if (typeof callback === 'function') callback({ success: false, message: 'Only waiting rooms can be cancelled' });
                return;
            }

            const playerToken = data.playerToken || getSocketPlayerToken();
            const isWhite = room.whiteSocketId === socket.id || (playerToken && room.whitePlayerToken === playerToken);

            if (!isWhite) {
                if (typeof callback === 'function') callback({ success: false, message: 'Only room host can cancel the game' });
                return;
            }

            await Game.findOneAndUpdate(
                { roomId: room.roomId },
                {
                    status: 'CANCELLED',
                    result: 'Room cancelled by creator.',
                    endedAt: new Date()
                }
            );

            io.to(room.roomId).emit('gameCancelled', {
                roomId: room.roomId,
                message: 'The room was cancelled by the host.'
            });

            activeRooms.delete(room.roomId);
            socket.leave(room.roomId);

            if (typeof callback === 'function') callback({ success: true });
        };

        socket.on('cancelGame', handleCancelGame);
        socket.on('cancel_room', handleCancelGame);

        // ====================================================================
        // 7. DRAW OFFERS
        // ====================================================================
        socket.on('offerDraw', (data = {}, callback) => {
            const targetRoomId = (data.roomId || currentRoomId || '').toUpperCase();
            if (!targetRoomId || !activeRooms.has(targetRoomId)) return;
            const room = activeRooms.get(targetRoomId);

            if (room.status !== 'ACTIVE') return;
            if (room.drawOfferedBy) {
                if (typeof callback === 'function') callback({ success: false, message: 'Draw offer already pending' });
                return;
            }

            const playerToken = data.playerToken || getSocketPlayerToken();
            let color = null;
            if (room.whiteSocketId === socket.id || (playerToken && room.whitePlayerToken === playerToken)) color = 'w';
            else if (room.blackSocketId === socket.id || (playerToken && room.blackPlayerToken === playerToken)) color = 'b';

            if (!color) return;

            room.drawOfferedBy = color;
            socket.to(room.roomId).emit('drawOffered', {
                byColor: color,
                byName: color === 'w' ? room.whiteName : room.blackName
            });
            if (typeof callback === 'function') callback({ success: true });
        });

        socket.on('acceptDraw', async (data = {}, callback) => {
            const targetRoomId = (data.roomId || currentRoomId || '').toUpperCase();
            if (!targetRoomId || !activeRooms.has(targetRoomId)) return;
            const room = activeRooms.get(targetRoomId);

            if (room.status !== 'ACTIVE' || !room.drawOfferedBy) return;

            const playerToken = data.playerToken || getSocketPlayerToken();
            let color = null;
            if (room.whiteSocketId === socket.id || (playerToken && room.whitePlayerToken === playerToken)) color = 'w';
            else if (room.blackSocketId === socket.id || (playerToken && room.blackPlayerToken === playerToken)) color = 'b';

            if (!color || color === room.drawOfferedBy) return; // Can't accept own draw

            room.drawOfferedBy = null;
            io.to(room.roomId).emit('drawAccepted', {
                result: 'Draw agreed by mutual agreement.'
            });

            await finalizeGame(io, room, {
                status: 'DRAW',
                winner: 'draw',
                loser: null,
                result: 'Draw agreed by mutual agreement.'
            });

            if (typeof callback === 'function') callback({ success: true });
        });

        socket.on('rejectDraw', (data = {}, callback) => {
            const targetRoomId = (data.roomId || currentRoomId || '').toUpperCase();
            if (!targetRoomId || !activeRooms.has(targetRoomId)) return;
            const room = activeRooms.get(targetRoomId);

            const playerToken = data.playerToken || getSocketPlayerToken();
            let color = null;
            if (room.whiteSocketId === socket.id || (playerToken && room.whitePlayerToken === playerToken)) color = 'w';
            else if (room.blackSocketId === socket.id || (playerToken && room.blackPlayerToken === playerToken)) color = 'b';

            room.drawOfferedBy = null;
            io.to(room.roomId).emit('drawRejected', {
                byColor: color,
                byName: color === 'w' ? room.whiteName : room.blackName
            });
            io.to(room.roomId).emit('drawDeclined'); // compatibility
            if (typeof callback === 'function') callback({ success: true });
        });

        // ====================================================================
        // 6. REMATCH
        // ====================================================================
        socket.on('requestRematch', async (data = {}) => {
            const targetRoomId = (data.roomId || currentRoomId || '').toUpperCase();
            if (!targetRoomId || !activeRooms.has(targetRoomId)) return;
            const room = activeRooms.get(targetRoomId);

            if (room.status !== 'COMPLETED' && room.status !== 'CHECKMATE' && room.status !== 'RESIGNED' && room.status !== 'TIMEOUT' && room.status !== 'DRAW' && room.status !== 'STALEMATE') {
                return;
            }

            // Swap colors for rematch
            const prevWhiteToken = room.whitePlayerToken;
            const prevBlackToken = room.blackPlayerToken;
            const prevWhiteSocket = room.whiteSocketId;
            const prevBlackSocket = room.blackSocketId;
            const prevWhiteName = room.whiteName;
            const prevBlackName = room.blackName;

            room.chess = createChessInstance();
            room.fen = room.chess.fen();
            room.moves = [];
            room.status = 'ACTIVE';
            room.winner = null;
            room.result = '';
            room.clocks = {
                white: room.timeControl.initial,
                black: room.timeControl.initial
            };

            // Swap players
            room.whitePlayerToken = prevBlackToken;
            room.whiteSocketId = prevBlackSocket;
            room.whiteName = prevBlackName;

            room.blackPlayerToken = prevWhiteToken;
            room.blackSocketId = prevWhiteSocket;
            room.blackName = prevWhiteName;

            startRoomClock(io, room);

            // Notify both players
            if (room.whiteSocketId) {
                const sWhite = getSanitizedGameState(room, room.whiteSocketId, room.whitePlayerToken);
                io.to(room.whiteSocketId).emit('gameState', sWhite);
            }
            if (room.blackSocketId) {
                const sBlack = getSanitizedGameState(room, room.blackSocketId, room.blackPlayerToken);
                io.to(room.blackSocketId).emit('gameState', sBlack);
            }
        });

        // Get single game state
        socket.on('getGameState', (data = {}, callback) => {
            const targetRoomId = (data.roomId || currentRoomId || '').toUpperCase();
            if (!targetRoomId || !activeRooms.has(targetRoomId)) {
                if (typeof callback === 'function') callback({ success: false, message: 'Game not found' });
                return;
            }
            const room = activeRooms.get(targetRoomId);
            const playerToken = data.playerToken || getSocketPlayerToken();
            if (typeof callback === 'function') {
                callback({
                    success: true,
                    gameState: getSanitizedGameState(room, socket.id, playerToken)
                });
            }
        });

        // Handle disconnects
        socket.on('disconnect', () => {
            if (!currentRoomId || !activeRooms.has(currentRoomId)) return;
            const room = activeRooms.get(currentRoomId);

            if (room.whiteSocketId === socket.id) {
                room.whiteConnected = false;
                io.to(room.roomId).emit('playerDisconnected', { color: 'w', name: room.whiteName });
            } else if (room.blackSocketId === socket.id) {
                room.blackConnected = false;
                io.to(room.roomId).emit('playerDisconnected', { color: 'b', name: room.blackName });
            } else if (room.spectators.has(socket.id)) {
                room.spectators.delete(socket.id);
            }

            if (room.status === 'ACTIVE' && !room.whiteConnected && !room.blackConnected) {
                stopRoomClock(room);
                room.abandonTimeout = setTimeout(async () => {
                    if (!room.whiteConnected && !room.blackConnected) {
                        console.log(`[Socket] Room ${room.roomId} abandoned due to inactivity.`);
                        await finalizeGame(io, room, {
                            status: 'ABANDONED',
                            winner: null,
                            result: 'Game abandoned by both players.'
                        });
                        activeRooms.delete(room.roomId);
                    }
                }, 5 * 60 * 1000);
            }
        });
    });
};
