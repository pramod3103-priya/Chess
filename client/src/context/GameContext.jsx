import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getSocket, getPlayerToken } from '../services/socket';
import { playSound } from '../utils/audio';

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [room, setRoom] = useState(null);
    const [clocks, setClocks] = useState({ white: 600, black: 600 });
    const [error, setError] = useState(null);
    const [pendingDraw, setPendingDraw] = useState(null);
    const [drawNotice, setDrawNotice] = useState(null);
    const [lastMoveCoords, setLastMoveCoords] = useState(null);

    const socket = getSocket();
    const roomRef = useRef(room);
    roomRef.current = room;

    useEffect(() => {
        if (!socket) return;

        function handleGameState(state) {
            console.log('[Socket] gameState:', state);
            setRoom(state);
            if (state.clocks) {
                setClocks(state.clocks);
            }
            if (state.moves && state.moves.length > 0) {
                const last = state.moves[state.moves.length - 1];
                setLastMoveCoords({ from: last.from, to: last.to });
            }
        }

        function handleGameStarted(data) {
            console.log('[Socket] gameStarted:', data);
            setRoom((prev) => ({
                ...(prev || {}),
                ...data,
                status: 'ACTIVE'
            }));
            if (data.clocks) setClocks(data.clocks);
            playSound('move');
        }

        function handleMoveMade(data) {
            console.log('[Socket] moveMade:', data);
            setRoom((prev) => {
                if (!prev) return prev;
                const newMoves = data.moves || [...(prev.moves || []), data.move];
                return {
                    ...prev,
                    fen: data.fen,
                    turn: data.turn,
                    inCheck: data.inCheck,
                    moves: newMoves,
                    clocks: data.clocks,
                    status: data.status || prev.status,
                    winner: data.winner !== undefined ? data.winner : prev.winner,
                    result: data.result !== undefined ? data.result : prev.result
                };
            });

            if (data.clocks) setClocks(data.clocks);
            if (data.move) {
                setLastMoveCoords({ from: data.move.from, to: data.move.to });
            }

            if (data.inCheck) {
                playSound('check');
            } else if (data.move?.flags?.includes('c') || data.move?.flags?.includes('e')) {
                playSound('capture');
            } else if (data.move?.flags?.includes('k') || data.move?.flags?.includes('q')) {
                playSound('castle');
            } else if (data.move?.flags?.includes('p')) {
                playSound('promote');
            } else {
                playSound('move');
            }
        }

        function handleClockTick(data) {
            setClocks(data.clocks);
        }

        function handleGameOver(data) {
            console.log('[Socket] gameOver:', data);
            setRoom((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: data.status || 'COMPLETED',
                    winner: data.winner,
                    result: data.result,
                    fen: data.fen || prev.fen
                };
            });
            playSound('gameover');
        }

        function handlePlayerDisconnected(data) {
            console.log('[Socket] Opponent disconnected:', data);
            setRoom((prev) => {
                if (!prev) return prev;
                if (data.color === 'w' && prev.whitePlayer) {
                    return { ...prev, whitePlayer: { ...prev.whitePlayer, connected: false } };
                } else if (data.color === 'b' && prev.blackPlayer) {
                    return { ...prev, blackPlayer: { ...prev.blackPlayer, connected: false } };
                }
                return prev;
            });
        }

        function handlePlayerReconnected(data) {
            console.log('[Socket] Opponent reconnected:', data);
            setRoom((prev) => {
                if (!prev) return prev;
                if (data.color === 'w' && prev.whitePlayer) {
                    return { ...prev, whitePlayer: { ...prev.whitePlayer, connected: true } };
                } else if (data.color === 'b' && prev.blackPlayer) {
                    return { ...prev, blackPlayer: { ...prev.blackPlayer, connected: true } };
                }
                return prev;
            });
        }

        function handleDrawOffered(data) {
            console.log('[Socket] drawOffered:', data);
            setPendingDraw(data);
        }

        function handleDrawDeclined() {
            console.log('[Socket] drawDeclined');
            setPendingDraw(null);
            setDrawNotice('Draw offer declined.');
            setTimeout(() => setDrawNotice(null), 4000);
        }

        function handleDrawAccepted(data) {
            console.log('[Socket] drawAccepted:', data);
            setPendingDraw(null);
            setRoom((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: 'DRAW',
                    winner: 'draw',
                    result: data?.result || 'Draw agreed by mutual agreement.'
                };
            });
            playSound('gameover');
        }

        function handlePlayerLeft(data) {
            console.log('[Socket] playerLeft:', data);
            setRoom((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: 'RESIGNED',
                    winner: data.winner,
                    result: data.result || 'Opponent left the game.'
                };
            });
            playSound('gameover');
        }

        function handleGameResigned(data) {

            setRoom((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: 'RESIGNED',
                    winner: data.winner,
                    result: data.result || 'Opponent resigned.'
                };
            });
            playSound('gameover');
        }

        function handleGameCancelled(data) {
            console.log('[Socket] gameCancelled:', data);
            setRoom((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: 'CANCELLED',
                    result: data.message || 'Game cancelled by creator.'
                };
            });
        }

        function handleError(err) {
            console.error('[Socket Error]', err);
            const msg = typeof err === 'string' ? err : (err?.message || 'An error occurred');
            setError(msg);
        }

        socket.on('gameState', handleGameState);
        socket.on('gameStarted', handleGameStarted);
        socket.on('moveMade', handleMoveMade);
        socket.on('clockTick', handleClockTick);
        socket.on('gameOver', handleGameOver);
        socket.on('playerDisconnected', handlePlayerDisconnected);
        socket.on('playerReconnected', handlePlayerReconnected);
        socket.on('playerLeft', handlePlayerLeft);
        socket.on('gameResigned', handleGameResigned);
        socket.on('gameCancelled', handleGameCancelled);
        socket.on('drawOffered', handleDrawOffered);
        socket.on('drawAccepted', handleDrawAccepted);
        socket.on('drawRejected', handleDrawDeclined);
        socket.on('drawDeclined', handleDrawDeclined);
        socket.on('errorMessage', handleError);
        socket.on('error', handleError);

        return () => {
            socket.off('gameState', handleGameState);
            socket.off('gameStarted', handleGameStarted);
            socket.off('moveMade', handleMoveMade);
            socket.off('clockTick', handleClockTick);
            socket.off('gameOver', handleGameOver);
            socket.off('playerDisconnected', handlePlayerDisconnected);
            socket.off('playerReconnected', handlePlayerReconnected);
            socket.off('playerLeft', handlePlayerLeft);
            socket.off('gameResigned', handleGameResigned);
            socket.off('gameCancelled', handleGameCancelled);
            socket.off('drawOffered', handleDrawOffered);
            socket.off('drawAccepted', handleDrawAccepted);
            socket.off('drawRejected', handleDrawDeclined);
            socket.off('drawDeclined', handleDrawDeclined);
            socket.off('errorMessage', handleError);
            socket.off('error', handleError);
        };
    }, [socket]);

    const createGame = useCallback((options = {}) => {
        setError(null);
        const playerToken = getPlayerToken();
        return new Promise((resolve, reject) => {
            socket.emit('createGame', { ...options, playerToken }, (response) => {
                if (response && (response.success === false || response.error)) {
                    const msg = response.message || response.error || 'Failed to create room';
                    setError(msg);
                    reject(new Error(msg));
                } else if (response && response.roomId) {
                    if (response.gameState) {
                        setRoom(response.gameState);
                        if (response.gameState.clocks) setClocks(response.gameState.clocks);
                    }
                    resolve(response.roomId);
                }
            });
        });
    }, [socket]);

    const joinGame = useCallback((roomId) => {
        setError(null);
        const playerToken = getPlayerToken();
        return new Promise((resolve, reject) => {
            socket.emit('joinGame', { roomId, playerToken }, (response) => {
                if (response && (response.success === false || response.error)) {
                    const msg = response.message || response.error || 'Failed to join room';
                    setError(msg);
                    reject(new Error(msg));
                } else if (response && response.success) {
                    if (response.gameState) {
                        setRoom(response.gameState);
                        if (response.gameState.clocks) setClocks(response.gameState.clocks);
                        if (response.gameState.moves?.length > 0) {
                            const last = response.gameState.moves[response.gameState.moves.length - 1];
                            setLastMoveCoords({ from: last.from, to: last.to });
                        }
                    }
                    resolve(response);
                }
            });
        });
    }, [socket]);

    const makeMove = useCallback((move) => {
        const curRoom = roomRef.current;
        if (!curRoom) return;
        const playerToken = getPlayerToken();
        socket.emit('makeMove', {
            roomId: curRoom.roomId,
            from: move.from,
            to: move.to,
            promotion: move.promotion || 'q',
            playerToken
        });
    }, [socket]);

    const resignGame = useCallback(() => {
        const curRoom = roomRef.current;
        if (!curRoom) return Promise.resolve();
        const playerToken = getPlayerToken();
        return new Promise((resolve) => {
            socket.emit('resignGame', { roomId: curRoom.roomId, playerToken }, (resp) => {
                resolve(resp);
            });
        });
    }, [socket]);

    const leaveGame = useCallback(() => {
        const curRoom = roomRef.current;
        if (!curRoom) return Promise.resolve();
        const playerToken = getPlayerToken();
        return new Promise((resolve) => {
            socket.emit('leaveGame', { roomId: curRoom.roomId, playerToken }, (resp) => {
                clearRoom();
                resolve(resp);
            });
            setTimeout(() => {
                clearRoom();
                resolve({ success: true });
            }, 300);
        });
    }, [socket]);

    const cancelGame = useCallback(() => {
        const curRoom = roomRef.current;
        if (!curRoom) return Promise.resolve();
        const playerToken = getPlayerToken();
        return new Promise((resolve) => {
            socket.emit('cancelGame', { roomId: curRoom.roomId, playerToken }, (resp) => {
                clearRoom();
                resolve(resp);
            });
            setTimeout(() => {
                clearRoom();
                resolve({ success: true });
            }, 300);
        });
    }, [socket]);

    const offerDraw = useCallback(() => {
        const curRoom = roomRef.current;
        if (!curRoom) return;
        const playerToken = getPlayerToken();
        socket.emit('offerDraw', { roomId: curRoom.roomId, playerToken });
        setPendingDraw({ byColor: curRoom.myColor, byName: 'You' });
    }, [socket]);

    const acceptDraw = useCallback(() => {
        const curRoom = roomRef.current;
        if (!curRoom) return;
        const playerToken = getPlayerToken();
        socket.emit('acceptDraw', { roomId: curRoom.roomId, playerToken });
        setPendingDraw(null);
    }, [socket]);

    const rejectDraw = useCallback(() => {
        const curRoom = roomRef.current;
        if (!curRoom) return;
        const playerToken = getPlayerToken();
        socket.emit('rejectDraw', { roomId: curRoom.roomId, playerToken });
        setPendingDraw(null);
    }, [socket]);

    const requestRematch = useCallback(() => {
        const curRoom = roomRef.current;
        if (!curRoom) return;
        const playerToken = getPlayerToken();
        socket.emit('requestRematch', { roomId: curRoom.roomId, playerToken });
    }, [socket]);

    const clearRoom = useCallback(() => {
        setRoom(null);
        setError(null);
        setLastMoveCoords(null);
        setPendingDraw(null);
        setDrawNotice(null);
    }, []);

    // Exposed convenience states
    const roomId = room?.roomId || null;
    const playerColor = room?.myColor || null;
    const opponent = useMemo(() => {
        if (!room) return null;
        return room.myColor === 'w' ? room.blackPlayer : room.whitePlayer;
    }, [room]);
    const fen = room?.fen || null;
    const currentTurn = room?.turn || 'w';
    const moves = room?.moves || [];
    const gameStatus = room?.status || 'IDLE';
    const winner = room?.winner || null;
    const timer = clocks;

    return (
        <GameContext.Provider value={{
            room,
            roomId,
            playerColor,
            opponent,
            board: fen,
            fen,
            currentTurn,
            moves,
            gameStatus,
            winner,
            timer,
            clocks,
            error,
            pendingDraw,
            drawNotice,
            lastMoveCoords,
            createGame,
            joinGame,
            makeMove,
            resignGame,
            leaveGame,
            cancelGame,
            offerDraw,
            acceptDraw,
            rejectDraw,
            requestRematch,
            clearRoom,
            setError
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    return useContext(GameContext);
}
