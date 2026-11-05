import React, { useState } from 'react';
import { RefreshCw, Home, Eye, Copy, Check, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GameOverModal({
    winner = null,
    result = '',
    myColor = null,
    pgn = '',
    roomId = '',
    rematchOffered = null,
    rematchNotice = null,
    onRequestRematch,
    onAcceptRematch,
    onDeclineRematch,
    onClose
}) {
    const navigate = useNavigate();
    const [copiedPgn, setCopiedPgn] = useState(false);

    // Determine winner display
    let winnerText = 'GAME OVER';
    let winnerColor = 'text-[#D1D5DB]';

    if (winner === 'w') {
        winnerText = '♔ WHITE WINS';
        winnerColor = 'text-[#F9FAFB]';
    } else if (winner === 'b') {
        winnerText = '♚ BLACK WINS';
        winnerColor = 'text-[#D1D5DB]';
    } else if (winner === 'draw' || !winner) {
        winnerText = '½ DRAW ½';
        winnerColor = 'text-[#9CA3AF]';
    }

    const isRematchOfferedToMe = rematchOffered && rematchOffered.byColor && rematchOffered.byColor !== myColor;
    const isRematchOfferedByMe = rematchOffered && rematchOffered.byColor && rematchOffered.byColor === myColor;

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
        link.download = `chess_game_${roomId || 'match'}.pgn`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-[#273244] border border-[#4B5563] rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl relative">
                {/* GAME OVER Label */}
                <div className="inline-block px-3.5 py-1 rounded-full bg-[#1F2937] border border-[#4B5563] text-[#D1D5DB] text-xs font-black tracking-widest uppercase mb-4">
                    GAME OVER
                </div>

                {/* Winner Title: ♔ WHITE WINS or ♚ BLACK WINS */}
                <h2 className={`text-3xl sm:text-4xl font-extrabold ${winnerColor} tracking-tight mb-2 drop-shadow`}>
                    {winnerText}
                </h2>

                {/* Subtitle / Reason */}
                <p className="text-[#D1D5DB] text-sm sm:text-base font-medium mb-5 px-2">
                    {result || (winner === 'draw' ? 'The game ended in a draw.' : `${winner === 'w' ? 'White' : 'Black'} won the game.`)}
                </p>

                {/* Rematch Offered to Me Banner */}
                {isRematchOfferedToMe && (
                    <div className="mb-5 p-3.5 bg-[#1F2937] border border-[#4B5563] rounded-xl text-center">
                        <p className="text-xs font-bold text-[#F9FAFB] mb-2.5">
                            Opponent offered a rematch!
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onAcceptRematch}
                                className="flex-1 py-2 px-3 bg-[#374151] hover:bg-[#4B5563] text-white font-bold rounded-lg text-xs transition shadow border border-[#4B5563]"
                            >
                                Accept Rematch
                            </button>
                            <button
                                onClick={onDeclineRematch}
                                className="flex-1 py-2 px-3 bg-[#273244] hover:bg-[#374151] text-[#D1D5DB] rounded-lg text-xs font-semibold transition border border-[#4B5563]"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                )}

                {/* Rematch Offered by Me Banner */}
                {isRematchOfferedByMe && (
                    <div className="mb-5 p-3 bg-[#1F2937] border border-[#4B5563] rounded-xl flex items-center justify-center gap-2 text-xs text-[#D1D5DB]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#9CA3AF]" />
                        <span>Rematch request sent. Waiting for opponent...</span>
                    </div>
                )}

                {/* Rematch Declined Notice */}
                {rematchNotice && (
                    <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-center gap-2 text-xs text-red-400">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{rematchNotice}</span>
                    </div>
                )}

                {/* Primary Action Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                    {onRequestRematch && !isRematchOfferedToMe && (
                        <button
                            onClick={onRequestRematch}
                            disabled={isRematchOfferedByMe}
                            className={`flex-1 py-3 px-4 bg-[#374151] hover:bg-[#4B5563] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-black/30 border border-[#4B5563] active:scale-95 ${
                                isRematchOfferedByMe ? 'opacity-60 cursor-not-allowed' : ''
                            }`}
                        >
                            <RefreshCw className={`w-4 h-4 text-[#D1D5DB] ${isRematchOfferedByMe ? 'animate-spin' : ''}`} />
                            <span>{isRematchOfferedByMe ? 'Rematch Sent' : 'Play Again'}</span>
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/lobby')}
                        className="flex-1 py-3 px-4 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] hover:text-white border border-[#4B5563] font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-95"
                    >
                        <Home className="w-4 h-4 text-[#9CA3AF]" />
                        <span>Back To Lobby</span>
                    </button>
                </div>

                {/* PGN Actions */}
                {pgn && (
                    <div className="flex items-center justify-center gap-2 pt-3 border-t border-[#4B5563]">
                        <button
                            onClick={handleCopyPgn}
                            className="py-1.5 px-3 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] hover:text-white border border-[#4B5563] text-xs font-semibold flex items-center gap-1.5 transition"
                            title="Copy PGN notation"
                        >
                            {copiedPgn ? <Check className="w-3.5 h-3.5 text-[#F9FAFB]" /> : <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />}
                            <span>{copiedPgn ? 'PGN Copied' : 'Copy PGN'}</span>
                        </button>

                        <button
                            onClick={handleDownloadPgn}
                            className="py-1.5 px-3 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] hover:text-white border border-[#4B5563] text-xs font-semibold flex items-center gap-1.5 transition"
                            title="Download .pgn file"
                        >
                            <Download className="w-3.5 h-3.5 text-[#9CA3AF]" />
                            <span>Download PGN</span>
                        </button>
                    </div>
                )}

                {/* Review Board */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="mt-4 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] flex items-center justify-center gap-1.5 mx-auto transition"
                    >
                        <Eye className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        <span>Review Final Board Position</span>
                    </button>
                )}
            </div>
        </div>
    );
}
