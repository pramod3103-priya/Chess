import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check, Users, AlertCircle, ArrowLeft, WifiOff, XCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import ChessBoard from '../components/ChessBoard/ChessBoard';
import PlayerInfo from '../components/PlayerInfo/PlayerInfo';
import MoveHistory from '../components/MoveHistory/MoveHistory';
import GameControls from '../components/GameControls/GameControls';
import GameOverModal from '../components/Modals/GameOverModal';
import { PIECE_VALUES } from '../utils/chessConstants';

export default function ChessGame() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        room,
        clocks,
        error,
        pendingDraw,
        drawNotice,
        lastMoveCoords,
        joinGame,
        makeMove,
        resignGame,
        leaveGame,
        cancelGame,
        offerDraw,
        acceptDraw,
        rejectDraw,
        requestRematch,
        clearRoom
    } = useGame();

    const [flipped, setFlipped] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [showGameOverModal, setShowGameOverModal] = useState(true);

    // Join room on mount or when roomId changes
    useEffect(() => {
        if (roomId) {
            joinGame(roomId.toUpperCase()).catch((err) => {
                console.error('Join room failed:', err);
            });
        }
        return () => {
            clearRoom();
        };
    }, [roomId]);

    // Calculate captured pieces & material difference from FEN
    const { whiteCaptures, blackCaptures, whiteAdvantage, blackAdvantage } = useMemo(() => {
        if (!room?.fen) {
            return { whiteCaptures: [], blackCaptures: [], whiteAdvantage: 0, blackAdvantage: 0 };
        }

        const fenPieces = room.fen.split(' ')[0];
        const counts = {
            w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
            b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
        };

        for (const ch of fenPieces) {
            const lower = ch.toLowerCase();
            if (['p', 'n', 'b', 'r', 'q'].includes(lower)) {
                const color = ch === lower ? 'b' : 'w';
                counts[color][lower] = (counts[color][lower] || 0) + 1;
            }
        }

        const initial = { p: 8, n: 2, b: 2, r: 2, q: 1 };
        const wCaps = [];
        const bCaps = [];

        for (const type of ['q', 'r', 'b', 'n', 'p']) {
            const missingBlack = Math.max(0, initial[type] - (counts.b[type] || 0));
            for (let i = 0; i < missingBlack; i++) wCaps.push(type);

            const missingWhite = Math.max(0, initial[type] - (counts.w[type] || 0));
            for (let i = 0; i < missingWhite; i++) bCaps.push(type);
        }

        let wScore = 0;
        let bScore = 0;
        for (const type of ['p', 'n', 'b', 'r', 'q']) {
            wScore += (counts.w[type] || 0) * (PIECE_VALUES[type] || 0);
            bScore += (counts.b[type] || 0) * (PIECE_VALUES[type] || 0);
        }

        const diff = wScore - bScore;
        return {
            whiteCaptures: wCaps,
            blackCaptures: bCaps,
            whiteAdvantage: diff > 0 ? diff : 0,
            blackAdvantage: diff < 0 ? -diff : 0
        };
    }, [room?.fen]);

    // Player color normalized: 'w', 'b', or null
    const myColor = useMemo(() => {
        if (!room?.myColor) return null;
        const c = String(room.myColor).toLowerCase();
        if (c === 'w' || c === 'white') return 'w';
        if (c === 'b' || c === 'black') return 'b';
        return null;
    }, [room?.myColor]);

    // Current turn: 'w' or 'b'
    const currentTurn = useMemo(() => {
        if (room?.turn) return room.turn;
        if (room?.fen) return room.fen.split(' ')[1] || 'w';
        return 'w';
    }, [room?.turn, room?.fen]);

    // Opponent player
    const opponent = useMemo(() => {
        if (!room) return null;
        return myColor === 'w' ? room.blackPlayer : room.whitePlayer;
    }, [room, myColor]);

    // Disconnect status
    const isOpponentDisconnected = room?.status === 'ACTIVE' && opponent && opponent.connected === false;

    // Board orientation
    const orientation = useMemo(() => {
        if (flipped) {
            return myColor === 'b' ? 'white' : 'black';
        }
        return myColor === 'b' ? 'black' : 'white';
    }, [myColor, flipped]);

    const isGameOver = room?.status === 'COMPLETED' ||
                       room?.status === 'CHECKMATE' ||
                       room?.status === 'STALEMATE' ||
                       room?.status === 'DRAW' ||
                       room?.status === 'RESIGNED' ||
                       room?.status === 'TIMEOUT';

    // Interactive strictly when active and player's turn
    const isMyTurn = !isGameOver && room?.status === 'ACTIVE' && myColor && currentTurn === myColor;

    const copyCode = () => {
        navigator.clipboard.writeText(roomId);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleLeaveGame = async () => {
        await leaveGame();
        navigate('/lobby');
    };

    const handleExitRoom = async () => {
        await cancelGame();
        navigate('/lobby');
    };

    // Show error page if room not found or closed
    if (error) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
                <div className="bg-[#1e2024] border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fadeIn">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Notice</h2>
                    <p className="text-sm text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/lobby')}
                        className="py-2.5 px-6 bg-[#26292f] hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Return to Lobby</span>
                    </button>
                </div>
            </div>
        );
    }

    // Room Cancelled Banner / Screen
    if (room?.status === 'CANCELLED') {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
                <div className="bg-[#1e2024] border border-amber-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fadeIn">
                    <XCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Room Cancelled</h2>
                    <p className="text-sm text-gray-300 mb-6">
                        {room.result || 'This room was cancelled by the host.'}
                    </p>
                    <button
                        onClick={() => navigate('/lobby')}
                        className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 mx-auto shadow-lg shadow-emerald-600/30"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Return to Lobby</span>
                    </button>
                </div>
            </div>
        );
    }

    // Top player vs Bottom player
    const isOrientationWhite = orientation === 'white';
    const topPlayer = isOrientationWhite ? room?.blackPlayer : room?.whitePlayer;
    const topColor = isOrientationWhite ? 'b' : 'w';
    const topClocks = isOrientationWhite ? clocks.black : clocks.white;
    const topCaptures = isOrientationWhite ? blackCaptures : whiteCaptures;
    const topAdvantage = isOrientationWhite ? blackAdvantage : whiteAdvantage;

    const bottomPlayer = isOrientationWhite ? room?.whitePlayer : room?.blackPlayer;
    const bottomColor = isOrientationWhite ? 'w' : 'b';
    const bottomClocks = isOrientationWhite ? clocks.white : clocks.black;
    const bottomCaptures = isOrientationWhite ? whiteCaptures : blackCaptures;
    const bottomAdvantage = isOrientationWhite ? whiteAdvantage : blackAdvantage;

    return (
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col items-center">
            {/* Waiting for Opponent Banner */}
            {room?.status === 'WAITING' && (
                <div className="w-full max-w-2xl mb-6 bg-gradient-to-r from-[#1e2024] via-[#26292f] to-[#1e2024] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl text-center animate-fadeIn">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                        <Users className="w-3.5 h-3.5" />
                        <span>Room Created Successfully</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                        Waiting for Opponent to Join...
                    </h2>
                    <p className="text-sm text-gray-300 mb-4">
                        Share this room code with your friend. As soon as they enter, the match starts automatically!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
                        <div className="flex items-center gap-3 bg-[#141517] border border-[#3a3f4b] rounded-xl px-4 py-2 shadow-inner">
                            <span className="text-xs text-gray-400">Code:</span>
                            <span className="font-mono font-black text-2xl text-emerald-400 tracking-widest">
                                {roomId}
                            </span>
                            <button
                                onClick={copyCode}
                                className="p-2 rounded-lg bg-[#26292f] hover:bg-[#3a3f4b] text-gray-300 hover:text-white transition"
                                title="Copy Room Code"
                            >
                                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        <button
                            onClick={copyLink}
                            className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition"
                        >
                            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedLink ? 'Invite Link Copied!' : 'Copy Direct Invite Link'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Disconnection Warning Banner */}
            {isOpponentDisconnected && (
                <div className="w-full max-w-2xl mb-4 bg-amber-500/15 border border-amber-500/40 rounded-xl p-3.5 flex items-center justify-center gap-2.5 text-amber-300 text-sm font-semibold animate-pulse shadow-lg">
                    <WifiOff className="w-5 h-5 shrink-0" />
                    <span>Opponent disconnected. Waiting for reconnection...</span>
                </div>
            )}

            {/* Game Arena Layout */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start justify-center">
                {/* Chess Board Arena Column */}
                <div className="lg:col-span-8 flex flex-col items-center gap-3">
                    {/* Top Player (Opponent) */}
                    <PlayerInfo
                        player={topPlayer}
                        color={topColor}
                        isActive={room?.status === 'ACTIVE' && currentTurn === topColor}
                        timerSeconds={topClocks}
                        capturedPieces={topCaptures}
                        advantage={topAdvantage}
                    />

                    {/* Chess Board: Exactly 8x8 */}
                    <ChessBoard
                        fen={room?.fen}
                        myColor={myColor}
                        orientation={orientation}
                        isInteractive={isMyTurn}
                        lastMove={lastMoveCoords}
                        onMove={makeMove}
                    />

                    {/* Bottom Player (Current User) */}
                    <PlayerInfo
                        player={bottomPlayer}
                        color={bottomColor}
                        isActive={room?.status === 'ACTIVE' && currentTurn === bottomColor}
                        timerSeconds={bottomClocks}
                        capturedPieces={bottomCaptures}
                        advantage={bottomAdvantage}
                    />

                    {/* Game Controls Section Directly Below Board */}
                    <div className="w-full max-w-[600px] mt-1">
                        <GameControls
                            roomId={roomId}
                            status={room?.status}
                            isPlayer={room?.role === 'player'}
                            pendingDraw={pendingDraw}
                            drawNotice={drawNotice}
                            myColor={myColor}
                            onResign={resignGame}
                            onLeaveGame={handleLeaveGame}
                            onExitRoom={handleExitRoom}
                            onOfferDraw={offerDraw}
                            onAcceptDraw={acceptDraw}
                            onRejectDraw={rejectDraw}
                            onPlayAgain={requestRematch}
                            onBackToLobby={() => navigate('/lobby')}
                            onFlipBoard={() => setFlipped(!flipped)}
                        />
                    </div>
                </div>

                {/* Right Side Panel: Turn Banner & Move History */}
                <div className="lg:col-span-4 flex flex-col gap-4 w-full max-w-[420px] mx-auto">
                    {/* Turn & Status Indicator Banner */}
                    <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-4 shadow-md flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div
                                className={`w-3.5 h-3.5 rounded-full ${
                                    room?.status === 'ACTIVE'
                                        ? currentTurn === 'w'
                                            ? 'bg-white shadow-[0_0_8px_#ffffff]'
                                            : 'bg-[#3b3e47] border border-gray-400'
                                        : 'bg-amber-400'
                                }`}
                            />
                            <span className="font-bold text-sm text-gray-200">
                                {room?.status === 'WAITING'
                                    ? 'Awaiting Player 2...'
                                    : isGameOver
                                    ? 'Match Finished'
                                    : isMyTurn
                                    ? `Your Turn (${myColor === 'w' ? 'White' : 'Black'})`
                                    : `Opponent's Turn (${currentTurn === 'w' ? 'White' : 'Black'})`}
                            </span>
                        </div>
                        {room?.inCheck && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                                CHECK!
                            </span>
                        )}
                    </div>

                    {/* Move History */}
                    <MoveHistory moves={room?.moves || []} />
                </div>
            </div>

            {/* Game Over Modal */}
            {isGameOver && showGameOverModal && (
                <GameOverModal
                    winner={room?.winner}
                    result={room?.result}
                    myColor={myColor}
                    onRequestRematch={requestRematch}
                    onClose={() => setShowGameOverModal(false)}
                />
            )}
        </div>
    );
}
