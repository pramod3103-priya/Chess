import React from 'react';
import { RefreshCw, Home, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GameOverModal({
    winner = null,
    result = '',
    myColor = null,
    onRequestRematch,
    onClose
}) {
    const navigate = useNavigate();

    // Determine winner display
    let winnerText = 'GAME OVER';
    let winnerColor = 'text-gray-200';

    if (winner === 'w') {
        winnerText = '♔ WHITE WINS';
        winnerColor = 'text-white';
    } else if (winner === 'b') {
        winnerText = '♚ BLACK WINS';
        winnerColor = 'text-emerald-400';
    } else if (winner === 'draw' || !winner) {
        winnerText = '½ DRAW ½';
        winnerColor = 'text-amber-400';
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl relative">
                {/* GAME OVER Label */}
                <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black tracking-widest uppercase mb-4">
                    GAME OVER
                </div>

                {/* Winner Title: ♔ WHITE WINS or ♚ BLACK WINS */}
                <h2 className={`text-3xl sm:text-4xl font-extrabold ${winnerColor} tracking-tight mb-2 drop-shadow`}>
                    {winnerText}
                </h2>

                {/* Subtitle / Reason */}
                <p className="text-gray-300 text-sm sm:text-base font-medium mb-6 px-2">
                    {result || (winner === 'draw' ? 'The game ended in a draw.' : `${winner === 'w' ? 'White' : 'Black'} won the game.`)}
                </p>

                {/* Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {onRequestRematch && (
                        <button
                            onClick={onRequestRematch}
                            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30 active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Play Again</span>
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/lobby')}
                        className="flex-1 py-3 px-4 bg-[#26292f] hover:bg-[#32363e] text-gray-200 border border-[#3a3f4b] font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-95"
                    >
                        <Home className="w-4 h-4 text-emerald-400" />
                        <span>Back To Lobby</span>
                    </button>
                </div>

                {/* Optional Review Board */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="mt-4 text-xs text-gray-400 hover:text-gray-200 flex items-center justify-center gap-1.5 mx-auto transition"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review Board</span>
                    </button>
                )}
            </div>
        </div>
    );
}
