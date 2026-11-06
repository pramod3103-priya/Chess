import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import {
    RotateCcw,
    Undo2,
    Flag,
    Repeat,
    Volume2,
    VolumeX,
    ArrowLeft,
    Swords,
    Sparkles,
    Shield,
    Clock,
    Palette
} from 'lucide-react';
import ChessBoard from '../components/ChessBoard/ChessBoard';
import CharacterAvatar from '../components/Characters/CharacterAvatar';
import SpeechBubble from '../components/Characters/SpeechBubble';
import ComputerGameOverModal from '../components/Modals/ComputerGameOverModal';
import MoveHistory from '../components/MoveHistory/MoveHistory';
import CapturedTray from '../components/PlayerInfo/CapturedTray';
import { CHARACTERS, getRandomQuote } from '../components/Characters/characterData';
import { findBestMove } from '../utils/chessAI';
import { playSound, setSoundEnabled, isSoundEnabled } from '../utils/audio';
import { PIECE_VALUES, INITIAL_FEN } from '../utils/chessConstants';

export default function ComputerGame() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Query parameters
    const characterId = searchParams.get('char') || 'odi';
    const difficulty = searchParams.get('diff') || 'medium';
    const playerColor = searchParams.get('color') === 'b' ? 'b' : 'w';
    const timeMode = searchParams.get('time') || 'casual';

    const character = CHARACTERS[characterId] || CHARACTERS.odi;
    const computerColor = playerColor === 'w' ? 'b' : 'w';

    // Game state
    const chessRef = useRef(new Chess());
    const [fen, setFen] = useState(INITIAL_FEN);
    const [lastMove, setLastMove] = useState(null);
    const [history, setHistory] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [aiEmotion, setAiEmotion] = useState('idle');
    const [quote, setQuote] = useState('');
    const [isFlipped, setIsFlipped] = useState(playerColor === 'b');
    const [muted, setMuted] = useState(!isSoundEnabled());
    const [boardTheme, setBoardTheme] = useState(() => {
        return localStorage.getItem('chess_board_theme') || 'slate';
    });

    // Game over state
    const [gameOver, setGameOver] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Clocks
    const initialTime = timeMode === '300' ? 300 : timeMode === '600' ? 600 : null;
    const [clocks, setClocks] = useState({
        w: initialTime,
        b: initialTime
    });

    // Initialize initial greeting quote
    useEffect(() => {
        const startQuote = getRandomQuote(characterId, 'start');
        setQuote(startQuote);
    }, [characterId]);

    // Handle initial AI move if player selected Black ('b')
    useEffect(() => {
        if (playerColor === 'b') {
            setIsThinking(true);
            setAiEmotion('thinking');
            const timer = setTimeout(() => {
                makeComputerMove();
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [playerColor]);

    // Sound toggle handler
    const toggleSound = () => {
        const next = !muted;
        setMuted(next);
        setSoundEnabled(!next);
    };

    // Calculate captured pieces & material difference
    const { whiteCaptures, blackCaptures, whiteAdvantage, blackAdvantage } = useMemo(() => {
        const fenPieces = fen.split(' ')[0];
        const counts = {
            w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
            b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
        };

        for (const ch of fenPieces) {
            const lower = ch.toLowerCase();
            if (['p', 'n', 'b', 'r', 'q'].includes(lower)) {
                const color = ch === lower ? 'b' : 'w';
                counts[color][lower] = (counts[color][lower] || 0) + 1;
            }
        }

        const initialCounts = { p: 8, n: 2, b: 2, r: 2, q: 1 };
        const wCaps = [];
        const bCaps = [];

        ['q', 'r', 'b', 'n', 'p'].forEach((type) => {
            const missingW = Math.max(0, initialCounts[type] - counts.w[type]);
            const missingB = Math.max(0, initialCounts[type] - counts.b[type]);
            for (let i = 0; i < missingW; i++) bCaps.push(type);
            for (let i = 0; i < missingB; i++) wCaps.push(type);
        });

        const wScore = Object.keys(counts.w).reduce((acc, t) => acc + counts.w[t] * (PIECE_VALUES[t] || 0), 0);
        const bScore = Object.keys(counts.b).reduce((acc, t) => acc + counts.b[t] * (PIECE_VALUES[t] || 0), 0);

        return {
            whiteCaptures: wCaps,
            blackCaptures: bCaps,
            whiteAdvantage: Math.max(0, wScore - bScore),
            blackAdvantage: Math.max(0, bScore - wScore)
        };
    }, [fen]);

    // Check game over status on the chess instance
    const checkGameOver = useCallback((chess) => {
        if (chess.isCheckmate()) {
            const loser = chess.turn();
            const winner = loser === 'w' ? 'b' : 'w';
            const winnerName = winner === playerColor ? 'You' : character.name;
            const endQuote =
                winner === playerColor
                    ? getRandomQuote(characterId, 'loss')
                    : getRandomQuote(characterId, 'win');

            setGameOver({
                winner,
                reason: `Checkmate! ${winnerName} won the game.`,
                quote: endQuote
            });
            setAiEmotion(winner === computerColor ? 'winning' : 'losing');
            setQuote(endQuote);
            setShowModal(true);
            playSound('gameover');
            return true;
        }

        if (chess.isDraw()) {
            let reason = 'Game drawn';
            if (chess.isStalemate()) reason = 'Draw by Stalemate';
            else if (chess.isThreefoldRepetition()) reason = 'Draw by Threefold Repetition';
            else if (chess.isInsufficientMaterial()) reason = 'Draw by Insufficient Material';
            else reason = 'Draw by 50-move rule';

            const drawQuote =
                characterId === 'odi'
                    ? 'A balanced draw! Both sides held strategic parity.'
                    : 'A tie! No one loses, love wins on the chessboard!';

            setGameOver({
                winner: 'draw',
                reason,
                quote: drawQuote
            });
            setAiEmotion('idle');
            setQuote(drawQuote);
            setShowModal(true);
            playSound('gameover');
            return true;
        }

        return false;
    }, [characterId, character.name, computerColor, playerColor]);

    // Computer Move Execution
    const makeComputerMove = useCallback(() => {
        const chess = chessRef.current;
        if (chess.isGameOver()) return;

        setIsThinking(true);
        setAiEmotion('thinking');
        setQuote(getRandomQuote(characterId, 'thinking'));

        // Delay based on difficulty to simulate thoughtful calculation
        const thinkDelay = difficulty === 'hard' ? 700 : difficulty === 'medium' ? 500 : 350;

        setTimeout(() => {
            try {
                const move = findBestMove(chess, difficulty);
                if (!move) {
                    setIsThinking(false);
                    return;
                }

                const result = chess.move(move);
                if (result) {
                    setFen(chess.fen());
                    setLastMove({ from: result.from, to: result.to });
                    setHistory(chess.history({ verbose: true }));

                    // Sound effect
                    if (chess.isCheck()) {
                        playSound('check');
                    } else if (result.captured) {
                        playSound('capture');
                    } else if (result.flags.includes('k') || result.flags.includes('q')) {
                        playSound('castle');
                    } else if (result.promotion) {
                        playSound('promote');
                    } else {
                        playSound('move');
                    }

                    // Check for checkmate or draw
                    const isOver = checkGameOver(chess);
                    if (!isOver) {
                        if (chess.isCheck()) {
                            setAiEmotion('winning');
                            setQuote(getRandomQuote(characterId, 'check'));
                        } else {
                            setAiEmotion('idle');
                            setQuote(getRandomQuote(characterId, 'move'));
                        }
                    }
                }
            } catch (err) {
                console.error('[ComputerGame] AI move error:', err);
            } finally {
                setIsThinking(false);
            }
        }, thinkDelay);
    }, [characterId, difficulty, checkGameOver]);

    // Player Move Handler
    const handlePlayerMove = (moveData) => {
        if (isThinking || gameOver) return;
        const chess = chessRef.current;

        // Ensure it's player's turn
        if (chess.turn() !== playerColor) return;

        try {
            const result = chess.move({
                from: moveData.from,
                to: moveData.to,
                promotion: moveData.promotion || 'q'
            });

            if (result) {
                setFen(chess.fen());
                setLastMove({ from: result.from, to: result.to });
                setHistory(chess.history({ verbose: true }));

                // Play sound
                if (chess.isCheck()) {
                    playSound('check');
                    setAiEmotion('losing');
                    setQuote(getRandomQuote(characterId, 'opponentCheck'));
                } else if (result.captured) {
                    playSound('capture');
                } else if (result.flags.includes('k') || result.flags.includes('q')) {
                    playSound('castle');
                } else if (result.promotion) {
                    playSound('promote');
                } else {
                    playSound('move');
                }

                // Check game over
                const isOver = checkGameOver(chess);
                if (!isOver) {
                    // Trigger AI response
                    makeComputerMove();
                }
            }
        } catch (e) {
            console.warn('[ComputerGame] Invalid move attempt:', e);
        }
    };

    // Controls: Undo Move (Take back 2 moves: AI's move + Player's move)
    const handleUndo = () => {
        if (isThinking) return;
        const chess = chessRef.current;

        // If it's player's turn, undo 2 plies
        if (chess.turn() === playerColor) {
            chess.undo();
            chess.undo();
        } else {
            // If somehow it's computer's turn, undo 1 ply
            chess.undo();
        }

        setFen(chess.fen());
        const moves = chess.history({ verbose: true });
        setHistory(moves);
        const last = moves[moves.length - 1];
        setLastMove(last ? { from: last.from, to: last.to } : null);
        setGameOver(null);
        setShowModal(false);
        setAiEmotion('idle');
        setQuote(
            characterId === 'odi'
                ? 'A tactical retraction! Let us reconsider this position.'
                : 'Takeback allowed! Mohabbat ki Dukaan believes in second chances!'
        );
        playSound('move');
    };

    // Controls: Restart Game
    const handleRestart = () => {
        chessRef.current = new Chess();
        setFen(INITIAL_FEN);
        setLastMove(null);
        setHistory([]);
        setGameOver(null);
        setShowModal(false);
        setIsThinking(false);
        setAiEmotion('idle');
        const startQuote = getRandomQuote(characterId, 'start');
        setQuote(startQuote);

        if (initialTime) {
            setClocks({ w: initialTime, b: initialTime });
        }

        if (playerColor === 'b') {
            setIsThinking(true);
            setAiEmotion('thinking');
            setTimeout(() => {
                makeComputerMove();
            }, 600);
        }
    };

    // Controls: Resign
    const handleResign = () => {
        if (gameOver) return;
        const endQuote = getRandomQuote(characterId, 'win');
        setGameOver({
            winner: computerColor,
            reason: `You resigned. ${character.name} wins!`,
            quote: endQuote
        });
        setAiEmotion('winning');
        setQuote(endQuote);
        setShowModal(true);
        playSound('gameover');
    };

    // Active Turn indicator
    const currentTurn = chessRef.current.turn();
    const isPlayerTurn = currentTurn === playerColor && !isThinking && !gameOver;

    // AI Info vs Player Info
    const aiIsWhite = computerColor === 'w';
    const aiCaptures = aiIsWhite ? whiteCaptures : blackCaptures;
    const aiAdvantage = aiIsWhite ? whiteAdvantage : blackAdvantage;

    const playerIsWhite = playerColor === 'w';
    const playerCaptures = playerIsWhite ? whiteCaptures : blackCaptures;
    const playerAdvantage = playerIsWhite ? whiteAdvantage : blackAdvantage;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#111827] text-[#F9FAFB] py-4 px-2 sm:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Top Quick Navigation Bar */}
                <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#374151]">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/play-computer"
                            className="p-2 rounded-xl bg-[#1F2937] hover:bg-[#273244] text-[#9CA3AF] hover:text-white border border-[#4B5563] transition flex items-center gap-1.5 text-xs font-bold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Change Opponent</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <span className="text-base font-black text-[#F9FAFB]">{character.name}</span>
                            <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-black border uppercase tracking-wider"
                                style={{
                                    color: character.accentColor,
                                    borderColor: `${character.accentColor}66`,
                                    backgroundColor: `${character.accentColor}18`
                                }}
                            >
                                {difficulty} (~{character.elo[difficulty]} ELO)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Sound Toggle */}
                        <button
                            type="button"
                            onClick={toggleSound}
                            className="p-2 rounded-xl bg-[#1F2937] hover:bg-[#273244] text-[#D1D5DB] border border-[#4B5563] transition text-xs flex items-center gap-1"
                            title={muted ? 'Unmute Sound' : 'Mute Sound'}
                        >
                            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                        </button>

                        {/* Flip Board */}
                        <button
                            type="button"
                            onClick={() => setIsFlipped((prev) => !prev)}
                            className="p-2 rounded-xl bg-[#1F2937] hover:bg-[#273244] text-[#D1D5DB] border border-[#4B5563] transition text-xs flex items-center gap-1"
                            title="Flip Board"
                        >
                            <Repeat className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Arena Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left / Center Column: Opponent Banner + Speech Bubble + Board + Player Bar + Controls (8 Cols) */}
                    <div className="lg:col-span-8 flex flex-col items-center">
                        {/* 1. Opponent Banner (Top) */}
                        <div className="w-full max-w-[600px] mb-2 p-3 sm:p-4 rounded-2xl bg-[#1F2937] border border-[#374151] flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-1 border-2 flex items-center justify-center bg-[#111827] shadow"
                                    style={{ borderColor: character.accentColor }}
                                >
                                    <CharacterAvatar
                                        characterId={characterId}
                                        state={aiEmotion}
                                        isThinking={isThinking}
                                        className="w-full h-full"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm sm:text-base font-black text-[#F9FAFB]">
                                            {character.name}
                                        </span>
                                        <span className="text-[10px] text-[#9CA3AF] font-bold">
                                            ({computerColor === 'w' ? 'White' : 'Black'})
                                        </span>
                                    </div>
                                    <div className="text-xs text-[#9CA3AF] font-medium truncate max-w-[180px] sm:max-w-xs">
                                        {character.title}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <CapturedTray
                                    captures={aiCaptures}
                                    advantage={aiAdvantage}
                                    color={computerColor}
                                />
                                {currentTurn === computerColor && !gameOver && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 animate-pulse">
                                        {isThinking ? 'Thinking...' : 'To Move'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 2. Character Live Speech Bubble */}
                        <div className="w-full max-w-[600px]">
                            <SpeechBubble
                                characterName={character.name}
                                accentColor={character.accentColor}
                                message={quote}
                                isThinking={isThinking}
                            />
                        </div>

                        {/* 3. The 8x8 Chessboard */}
                        <div className="w-full flex justify-center my-2">
                            <ChessBoard
                                fen={fen}
                                myColor={playerColor}
                                orientation={isFlipped ? 'black' : 'white'}
                                isInteractive={isPlayerTurn}
                                lastMove={lastMove}
                                theme={boardTheme}
                                onMove={handlePlayerMove}
                            />
                        </div>

                        {/* 4. Player Info Bar (Bottom) */}
                        <div className="w-full max-w-[600px] mt-2 p-3 sm:p-4 rounded-2xl bg-[#1F2937] border border-[#374151] flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#273244] border border-[#4B5563] flex items-center justify-center font-black text-sm text-[#F9FAFB] shadow">
                                    {playerColor === 'w' ? '♔' : '♚'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm sm:text-base font-black text-[#F9FAFB]">You</span>
                                        <span className="text-[10px] text-[#9CA3AF] font-bold">
                                            ({playerColor === 'w' ? 'White' : 'Black'})
                                        </span>
                                    </div>
                                    <div className="text-xs text-[#9CA3AF]">
                                        Challenger
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <CapturedTray
                                    captures={playerCaptures}
                                    advantage={playerAdvantage}
                                    color={playerColor}
                                />
                                {isPlayerTurn && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 animate-pulse">
                                        Your Turn
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 5. In-Game Controls Section */}
                        <div className="w-full max-w-[600px] mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <button
                                type="button"
                                onClick={handleUndo}
                                disabled={history.length === 0 || isThinking || !!gameOver}
                                className="py-2.5 px-3 bg-[#273244] hover:bg-[#374151] disabled:opacity-40 disabled:hover:bg-[#273244] text-[#F9FAFB] border border-[#4B5563] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                            >
                                <Undo2 className="w-4 h-4 text-[#D1D5DB]" />
                                <span>Takeback</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleRestart}
                                className="py-2.5 px-3 bg-[#273244] hover:bg-[#374151] text-[#F9FAFB] border border-[#4B5563] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                            >
                                <RotateCcw className="w-4 h-4 text-[#D1D5DB]" />
                                <span>Restart</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/play-computer')}
                                className="py-2.5 px-3 bg-[#273244] hover:bg-[#374151] text-[#F9FAFB] border border-[#4B5563] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                            >
                                <Swords className="w-4 h-4 text-[#D1D5DB]" />
                                <span>New Game</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleResign}
                                disabled={!!gameOver}
                                className="py-2.5 px-3 bg-[#1F2937] hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-900/60 disabled:opacity-40 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                            >
                                <Flag className="w-4 h-4 text-rose-400" />
                                <span>Resign</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Move History & Match Information (4 Cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        {/* Opponent Card Summary */}
                        <div className="p-5 rounded-2xl bg-[#1F2937] border border-[#374151] shadow-xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-black uppercase tracking-wider text-[#9CA3AF]">
                                    Match Details
                                </span>
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                                    Offline
                                </span>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-[#374151]">
                                    <span className="text-[#9CA3AF]">Opponent:</span>
                                    <span className="font-bold text-[#F9FAFB]">{character.name}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-[#374151]">
                                    <span className="text-[#9CA3AF]">Engine Difficulty:</span>
                                    <span className="font-bold text-[#F9FAFB] uppercase">{difficulty}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-[#374151]">
                                    <span className="text-[#9CA3AF]">Your Color:</span>
                                    <span className="font-bold text-[#F9FAFB]">{playerColor === 'w' ? 'White (1st move)' : 'Black (2nd move)'}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#9CA3AF]">Rules:</span>
                                    <span className="font-bold text-[#F9FAFB]">Authoritative FIDE</span>
                                </div>
                            </div>
                        </div>

                        {/* Move History */}
                        <div className="flex-1 bg-[#1F2937] rounded-2xl border border-[#374151] shadow-xl overflow-hidden min-h-[320px] max-h-[460px] flex flex-col">
                            <div className="p-3 border-b border-[#374151] bg-[#1E293B] flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#D1D5DB]">
                                    Move Notation
                                </span>
                                <span className="text-xs text-[#9CA3AF]">
                                    {Math.ceil(history.length / 2)} moves
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                <MoveHistory moves={history} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Over Modal */}
            {showModal && gameOver && (
                <ComputerGameOverModal
                    characterId={characterId}
                    playerColor={playerColor}
                    winner={gameOver.winner}
                    reason={gameOver.reason}
                    quote={gameOver.quote}
                    pgn={chessRef.current.pgn()}
                    onRematch={handleRestart}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
