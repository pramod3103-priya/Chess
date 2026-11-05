import React, { useState } from 'react';
import { 
    Flag, 
    Handshake, 
    LogOut, 
    RotateCcw, 
    Volume2, 
    VolumeX, 
    Copy, 
    Check, 
    AlertTriangle,
    RefreshCw,
    Home,
    Download,
    Loader2
} from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../../utils/audio';

export default function GameControls({
    roomId,
    status = 'ACTIVE',
    isPlayer = true,
    pendingDraw = null,
    drawNotice = null,
    rematchOffered = null,
    rematchNotice = null,
    myColor = 'w',
    pgn = '',
    onResign,
    onLeaveGame,
    onExitRoom,
    onOfferDraw,
    onAcceptDraw,
    onRejectDraw,
    onPlayAgain,
    onAcceptRematch,
    onDeclineRematch,
    onBackToLobby,
    onFlipBoard
}) {
    const [copied, setCopied] = useState(false);
    const [copiedPgn, setCopiedPgn] = useState(false);
    const [showResignModal, setShowResignModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showExitRoomModal, setShowExitRoomModal] = useState(false);
    const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

    const handleCopy = () => {
        if (!roomId) return;
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyPgn = () => {
        if (!pgn) return;
        navigator.clipboard.writeText(pgn);
        setCopiedPgn(true);
        setTimeout(() => setCopiedPgn(false), 2500);
    };

    const handleDownloadPgn = () => {
        if (!pgn) return;
        const blob = new Blob([pgn], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chess_match_${roomId || 'game'}.pgn`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const toggleSound = () => {
        const next = !soundOn;
        setSoundEnabled(next);
        setSoundOn(next);
    };

    const isGameOver = status === 'COMPLETED' ||
                       status === 'CHECKMATE' ||
                       status === 'STALEMATE' ||
                       status === 'DRAW' ||
                       status === 'RESIGNED' ||
                       status === 'TIMEOUT' ||
                       status === 'CANCELLED';

    const isWaiting = status === 'WAITING';
    const isActive = status === 'ACTIVE';

    // Draw offer checks
    const isDrawOfferedToMe = pendingDraw && pendingDraw.byColor && pendingDraw.byColor !== myColor;
    const isDrawOfferedByMe = pendingDraw && pendingDraw.byColor && pendingDraw.byColor === myColor;

    // Rematch offer checks
    const isRematchOfferedToMe = rematchOffered && rematchOffered.byColor && rematchOffered.byColor !== myColor;
    const isRematchOfferedByMe = rematchOffered && rematchOffered.byColor && rematchOffered.byColor === myColor;

    return (
        <div className="w-full bg-[#273244] border border-[#4B5563] rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            {/* Draw Offer Banner: Opponent offered a draw */}
            {isDrawOfferedToMe && isActive && (
                <div className="bg-[#1F2937] border border-[#4B5563] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2.5 text-[#F9FAFB]">
                        <Handshake className="w-5 h-5 shrink-0 text-[#D1D5DB]" />
                        <span className="text-sm font-semibold">Your opponent offered a draw.</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={onAcceptDraw}
                            className="flex-1 sm:flex-initial py-2 px-4 bg-[#374151] hover:bg-[#4B5563] text-white rounded-lg text-xs font-bold transition shadow-md border border-[#4B5563]"
                        >
                            Accept
                        </button>
                        <button
                            onClick={onRejectDraw}
                            className="flex-1 sm:flex-initial py-2 px-4 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] hover:text-white rounded-lg text-xs font-semibold transition border border-[#4B5563]"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            )}

            {/* Draw Sent Status Banner */}
            {isDrawOfferedByMe && isActive && (
                <div className="bg-[#1F2937] border border-[#4B5563] rounded-xl p-3 flex items-center justify-between text-xs text-[#D1D5DB] animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <Handshake className="w-4 h-4 text-[#9CA3AF]" />
                        <span>Draw offer sent. Waiting for opponent...</span>
                    </div>
                </div>
            )}

            {/* Draw Declined Toast / Notice */}
            {drawNotice && (
                <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-xs text-red-300 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{drawNotice}</span>
                </div>
            )}

            {/* Rematch Offered to Me Banner (Game Over) */}
            {isRematchOfferedToMe && isGameOver && (
                <div className="bg-[#1F2937] border border-[#4B5563] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2 text-[#F9FAFB] text-sm font-bold">
                        <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-[#D1D5DB]" />
                        <span>Opponent offered a rematch!</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={onAcceptRematch}
                            className="flex-1 sm:flex-initial py-2 px-4 bg-[#374151] hover:bg-[#4B5563] text-white font-bold rounded-lg text-xs transition shadow border border-[#4B5563]"
                        >
                            Accept Rematch
                        </button>
                        <button
                            onClick={onDeclineRematch}
                            className="flex-1 sm:flex-initial py-2 px-4 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] rounded-lg text-xs font-semibold transition border border-[#4B5563]"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            )}

            {/* Rematch Sent Status Banner */}
            {isRematchOfferedByMe && isGameOver && (
                <div className="bg-[#1F2937] border border-[#4B5563] rounded-xl p-3 flex items-center gap-2 text-xs text-[#D1D5DB] animate-fadeIn">
                    <Loader2 className="w-4 h-4 animate-spin text-[#9CA3AF]" />
                    <span>Rematch request sent. Waiting for opponent to accept...</span>
                </div>
            )}

            {/* Rematch Declined Toast */}
            {rematchNotice && (
                <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-xs text-red-300 animate-fadeIn">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{rematchNotice}</span>
                </div>
            )}

            {/* Primary Controls Row when Active */}
            {isActive && isPlayer && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* [ Resign ] */}
                    <button
                        onClick={() => setShowResignModal(true)}
                        className="py-2.5 px-4 bg-[#1F2937] hover:bg-red-950/30 text-[#D1D5DB] hover:text-red-400 border border-[#4B5563] hover:border-red-500/40 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Flag className="w-4 h-4 text-red-400" />
                        <span>Resign</span>
                    </button>

                    {/* [ Offer Draw ] */}
                    <button
                        onClick={onOfferDraw}
                        disabled={!!pendingDraw}
                        className={`py-2.5 px-4 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] hover:text-[#F9FAFB] border border-[#4B5563] rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                            pendingDraw ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <Handshake className="w-4 h-4 text-[#D1D5DB]" />
                        <span>{isDrawOfferedByMe ? 'Draw Offered' : 'Offer Draw'}</span>
                    </button>

                    {/* [ Leave Game ] */}
                    <button
                        onClick={() => setShowLeaveModal(true)}
                        className="py-2.5 px-4 bg-[#1F2937] hover:bg-rose-950/30 text-[#D1D5DB] hover:text-rose-400 border border-[#4B5563] hover:border-rose-500/40 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Leave Game</span>
                    </button>
                </div>
            )}

            {/* Waiting Room Controls: [ Exit Room ] [ Copy Room Code ] */}
            {isWaiting && (
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <button
                        onClick={() => setShowExitRoomModal(true)}
                        className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-[#1F2937] hover:bg-red-950/30 text-[#D1D5DB] hover:text-red-400 border border-[#4B5563] hover:border-red-500/40 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Exit Room</span>
                    </button>

                    {roomId && (
                        <button
                            onClick={handleCopy}
                            className="w-full sm:w-auto py-2.5 px-4 bg-[#1F2937] hover:bg-[#374151] text-[#F9FAFB] border border-[#4B5563] rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2"
                        >
                            {copied ? <Check className="w-4 h-4 text-[#D1D5DB]" /> : <Copy className="w-4 h-4 text-[#9CA3AF]" />}
                            <span>{copied ? 'Room Code Copied!' : 'Copy Room Code'}</span>
                        </button>
                    )}
                </div>
            )}

            {/* Game Over Controls: [ Play Again ] [ Back To Lobby ] */}
            {isGameOver && (
                <div className="flex flex-col gap-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {onPlayAgain && !isRematchOfferedToMe && (
                            <button
                                onClick={onPlayAgain}
                                disabled={isRematchOfferedByMe}
                                className={`py-2.5 px-4 bg-[#374151] hover:bg-[#4B5563] text-[#F9FAFB] border border-[#4B5563] rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md ${
                                    isRematchOfferedByMe ? 'opacity-60 cursor-not-allowed' : ''
                                }`}
                            >
                                <RefreshCw className={`w-4 h-4 text-[#D1D5DB] ${isRematchOfferedByMe ? 'animate-spin' : ''}`} />
                                <span>{isRematchOfferedByMe ? 'Rematch Sent' : 'Play Again'}</span>
                            </button>
                        )}
                        <button
                            onClick={onBackToLobby}
                            className="py-2.5 px-4 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] hover:text-white border border-[#4B5563] rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Home className="w-4 h-4 text-[#9CA3AF]" />
                            <span>Back To Lobby</span>
                        </button>
                    </div>

                    {/* PGN Buttons Row */}
                    {pgn && (
                        <div className="flex items-center gap-2 pt-1 border-t border-[#4B5563]">
                            <button
                                onClick={handleCopyPgn}
                                className="flex-1 py-1.5 px-2 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] border border-[#4B5563] rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                            >
                                {copiedPgn ? <Check className="w-3.5 h-3.5 text-[#F9FAFB]" /> : <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />}
                                <span>{copiedPgn ? 'PGN Copied' : 'Copy PGN'}</span>
                            </button>

                            <button
                                onClick={handleDownloadPgn}
                                className="flex-1 py-1.5 px-2 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] border border-[#4B5563] rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                <span>Download PGN</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Secondary Utility Row: Flip Board & Audio Toggle */}
            <div className="pt-2 border-t border-[#4B5563] flex items-center justify-between text-xs text-[#9CA3AF]">
                <button
                    onClick={onFlipBoard}
                    className="py-1.5 px-3 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] border border-[#4B5563] rounded-lg font-medium transition flex items-center gap-1.5"
                    title="Invert board perspective"
                >
                    <RotateCcw className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>Flip Board</span>
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSound}
                        className="py-1.5 px-3 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] border border-[#4B5563] rounded-lg font-medium transition flex items-center gap-1.5"
                    >
                        {soundOn ? (
                            <>
                                <Volume2 className="w-3.5 h-3.5 text-[#D1D5DB]" />
                                <span>Sound On</span>
                            </>
                        ) : (
                            <>
                                <VolumeX className="w-3.5 h-3.5 text-gray-500" />
                                <span>Muted</span>
                            </>
                        )}
                    </button>

                    {roomId && (
                        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[#9CA3AF]">
                            <span>Room:</span>
                            <span className="font-bold text-[#F9FAFB] bg-[#374151] border border-[#4B5563] px-2 py-0.5 rounded">
                                {roomId}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* 1. RESIGN CONFIRMATION MODAL */}
            {showResignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-[#273244] border border-[#4B5563] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                            <Flag className="w-6 h-6 text-red-400" />
                        </div>

                        <h3 className="text-xl font-bold text-[#F9FAFB] mb-2">
                            Are you sure you want to resign?
                        </h3>
                        <p className="text-xs text-[#9CA3AF] mb-6">
                            Resigning will immediately award victory to your opponent.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResignModal(false)}
                                className="flex-1 py-2.5 px-4 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] border border-[#4B5563] rounded-xl text-xs font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowResignModal(false);
                                    onResign();
                                }}
                                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/30"
                            >
                                Resign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. LEAVE GAME CONFIRMATION MODAL */}
            {showLeaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-[#273244] border border-[#4B5563] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                            <LogOut className="w-6 h-6 text-rose-400" />
                        </div>

                        <h3 className="text-xl font-bold text-[#F9FAFB] mb-2">
                            Leave Game?
                        </h3>
                        <p className="text-sm text-[#D1D5DB] mb-6">
                            If you leave this game, you may lose the game.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLeaveModal(false)}
                                className="flex-1 py-2.5 px-4 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] border border-[#4B5563] rounded-xl text-xs font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowLeaveModal(false);
                                    onLeaveGame();
                                }}
                                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30"
                            >
                                Leave Game
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. EXIT ROOM CONFIRMATION MODAL (WAITING ROOM) */}
            {showExitRoomModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-[#273244] border border-[#4B5563] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#374151] border border-[#4B5563] flex items-center justify-center">
                            <LogOut className="w-6 h-6 text-[#D1D5DB]" />
                        </div>

                        <h3 className="text-xl font-bold text-[#F9FAFB] mb-2">
                            Exit Room?
                        </h3>
                        <p className="text-sm text-[#D1D5DB] mb-6">
                            Are you sure you want to exit and cancel this room?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExitRoomModal(false)}
                                className="flex-1 py-2.5 px-4 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] border border-[#4B5563] rounded-xl text-xs font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowExitRoomModal(false);
                                    onExitRoom();
                                }}
                                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/30"
                            >
                                Exit Room
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
