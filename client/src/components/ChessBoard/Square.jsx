import React from 'react';
import ChessPiece from '../ChessPiece/ChessPiece';

export default function Square({
    file,
    rank,
    isDark,
    piece,
    isSelected,
    isLastMove,
    isInCheck,
    isValidMove,
    isCapture,
    showRankLabel,
    showFileLabel,
    onClick
}) {
    const squareClasses = [
        'square',
        isDark ? 'dark' : 'light',
        isSelected ? 'selected' : '',
        isLastMove ? 'last-move' : '',
        isInCheck ? 'in-check' : '',
        isValidMove && !isCapture ? 'valid-move' : '',
        isValidMove && isCapture ? 'valid-capture' : ''
    ].filter(Boolean).join(' ');

    return (
        <div
            className={`w-full h-full relative aspect-square flex items-center justify-center cursor-pointer transition-colors ${squareClasses}`}
            onClick={onClick}
            data-square={`${file}${rank}`}
        >
            {/* Rank label on the left edge */}
            {showRankLabel && (
                <span className={`coord-rank ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>
                    {rank}
                </span>
            )}

            {/* File label on the bottom edge */}
            {showFileLabel && (
                <span className={`coord-file ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>
                    {file}
                </span>
            )}

            {/* Piece on square */}
            {piece && (
                <ChessPiece type={piece.type} color={piece.color} />
            )}
        </div>
    );
}

