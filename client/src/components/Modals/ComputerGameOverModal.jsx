import React, { useState } from 'react';
import { RotateCcw, Swords, Home, Copy, Check, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CharacterAvatar from '../Characters/CharacterAvatar';
import { CHARACTERS } from '../Characters/characterData';

export default function ComputerGameOverModal({
    characterId = 'odi',
    playerColor = 'w',
    winner = null, // 'w' | 'b' | 'draw'
    reason = '',
    quote = '',
    pgn = '',
    onRematch,
    onClose
}) {
    const navigate = useNavigate();
    const [copiedPgn, setCopiedPgn] = useState(false);

    const character = CHARACTERS[characterId] || CHARACTERS.odi;
    const playerWon = winner && winner === playerColor;
    const computerWon = winner && winner !== playerColor && winner !== 'draw';
    const isDraw = winner === 'draw' || !winner;

    let bannerTitle = 'GAME OVER';
    let bannerColor = 'text-[#D1D5DB]';
    let avatarState = 'idle';

    if (playerWon) {
        bannerTitle = '🎉 YOU WIN!';
        bannerColor = 'text-emerald-400';
        avatarState = 'losing'; // AI lost
    } else if (computerWon) {
        bannerTitle = `${character.name} WINS!`;
        bannerColor = 'text-amber-400';
        avatarState = 'winning'; // AI won
    } else {
        bannerTitle = '½ DRAW ½';
        bannerColor = 'text-sky-400';
        avatarState = 'idle';
    }

    const handleCopyPgn = () => {
        if (!pgn) return;
        navigator.clipboard.writeText(pgn);
        setCopiedPgn(true);
        setTimeout(() => setCopiedPgn(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-[#1F2937] border-2 border-[#374151] rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl relative">
                {/* Character Avatar with Reaction */}
                <div className="flex justify-center -mt-16 sm:-mt-20 mb-3">
                    <div
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1.5 border-4 bg-[#111827] shadow-2xl"
                        style={{ borderColor: character.accentColor }}
                    >
                        <CharacterAvatar characterId={characterId} state={avatarState} className="w-full h-full" />
                    </div>
                </div>

                {/* Banner Tag */}
                <div className="inline-block px-3 py-1 rounded-full bg-[#111827] border border-[#374151] text-[#9CA3AF] text-[11px] font-black tracking-widest uppercase mb-2">
                    {character.name} &bull; OFFLINE CHESS ARENA
                </div>

                {/* Main Outcome */}
                <h2 className={`text-3xl sm:text-4xl font-black ${bannerColor} tracking-tight mb-2 drop-shadow`}>
                    {bannerTitle}
                </h2>

                {/* Subtitle / Reason */}
                <p className="text-xs sm:text-sm text-[#D1D5DB] font-semibold mb-4">
                    {reason || (isDraw ? 'Game concluded in a draw' : `${winner === 'w' ? 'White' : 'Black'} achieved victory`)}
                </p>

                {/* Character Dialogue Box */}
                {quote && (
                    <div
                        className="p-4 rounded-2xl bg-[#111827]/80 border mb-6 text-left shadow-inner"
                        style={{ borderColor: `${character.accentColor}44` }}
                    >
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: character.accentColor }}>
                            <span>{character.name}&apos;s Verdict</span>
                        </div>
                        <p className="text-xs text-[#F9FAFB] italic leading-relaxed">
                            &ldquo;{quote}&rdquo;
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5 mb-5">
                    <button
                        type="button"
                        onClick={onRematch}
                        className="w-full py-3.5 px-4 rounded-xl font-black text-white text-sm shadow-xl flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 active:translate-y-0"
                        style={{
                            backgroundColor: character.accentColor,
                            boxShadow: `0 8px 20px -4px ${character.accentColor}55`
                        }}
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Play Again (Rematch)</span>
                    </button>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/play-computer')}
                            className="flex-1 py-3 px-3 bg-[#273244] hover:bg-[#374151] text-[#F9FAFB] border border-[#4B5563] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                        >
                            <Swords className="w-4 h-4 text-[#D1D5DB]" />
                            <span>New Opponent</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="py-3 px-4 bg-[#273244] hover:bg-[#374151] text-[#9CA3AF] hover:text-white border border-[#4B5563] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                            title="Close modal to inspect final board position"
                        >
                            <Eye className="w-4 h-4" />
                            <span>Review</span>
                        </button>
                    </div>
                </div>

                {/* Secondary Actions (Copy PGN & Home) */}
                <div className="pt-4 border-t border-[#374151] flex items-center justify-between text-xs text-[#9CA3AF]">
                    <button
                        type="button"
                        onClick={handleCopyPgn}
                        className="inline-flex items-center gap-1.5 hover:text-[#F9FAFB] transition font-medium"
                    >
                        {copiedPgn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPgn ? 'PGN Copied!' : 'Copy PGN'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-1.5 hover:text-[#F9FAFB] transition font-medium"
                    >
                        <Home className="w-3.5 h-3.5" />
                        <span>Home</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

