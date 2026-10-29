import React from 'react';
import { PIECE_SVGS } from '../../utils/chessConstants';

export default function PromotionModal({ color = 'w', onSelect, onCancel }) {
    const pieces = [
        { type: 'q', label: 'Queen' },
        { type: 'r', label: 'Rook' },
        { type: 'b', label: 'Bishop' },
        { type: 'n', label: 'Knight' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Pawn Promotion</h3>
                <p className="text-sm text-gray-400 mb-6">Choose a piece to promote your pawn:</p>
                <div className="grid grid-cols-4 gap-3 mb-4">
                    {pieces.map((p) => {
                        const key = `${color}${p.type}`;
                        const svg = PIECE_SVGS[key];
                        return (
                            <button
                                key={p.type}
                                onClick={() => onSelect(p.type)}
                                className="group flex flex-col items-center justify-center p-3 rounded-xl bg-[#26292f] hover:bg-[#10b981]/20 border border-[#3a3f4b] hover:border-[#10b981] transition-all transform hover:-translate-y-1 hover:shadow-lg focus:outline-none"
                            >
                                <div
                                    className="w-12 h-12 flex items-center justify-center mb-1 drop-shadow-md"
                                    dangerouslySetInnerHTML={{ __html: svg }}
                                />
                                <span className="text-xs font-semibold text-gray-300 group-hover:text-emerald-400">
                                    {p.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-xs text-gray-400 hover:text-gray-200 underline mt-2"
                    >
                        Cancel Move
                    </button>
                )}
            </div>
        </div>
    );
}

