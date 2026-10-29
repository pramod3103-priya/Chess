import React from 'react';
import { PIECE_SVGS } from '../../utils/chessConstants';

export default function ChessPiece({ type, color }) {
    if (!type || !color) return null;
    const key = `${color}${type.toLowerCase()}`;
    const svg = PIECE_SVGS[key];

    if (!svg) return null;

    return (
        <div
            className="w-full h-full flex items-center justify-center p-[6%] select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] transition-transform duration-100 ease-out"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}

