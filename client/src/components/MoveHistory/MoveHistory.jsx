import React, { useEffect, useRef } from 'react';
import { History } from 'lucide-react';

export default function MoveHistory({ moves = [] }) {
    const bottomRef = useRef(null);

    // Group moves into turns: [{ moveNum: 1, white: 'e4', black: 'e5' }, ...]
    const turns = [];
    for (let i = 0; i < moves.length; i += 2) {
        turns.push({
            num: Math.floor(i / 2) + 1,
            white: moves[i]?.san || moves[i] || '',
            black: moves[i + 1]?.san || moves[i + 1] || ''
        });
    }

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [moves]);

    return (
        <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl flex flex-col h-full shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2e323b] flex items-center justify-between bg-[#181a1d]">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
                    <History className="w-4 h-4 text-emerald-400" />
                    <span>Move History</span>
                </div>
                <span className="text-xs font-mono text-gray-400">
                    {moves.length} {moves.length === 1 ? 'ply' : 'plies'}
                </span>
            </div>

            <div className="p-3 overflow-y-auto flex-1 font-mono text-sm max-h-[260px] md:max-h-[360px] space-y-1">
                {turns.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 text-xs italic">
                        Moves will appear here once the game begins...
                    </div>
                ) : (
                    turns.map((t, idx) => {
                        const isLatestTurn = idx === turns.length - 1;
                        return (
                            <div
                                key={t.num}
                                className={`grid grid-cols-12 py-1 px-2 rounded hover:bg-[#26292f] transition-colors ${
                                    isLatestTurn ? 'bg-[#26292f]/60' : ''
                                }`}
                            >
                                <span className="col-span-2 text-gray-500 text-xs font-medium">
                                    {t.num}.
                                </span>
                                <span
                                    className={`col-span-5 font-semibold ${
                                        isLatestTurn && !t.black ? 'text-emerald-400' : 'text-gray-200'
                                    }`}
                                >
                                    {t.white}
                                </span>
                                <span
                                    className={`col-span-5 font-semibold ${
                                        isLatestTurn && t.black ? 'text-emerald-400' : 'text-gray-300'
                                    }`}
                                >
                                    {t.black}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}

