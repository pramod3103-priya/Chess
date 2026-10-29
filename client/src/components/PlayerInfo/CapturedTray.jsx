import React from 'react';
import { PIECE_SVGS } from '../../utils/chessConstants';

export default function CapturedTray({ pieces = [], advantage = 0, color = 'w' }) {
    if (!pieces || pieces.length === 0) {
        return <div className="h-5"></div>;
    }

    // Group pieces by type
    const pieceOrder = ['q', 'r', 'b', 'n', 'p'];
    const sorted = [...pieces].sort((a, b) => pieceOrder.indexOf(a) - pieceOrder.indexOf(b));

    return (
        <div className="flex items-center gap-1.5 flex-wrap min-h-5">
            <div className="flex items-center -space-x-1">
                {sorted.map((type, i) => {
                    const key = `${color}${type}`;
                    const svg = PIECE_SVGS[key];
                    return (
                        <div
                            key={i}
                            className="w-5 h-5 flex items-center justify-center opacity-85 hover:opacity-100 hover:scale-125 transition-all"
                            dangerouslySetInnerHTML={{ __html: svg }}
                        />
                    );
                })}
            </div>
            {advantage > 0 && (
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    +{advantage}
                </span>
            )}
        </div>
    );
}

