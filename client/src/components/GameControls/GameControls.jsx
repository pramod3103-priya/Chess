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
    X
} from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../../utils/audio';

export default function GameControls({
    roomId,
    status = 'ACTIVE',
    isPlayer = true,
    pendingDraw = null,
    drawNotice = null,
    myColor = 'w',
    onResign,
    onLeaveGame,
    onExitRoom,
    onOfferDraw,
    onAcceptDraw,
    onRejectDraw,
    onPlayAgain,
    onBackToLobby,
    onFlipBoard
}) {
    const [copied, setCopied] = useState(false);
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

    return (
        <div className="w-full bg-[#1e2024] border border-[#2e323b] rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            {/* Draw Offer Banner: Opponent offered a draw */}
            {isDrawOfferedToMe && isActive && (
                <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2.5 text-amber-300">
                        <Handshake className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-semibold">Your opponent offered a draw.</span>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={onAcceptDraw}
                            className="flex-1 sm:flex-initial py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md"
                        >
                            Accept
                        </button>
                        <button
                            onClick={onRejectDraw}
                            className="flex-1 sm:flex-initial py-2 px-4 bg-[#26292f] hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            )}

            {/* Draw Sent Status Banner */}
            {isDrawOfferedByMe && isActive && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <Handshake className="w-4 h-4" />
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

            {/* Primary Controls Row */}
            {isActive && isPlayer && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* [ Resign ] */}
                    <button
                        onClick={() => setShowResignModal(true)}
                        className="py-2.5 px-4 bg-[#26292f] hover:bg-red-600/20 text-gray-200 hover:text-red-400 border border-[#3a3f4b] hover:border-red-500/40 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Flag className="w-4 h-4 text-red-400" />
                        <span>Resign</span>
                    </button>

                    {/* [ Offer Draw ] */}
                    <button
                        onClick={onOfferDraw}
                        disabled={!!pendingDraw}
                        className={`py-2.5 px-4 bg-[#26292f] hover:bg-amber-500/20 text-gray-200 hover:text-amber-400 border border-[#3a3f4b] hover:border-amber-500/40 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                            pendingDraw ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <Handshake className="w-4 h-4 text-amber-400" />
                        <span>{isDrawOfferedByMe ? 'Draw Offered' : 'Offer Draw'}</span>
                    </button>

                    {/* [ Leave Game ] */}
                    <button
                        onClick={() => setShowLeaveModal(true)}
                        className="py-2.5 px-4 bg-[#26292f] hover:bg-rose-600/20 text-gray-200 hover:text-rose-400 border border-[#3a3f4b] hover:border-rose-500/40 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Leave Game</span>
                    </button>
                </div>
            )}

            {/* Waiting Room Controls: [ Exit Room ] */}
            {isWaiting && (
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <button
                        onClick={() => setShowExitRoomModal(true)}
                        className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-[#26292f] hover:bg-red-600/20 text-gray-200 hover:text-red-400 border border-[#3a3f4b] hover:border-red-500/40 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Exit Room</span>
                    </button>

                    {roomId && (
                        <button
                            onClick={handleCopy}
                            className="w-full sm:w-auto py-2.5 px-4 bg-[#26292f] hover:bg-[#32363e] text-emerald-400 border border-[#3a3f4b] rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            <span>{copied ? 'Room Code Copied!' : 'Copy Room Code'}</span>
                        </button>
                    )}
                </div>
            )}

            {/* Game Over Controls: [ Play Again ] [ Back To Lobby ] */}
            {isGameOver && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {onPlayAgain && (
                        <button
                            onClick={onPlayAgain}
                            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Play Again</span>
                        </button>
                    )}
                    <button
                        onClick={onBackToLobby}
                        className="py-2.5 px-4 bg-[#26292f] hover:bg-[#32363e] text-gray-200 border border-[#3a3f4b] rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Home className="w-4 h-4 text-emerald-400" />
                        <span>Back To Lobby</span>
                    </button>
                </div>
            )}

            {/* Secondary Utility Row: Flip Board & Audio Toggle */}
            <div className="pt-2 border-t border-[#2e323b]/60 flex items-center justify-between text-xs text-gray-400">
                <button
                    onClick={onFlipBoard}
                    className="py-1.5 px-3 bg-[#26292f] hover:bg-[#32363e] text-gray-300 border border-[#3a3f4b] rounded-lg font-medium transition flex items-center gap-1.5"
                    title="Invert board perspective"
                >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Flip Board</span>
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSound}
                        className="py-1.5 px-3 bg-[#26292f] hover:bg-[#32363e] text-gray-300 border border-[#3a3f4b] rounded-lg font-medium transition flex items-center gap-1.5"
                    >
                        {soundOn ? (
                            <>
                                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
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
                        <div className="hidden sm:flex items-center gap-1.5 font-mono text-gray-400">
                            <span>Room:</span>
                            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                {roomId}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ========================================================= */}
            {/* 1. RESIGN CONFIRMATION MODAL                              */}
            {/* ========================================================= */}
            {showResignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                            <Flag className="w-6 h-6 text-red-400" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">
                            Are you sure you want to resign?
                        </h3>
                        <p className="text-xs text-gray-400 mb-6">
                            Resigning will immediately award victory to your opponent.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResignModal(false)}
                                className="flex-1 py-2.5 px-4 bg-[#26292f] hover:bg-[#32363e] text-gray-300 rounded-xl text-xs font-semibold transition"
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

            {/* ========================================================= */}
            {/* 2. LEAVE GAME CONFIRMATION MODAL                          */}
            {/* ========================================================= */}
            {showLeaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                            <LogOut className="w-6 h-6 text-rose-400" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">
                            Leave Game?
                        </h3>
                        <p className="text-sm text-gray-300 mb-6">
                            If you leave this game, you may lose the game.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLeaveModal(false)}
                                className="flex-1 py-2.5 px-4 bg-[#26292f] hover:bg-[#32363e] text-gray-300 rounded-xl text-xs font-semibold transition"
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

            {/* ========================================================= */}
            {/* 3. EXIT ROOM CONFIRMATION MODAL (WAITING ROOM)            */}
            {/* ========================================================= */}
            {showExitRoomModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                            <LogOut className="w-6 h-6 text-amber-400" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">
                            Exit Room?
                        </h3>
                        <p className="text-sm text-gray-300 mb-6">
                            Are you sure you want to exit and cancel this room?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExitRoomModal(false)}
                                className="flex-1 py-2.5 px-4 bg-[#26292f] hover:bg-[#32363e] text-gray-300 rounded-xl text-xs font-semibold transition"
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
