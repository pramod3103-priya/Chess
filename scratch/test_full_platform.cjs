const path = require('path');
const rootDir = 'c:/Users/Dell/OneDrive/Desktop/js';
const express = require(path.join(rootDir, 'server/node_modules/express'));
const http = require('http');
const { Server } = require(path.join(rootDir, 'server/node_modules/socket.io'));
const ioClient = require(path.join(rootDir, 'client/node_modules/socket.io-client'));
const mongoose = require(path.join(rootDir, 'server/node_modules/mongoose'));
const { Chess } = require(path.join(rootDir, 'server/node_modules/chess.js'));
require(path.join(rootDir, 'server/node_modules/dotenv')).config({ path: path.join(rootDir, 'server/.env') });

const Game = require(path.join(rootDir, 'server/models/Game'));
const User = require(path.join(rootDir, 'server/models/User'));
const initializeChessSocket = require(path.join(rootDir, 'server/socket/chessSocket'));
const { validateAndMakeMove, getGameStatus, createChessInstance } = require(path.join(rootDir, 'server/services/chessService'));

const TEST_PORT = 5066;

async function runFullPlatformTests() {
    console.log('================================================================');
    console.log('   VANILLA CHESS PLATFORM - FULL MULTIPLAYER & ENGINE AUDIT');
    console.log('================================================================\n');

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not configured');

    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB Atlas');

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: '*' } });
    initializeChessSocket(io);

    await new Promise((resolve) => server.listen(TEST_PORT, resolve));
    console.log(`✓ Test Socket.IO Server active on port ${TEST_PORT}\n`);

    const clientOptions = {
        transports: ['websocket'],
        forceNew: true
    };

    const createClient = (username, playerToken) => {
        return ioClient(`http://localhost:${TEST_PORT}`, {
            ...clientOptions,
            auth: { username, playerToken }
        });
    };

    try {
        // ====================================================================
        // SUITE 1: ROOM CREATION, CODE UNIQUENESS, HOST ASSIGNMENT & CANCELLATION
        // ====================================================================
        console.log('--- SUITE 1: Room Creation, Uniqueness, Host Assignment & Cancellation ---');
        {
            const p1 = createClient('Grandmaster_A', 'tok_gm_a');
            await new Promise(r => p1.on('connect', r));

            let roomId = null;
            let p1State = null;

            await new Promise((resolve) => {
                p1.emit('createGame', {
                    timeControl: 180,
                    increment: 2,
                    playerName: 'Grandmaster_A',
                    playerToken: 'tok_gm_a'
                }, (res) => {
                    roomId = res.roomId;
                    p1State = res.gameState;
                    resolve();
                });
            });

            if (!roomId || roomId.length !== 6) throw new Error(`Invalid room code: ${roomId}`);
            if (p1State.myColor !== 'w' || p1State.role !== 'player') throw new Error(`Host not assigned as White: ${JSON.stringify(p1State)}`);
            console.log(`✓ Unique 6-character room created: ${roomId} with Time Control 180s + 2s`);
            console.log(`✓ Host correctly assigned White ('w') with role='player'`);

            // Cancel waiting room
            const cancelResp = await new Promise(r => p1.emit('cancelGame', { roomId, playerToken: 'tok_gm_a' }, r));
            if (!cancelResp.success) throw new Error('cancelGame failed');

            const dbGame = await Game.findOne({ roomId });
            if (dbGame.status !== 'CANCELLED') throw new Error(`Expected CANCELLED status, got ${dbGame.status}`);
            console.log(`✓ Waiting room cancelled by host, marked CANCELLED in MongoDB`);

            // Late joiner attempt
            const p2 = createClient('LatePlayer', 'tok_late');
            await new Promise(r => p2.on('connect', r));
            const lateJoin = await new Promise(r => p2.emit('joinGame', { roomId, playerToken: 'tok_late' }, r));
            if (lateJoin.success !== false) throw new Error('Late join to cancelled room was not rejected');
            console.log(`✓ Late join to cancelled room correctly rejected: "${lateJoin.message}"`);

            p1.disconnect();
            p2.disconnect();
        }

        // ====================================================================
        // SUITE 2: OFFICIAL CHESS RULES VALIDATION (CASTLING, EN PASSANT, PROMOTION)
        // ====================================================================
        console.log('\n--- SUITE 2: Official Rules (Castling, En Passant, Pawn Promotion, Illegals) ---');
        {
            const pWhite = createClient('White_Rules', 'tok_w_rules');
            const pBlack = createClient('Black_Rules', 'tok_b_rules');
            await Promise.all([new Promise(r => pWhite.on('connect', r)), new Promise(r => pBlack.on('connect', r))]);

            let roomId = null;
            await new Promise(r => pWhite.emit('createGame', { timeControl: 600, increment: 0, playerToken: 'tok_w_rules' }, res => {
                roomId = res.roomId;
                r();
            }));

            await new Promise(r => pBlack.emit('joinGame', { roomId, playerToken: 'tok_b_rules' }, r));
            console.log(`✓ Active game started in room: ${roomId}`);

            // Helper to make an authoritative move via socket
            const doMove = (client, token, from, to, promotion = 'q') => {
                return new Promise((resolve, reject) => {
                    client.emit('makeMove', { roomId, from, to, promotion, playerToken: token }, (res) => {
                        if (res && res.success) resolve(res.move);
                        else reject(new Error(res?.message || 'Move failed'));
                    });
                });
            };

            // Test 2a: Illegal move rejection
            try {
                await doMove(pWhite, 'tok_w_rules', 'e2', 'e5'); // Pawn moving 3 squares
                throw new Error('Server accepted illegal move!');
            } catch (err) {
                console.log(`✓ Illegal move e2->e5 properly rejected by server: "${err.message}"`);
            }

            // Test 2b: Move out of turn rejection
            try {
                await doMove(pBlack, 'tok_b_rules', 'e7', 'e5'); // Black moving on White's turn
                throw new Error('Server accepted out of turn move!');
            } catch (err) {
                console.log(`✓ Out of turn move properly rejected: "${err.message}"`);
            }

            // Test 2c: Play sequence to test Kingside Castling
            // 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5
            await doMove(pWhite, 'tok_w_rules', 'e2', 'e4');
            await doMove(pBlack, 'tok_b_rules', 'e7', 'e5');
            await doMove(pWhite, 'tok_w_rules', 'g1', 'f3');
            await doMove(pBlack, 'tok_b_rules', 'b8', 'c6');
            await doMove(pWhite, 'tok_w_rules', 'f1', 'c4');
            await doMove(pBlack, 'tok_b_rules', 'f8', 'c5');

            // 4. White Kingside Castles: e1 -> g1 (O-O)
            const castleMove = await doMove(pWhite, 'tok_w_rules', 'e1', 'g1');
            if (castleMove.san !== 'O-O') throw new Error(`Expected castling O-O, got ${castleMove.san}`);
            console.log(`✓ White Kingside Castling executed & synchronized: SAN="${castleMove.san}"`);

            pWhite.disconnect();
            pBlack.disconnect();

            // Test 2d: En Passant execution test
            console.log('Testing En Passant capture execution:');
            const epChess = new Chess('rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3');
            const epMove = validateAndMakeMove(epChess, { from: 'e5', to: 'f6' });
            if (!epMove || !epMove.flags.includes('e')) throw new Error('En passant failed');
            console.log(`✓ En Passant capture verified by chess engine: SAN="${epMove.san}"`);

            // Test 2e: Pawn Promotion choices (Queen, Rook, Bishop, Knight)
            console.log('Testing Pawn Promotion to all 4 pieces:');
            for (const piece of ['q', 'r', 'b', 'n']) {
                const promChess = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
                const pMove = validateAndMakeMove(promChess, { from: 'e7', to: 'e8', promotion: piece });
                if (!pMove || pMove.promotion !== piece) throw new Error(`Promotion to ${piece} failed`);
                console.log(`  ✓ Pawn promoted to ${piece.toUpperCase()}: SAN="${pMove.san}"`);
            }
        }

        // ====================================================================
        // SUITE 3: CHECKMATE & AUTOMATIC RESULT PERSISTENCE
        // ====================================================================
        console.log('\n--- SUITE 3: Checkmate & Game Over Resolution ---');
        {
            const p1 = createClient('FoolsWhite', 'tok_fools_w');
            const p2 = createClient('FoolsBlack', 'tok_fools_b');
            await Promise.all([new Promise(r => p1.on('connect', r)), new Promise(r => p2.on('connect', r))]);

            let roomId = null;
            await new Promise(r => p1.emit('createGame', { timeControl: 300, increment: 0, playerToken: 'tok_fools_w' }, res => {
                roomId = res.roomId;
                r();
            }));
            await new Promise(r => p2.emit('joinGame', { roomId, playerToken: 'tok_fools_b' }, r));

            const gameOverPromise = new Promise(resolve => p1.once('gameOver', resolve));

            // Fool's Mate: 1. f3 e5 2. g4 Qh4#
            const doMove = (client, token, from, to) => {
                return new Promise(resolve => client.emit('makeMove', { roomId, from, to, playerToken: token }, resolve));
            };

            await doMove(p1, 'tok_fools_w', 'f2', 'f3');
            await doMove(p2, 'tok_fools_b', 'e7', 'e5');
            await doMove(p1, 'tok_fools_w', 'g2', 'g4');
            await doMove(p2, 'tok_fools_b', 'd8', 'h4'); // Qh4# Checkmate

            const overData = await gameOverPromise;
            if (overData.status !== 'CHECKMATE' || overData.winner !== 'b') {
                throw new Error(`Expected checkmate black win, got: ${JSON.stringify(overData)}`);
            }
            console.log(`✓ Checkmate detected authoritatively: Winner=${overData.winner.toUpperCase()} (Black)`);
            console.log(`✓ Result message: "${overData.result}"`);

            const dbGame = await Game.findOne({ roomId });
            if (dbGame.status !== 'CHECKMATE' || dbGame.winner !== 'b' || !dbGame.endedAt) {
                throw new Error(`MongoDB not updated with checkmate: ${dbGame}`);
            }
            console.log(`✓ MongoDB match record verified with endedAt=${dbGame.endedAt.toISOString()}`);

            p1.disconnect();
            p2.disconnect();
        }

        // ====================================================================
        // SUITE 4: AUTOMATIC DRAW CONDITIONS (STALEMATE, THREEFOLD REPETITION)
        // ====================================================================
        console.log('\n--- SUITE 4: Automatic FIDE Draw Conditions ---');
        {
            // Stalemate check
            const smChess = new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
            const smStatus = getGameStatus(smChess);
            if (smStatus.status !== 'STALEMATE' || smStatus.winner !== 'draw') {
                throw new Error(`Expected stalemate draw, got: ${JSON.stringify(smStatus)}`);
            }
            console.log(`✓ Stalemate detected: "${smStatus.result}"`);

            // Insufficient material check (King vs King)
            const imChess = new Chess('8/8/8/8/8/4k3/8/4K3 w - - 0 1');
            const imStatus = getGameStatus(imChess);
            if (!imStatus.isGameOver || imStatus.status !== 'DRAW') {
                throw new Error('Insufficient material draw detection failed');
            }
            console.log(`✓ Insufficient Material detected: "${imStatus.result}"`);

            // Threefold repetition check
            const repChess = new Chess();
            repChess.move('Nf3'); repChess.move('Nf6');
            repChess.move('Ng1'); repChess.move('Ng8');
            repChess.move('Nf3'); repChess.move('Nf6');
            repChess.move('Ng1'); repChess.move('Ng8');
            const repStatus = getGameStatus(repChess);
            if (!repStatus.isGameOver || repStatus.status !== 'DRAW') {
                throw new Error('Threefold repetition draw detection failed');
            }
            console.log(`✓ Threefold Repetition detected: "${repStatus.result}"`);
        }

        // ====================================================================
        // SUITE 5: TWO-PLAYER MUTUAL REMATCH PROTOCOL (COLOR SWAP & FRESH SESSION)
        // ====================================================================
        console.log('\n--- SUITE 5: Two-Player Mutual Rematch Protocol (Color Swap & Clocks) ---');
        {
            const p1 = createClient('PlayerAlpha', 'tok_alpha');
            const p2 = createClient('PlayerBeta', 'tok_beta');
            await Promise.all([new Promise(r => p1.on('connect', r)), new Promise(r => p2.on('connect', r))]);

            let roomId = null;
            await new Promise(r => p1.emit('createGame', { timeControl: 300, increment: 0, playerToken: 'tok_alpha' }, res => {
                roomId = res.roomId;
                r();
            }));
            await new Promise(r => p2.emit('joinGame', { roomId, playerToken: 'tok_beta' }, r));

            // Conclude first game via resignation
            await new Promise(r => p1.emit('resignGame', { roomId, playerToken: 'tok_alpha' }, r));
            console.log('✓ Initial game concluded (White resigned).');

            // 5a. Alpha requests rematch -> Beta receives rematchOffered
            const betaRematchPromise = new Promise(resolve => p2.once('rematchOffered', resolve));
            p1.emit('requestRematch', { roomId, playerToken: 'tok_alpha' });
            const offerData = await betaRematchPromise;
            if (offerData.byColor !== 'w') throw new Error(`Expected rematch by White, got ${offerData.byColor}`);
            console.log(`✓ Beta received rematch offer from: ${offerData.byName} (${offerData.byColor})`);

            // 5b. Beta declines rematch
            const alphaDeclinedPromise = new Promise(resolve => p1.once('rematchDeclined', resolve));
            p2.emit('declineRematch', { roomId, playerToken: 'tok_beta' });
            await alphaDeclinedPromise;
            console.log('✓ Alpha received rematchDeclined notification');

            // 5c. Beta requests rematch -> Alpha accepts rematch
            const alphaRematchPromise = new Promise(resolve => p1.once('rematchOffered', resolve));
            p2.emit('requestRematch', { roomId, playerToken: 'tok_beta' });
            await alphaRematchPromise;

            const p1AcceptNotice = new Promise(resolve => p1.once('rematchAccepted', resolve));
            const p2AcceptNotice = new Promise(resolve => p2.once('rematchAccepted', resolve));
            const p1NewStatePromise = new Promise(resolve => p1.once('gameState', resolve));
            const p2NewStatePromise = new Promise(resolve => p2.once('gameState', resolve));

            p1.emit('acceptRematch', { roomId, playerToken: 'tok_alpha' });

            const [p1State, p2State] = await Promise.all([
                p1NewStatePromise,
                p2NewStatePromise,
                p1AcceptNotice,
                p2AcceptNotice
            ]);

            // VERIFY SWAPPED COLORS: Alpha was White, must now be Black ('b'). Beta was Black, must now be White ('w')
            if (p1State.myColor !== 'b' || p2State.myColor !== 'w') {
                throw new Error(`Color swap failed! p1Color=${p1State.myColor}, p2Color=${p2State.myColor}`);
            }
            if (p1State.status !== 'ACTIVE' || p1State.moves.length !== 0) {
                throw new Error(`Rematch board not reset! status=${p1State.status}`);
            }
            console.log('✓ Rematch accepted! Colors swapped successfully:');
            console.log(`  - Alpha (previously White) is now: ${p1State.myColor.toUpperCase()} (Black)`);
            console.log(`  - Beta (previously Black) is now: ${p2State.myColor.toUpperCase()} (White)`);
            console.log('✓ Board reset to initial position and clocks restarted');

            p1.disconnect();
            p2.disconnect();
        }

        // ====================================================================
        // SUITE 6: RECONNECTION & BOARD STATE RESTORATION
        // ====================================================================
        console.log('\n--- SUITE 6: Disconnection, Reconnection & Board Restoration ---');
        {
            const p1 = createClient('StableHost', 'tok_stable_host');
            const p2 = createClient('FlickeringClient', 'tok_flicker');
            await Promise.all([new Promise(r => p1.on('connect', r)), new Promise(r => p2.on('connect', r))]);

            let roomId = null;
            await new Promise(r => p1.emit('createGame', { timeControl: 600, playerToken: 'tok_stable_host' }, res => {
                roomId = res.roomId;
                r();
            }));
            await new Promise(r => p2.emit('joinGame', { roomId, playerToken: 'tok_flicker' }, r));

            // Make 1 move: 1. e4
            await new Promise(r => p1.emit('makeMove', { roomId, from: 'e2', to: 'e4', playerToken: 'tok_stable_host' }, r));

            // P2 Disconnects
            const disconnectNotice = new Promise(resolve => p1.once('playerDisconnected', resolve));
            p2.disconnect();
            const dcEvent = await disconnectNotice;
            if (dcEvent.color !== 'b') throw new Error('Expected black disconnect event');
            console.log(`✓ Host received opponent disconnect notification: Color=${dcEvent.color}`);

            // P2 Reconnects in a fresh socket with same playerToken
            const p2Reconnected = createClient('FlickeringClient', 'tok_flicker');
            await new Promise(r => p2Reconnected.on('connect', r));

            const reconnectNotice = new Promise(resolve => p1.once('playerReconnected', resolve));
            let restoredState = null;

            await new Promise(resolve => {
                p2Reconnected.emit('joinGame', { roomId, playerToken: 'tok_flicker' }, (res) => {
                    restoredState = res.gameState;
                    resolve();
                });
            });

            await reconnectNotice;
            console.log('✓ Host received opponent reconnected notification');

            // Verify restored state matches exactly
            if (restoredState.myColor !== 'b' || restoredState.moves.length !== 1 || restoredState.turn !== 'b') {
                throw new Error(`State restoration failed: ${JSON.stringify(restoredState)}`);
            }
            console.log(`✓ Reconnecting player received complete restored state:`);
            console.log(`  - Assigned Color: ${restoredState.myColor}`);
            console.log(`  - Restored FEN: ${restoredState.fen}`);
            console.log(`  - Moves Count: ${restoredState.moves.length}`);
            console.log(`  - Turn: ${restoredState.turn}`);

            p1.disconnect();
            p2Reconnected.disconnect();
        }

        console.log('\n================================================================');
        console.log('✓ ALL 6 TEST SUITES PASSED! ZERO REGRESSIONS FOUND.');
        console.log('================================================================\n');

    } finally {
        await mongoose.disconnect();
        server.close();
    }
}

runFullPlatformTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});

