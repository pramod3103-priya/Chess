import React, { useState, useMemo, useLayoutEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import Square from './Square';
import ChessPiece from '../ChessPiece/ChessPiece';
import PromotionModal from '../Modals/PromotionModal';
import { FILES, RANKS, INITIAL_FEN } from '../../utils/chessConstants';

export default function ChessBoard({
    fen = INITIAL_FEN,
    myColor = 'w',
    orientation = 'white',
    isInteractive = true,
    lastMove = null,
    theme = 'slate',
    onMove
}) {
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [pendingPromotion, setPendingPromotion] = useState(null);
    const [movingPiece, setMovingPiece] = useState(null);
    const hasMountedBoard = useRef(false);



    // Normalize player color to 'w', 'b', or null
    const normalizedMyColor = useMemo(() => {
        if (!myColor) return null;
        const c = String(myColor).toLowerCase();
        if (c === 'w' || c === 'white') return 'w';
        if (c === 'b' || c === 'black') return 'b';
        return null;
    }, [myColor]);

    // Authoritative chess.js instance based on FEN
    const safeFen = fen || INITIAL_FEN;
    const chess = useMemo(() => {
        try {
            return new Chess(safeFen);
        } catch (e) {
            console.warn('[ChessBoard] Invalid FEN, resetting to initial:', safeFen);
            return new Chess(INITIAL_FEN);
        }
    }, [safeFen]);

    // Find if king is in check and locate its square
    const checkSquare = useMemo(() => {
        if (!chess.isCheck()) return null;
        const turn = chess.turn();
        const board = chess.board();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.type === 'k' && piece.color === turn) {
                    return `${FILES[c]}${RANKS[r]}`;
                }
            }
        }
        return null;
    }, [chess]);

    // Compute legal destinations for the selected square
    const legalMovesMap = useMemo(() => {
        if (!selectedSquare) return new Map();
        try {
            const moves = chess.moves({ square: selectedSquare, verbose: true });
            const map = new Map();
            moves.forEach((m) => {
                map.set(m.to, m);
            });
            return map;
        } catch (e) {
            return new Map();
        }
    }, [selectedSquare, chess]);

    // Board ranks and files based on orientation
    const isBlackView = orientation === 'black' || orientation === 'b';
    const displayedRanks = isBlackView ? [...RANKS].reverse() : RANKS;
    const displayedFiles = isBlackView ? [...FILES].reverse() : FILES;

    // Animate the moved piece between squares instead of instantly swapping it.
    useLayoutEffect(() => {
        if (!lastMove?.from || !lastMove?.to) {
            setMovingPiece(null);
            hasMountedBoard.current = true;
            return;
        }

        // Avoid animating a position that was already present on initial mount.
        if (!hasMountedBoard.current) {
            hasMountedBoard.current = true;
            return;
        }

        const movedPiece = chess.get(lastMove.to);
        const fromCol = displayedFiles.indexOf(lastMove.from[0]);
        const fromRow = displayedRanks.indexOf(lastMove.from[1]);
        const toCol = displayedFiles.indexOf(lastMove.to[0]);
        const toRow = displayedRanks.indexOf(lastMove.to[1]);
        if (!movedPiece || [fromCol, fromRow, toCol, toRow].some((v) => v < 0)) return;

        const id = `${safeFen}-${lastMove.from}-${lastMove.to}`;
        setMovingPiece({
            id,
            piece: movedPiece,
            fromCol,
            fromRow,
            deltaCol: toCol - fromCol,
            deltaRow: toRow - fromRow,
            started: false
        });

        const frame = window.requestAnimationFrame(() => {
            setMovingPiece((current) =>
                current?.id === id ? { ...current, started: true } : current
            );
        });
        const timer = window.setTimeout(() => {
            setMovingPiece((current) => (current?.id === id ? null : current));
        }, 260);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timer);
        };
    }, [lastMove?.from, lastMove?.to, safeFen, chess, displayedFiles, displayedRanks]);

    const handleSquareClick = (squareKey) => {
        if (!isInteractive) return;

        // Toggle deselect if clicking same square
        if (selectedSquare === squareKey) {
            setSelectedSquare(null);
            return;
        }

        // If clicking a valid legal destination
        if (selectedSquare && legalMovesMap.has(squareKey)) {
            const moveData = legalMovesMap.get(squareKey);

            // Check if this move requires pawn promotion
            if (moveData.flags && moveData.flags.includes('p')) {
                setPendingPromotion({
                    from: selectedSquare,
                    to: squareKey
                });
                return;
            }

            // Normal legal move
            if (onMove) {
                onMove({
                    from: selectedSquare,
                    to: squareKey,
                    promotion: 'q'
                });
            }
            setSelectedSquare(null);
            return;
        }

        // Selecting a piece
        const piece = chess.get(squareKey);
        if (piece) {
            // Can only pick own pieces when player color is assigned
            if (normalizedMyColor && piece.color !== normalizedMyColor) {
                setSelectedSquare(null);
                return;
            }
            // Can only pick pieces on their turn
            if (piece.color !== chess.turn()) {
                setSelectedSquare(null);
                return;
            }
            setSelectedSquare(squareKey);
        } else {
            setSelectedSquare(null);
        }
    };

    const handlePromotionSelect = (pieceType) => {
        if (!pendingPromotion) return;
        if (onMove) {
            onMove({
                from: pendingPromotion.from,
                to: pendingPromotion.to,
                promotion: pieceType
            });
        }
        setPendingPromotion(null);
        setSelectedSquare(null);
    };

    return (
        <div className="relative w-full max-w-[600px] aspect-square select-none">
            {/* Promotion Modal Overlay */}
            {pendingPromotion && (
                <PromotionModal
                    color={chess.turn()}
                    onSelect={handlePromotionSelect}
                    onCancel={() => setPendingPromotion(null)}
                />
            )}

            {/* Board Container: Exactly 8x8 Grid with 64 squares */}
            <div className={`chess-board-grid w-full h-full grid grid-cols-8 grid-rows-8 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-4 border-[#374151] bg-[#1F2937] theme-${theme}`}>
                {displayedRanks.map((rank, rankIdx) =>
                    displayedFiles.map((file, fileIdx) => {
                        const squareKey = `${file}${rank}`;
                        const piece = chess.get(squareKey);

                        // FIDE checkerboard coloring (a1 is dark, h1 is light, a8 is light, h8 is dark)
                        const colIdx = FILES.indexOf(file);
                        const rowIdx = 8 - parseInt(rank, 10);
                        const isDark = (colIdx + rowIdx) % 2 === 1;

                        const isSelected = selectedSquare === squareKey;
                        const isLast = lastMove && (lastMove.from === squareKey || lastMove.to === squareKey);
                        const isInCheck = checkSquare === squareKey;
                        const isValid = legalMovesMap.has(squareKey);
                        const moveObj = legalMovesMap.get(squareKey);
                        const isCapture = isValid && (!!piece || (moveObj && (moveObj.captured || moveObj.flags?.includes('e'))));

                        // Edge coordinates
                        const showRankLabel = fileIdx === 0;
                        const showFileLabel = rankIdx === 7;

                        return (
                            <Square
                                key={squareKey}
                                file={file}
                                rank={rank}
                                isDark={isDark}
                                piece={piece}
                                hidePiece={movingPiece?.to === squareKey}
                                isSelected={isSelected}
                                isLastMove={isLast}
                                isInCheck={isInCheck}
                                isValidMove={isValid}
                                isCapture={isCapture}
                                showRankLabel={showRankLabel}
                                showFileLabel={showFileLabel}
                                onClick={() => handleSquareClick(squareKey)}
                            />
                        );
                    })
                )}
                {movingPiece && (
                    <div
                        key={movingPiece.id}
                        className="absolute z-30 pointer-events-none"
                        style={{
                            left: `${movingPiece.fromCol * 12.5}%`,
                            top: `${movingPiece.fromRow * 12.5}%`,
                            width: '12.5%',
                            height: '12.5%',
                            transform: movingPiece.started
                                ? `translate(${movingPiece.deltaCol * 100}%, ${movingPiece.deltaRow * 100}%)`
                                : 'translate(0, 0)',
                            transition: movingPiece.started
                                ? 'transform 240ms cubic-bezier(0.22, 0.8, 0.25, 1)'
                                : 'none'
                        }}
                    >
                        <ChessPiece type={movingPiece.piece.type} color={movingPiece.piece.color} />
                    </div>
                )}
            </div>
        </div>
    );
}
