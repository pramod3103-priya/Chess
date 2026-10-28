/**
 * ============================================================================
 * Antigravity Chess - Complete Vanilla JavaScript Chess Engine & UI
 * ============================================================================
 * Features:
 * - 100% Pure Vanilla JavaScript (No frameworks, no external libraries)
 * - Complete FIDE Chess Rules: Pawn movement & 2-square rush, En Passant,
 *   Castling (Kingside & Queenside), Pawn Promotion with interactive modal,
 *   Knight/Bishop/Rook/Queen/King moves, Absolute Pin checking, Check,
 *   Checkmate, Stalemate, 50-Move Rule, Threefold Repetition, Insufficient Material
 * - Standard Algebraic Notation (SAN) move history generator with disambiguation
 * - Minimax Chess AI with Alpha-Beta Pruning, Move Ordering, and Piece-Square Tables (PST)
 * - Authentic Procedural Audio via Web Audio API (zero network requests, zero broken audio)
 * - Modern dark premium UI, fully responsive for desktop, laptop, tablet, and mobile
 */

(() => {
    'use strict';

    /* ==========================================================================
       1. Piece SVG Definitions (Embedded Vector Graphics for Perfect Sharpness)
       ========================================================================== */

    const PIECE_SVGS = {
        wp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 L 34,39.5 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" style="fill:#ffffff; stroke:#1a1a1a; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;"/></svg>`,
        
        bp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 L 34,39.5 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" style="fill:#242220; stroke:#f0d9b5; stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round;"/></svg>`,

        wn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g style="fill:none; fill-rule:evenodd; stroke:#1a1a1a; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;"><path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" style="fill:#ffffff; stroke:#1a1a1a;"/><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.05,8.14 17,9 C 17,9.86 18.24,9.39 19,10 C 19.26,10.08 21.67,9.57 22,10 z" style="fill:#ffffff; stroke:#1a1a1a;"/><circle cx="9.5" cy="25.5" r="1" style="fill:#1a1a1a; stroke:none;"/><path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" style="fill:#1a1a1a; stroke:#1a1a1a;"/></g></svg>`,

        bn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g style="fill:none; fill-rule:evenodd; stroke:#f0d9b5; stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round;"><path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" style="fill:#242220; stroke:#f0d9b5;"/><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.05,8.14 17,9 C 17,9.86 18.24,9.39 19,10 C 19.26,10.08 21.67,9.57 22,10 z" style="fill:#242220; stroke:#f0d9b5;"/><circle cx="9.5" cy="25.5" r="1.2" style="fill:#ffffff; stroke:none;"/><path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" style="fill:#ffffff; stroke:#ffffff;"/></g></svg>`,

        wb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g style="fill:none; fill-rule:evenodd; stroke:#1a1a1a; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;"><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z" style="fill:#ffffff; stroke:#1a1a1a;"/><path d="M 12,36 C 11.27,32.3 12.5,21.5 22.5,14 C 32.5,21.5 33.73,32.3 33,36" style="fill:#ffffff; stroke:#1a1a1a;"/><path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,10 L 22.5,14 M 20,10 L 25,10" style="fill:none; stroke:#1a1a1a;"/><circle cx="22.5" cy="8" r="1.5" style="fill:#ffffff; stroke:#1a1a1a;"/><path d="M 22.5,15.5 C 20,18.5 20,24 22.5,26 C 25,24 25,18.5 22.5,15.5 z" style="fill:#ffffff; stroke:#1a1a1a;"/></g></svg>`,

        bb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g style="fill:none; fill-rule:evenodd; stroke:#f0d9b5; stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round;"><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z" style="fill:#242220; stroke:#f0d9b5;"/><path d="M 12,36 C 11.27,32.3 12.5,21.5 22.5,14 C 32.5,21.5 33.73,32.3 33,36" style="fill:#242220; stroke:#f0d9b5;"/><path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,10 L 22.5,14 M 20,10 L 25,10" style="fill:none; stroke:#f0d9b5;"/><circle cx="22.5" cy="8" r="1.5" style="fill:#242220; stroke:#f0d9b5;"/><path d="M 22.5,15.5 C 20,18.5 20,24 22.5,26 C 25,24 25,18.5 22.5,15.5 z" style="fill:#242220; stroke:#f0d9b5;"/></g></svg>`,

        wr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g style="fill:#ffffff; stroke:#1a1a1a; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;"><path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" /><path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" /><path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" /><path d="M 34,14 L 31,17 L 14,17 L 11,14" /><path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" /><path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" /><path d="M 11,14 L 34,14" style="fill:none; stroke:#1a1a1a;" /></g></svg>`,

        br: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g style="fill:#242220; stroke:#f0d9b5; stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round;"><path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" /><path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" /><path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" /><path d="M 34,14 L 31,17 L 14,17 L 11,14" /><path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" /><path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" /><path d="M 11,14 L 34,14" style="fill:none; stroke:#f0d9b5;" /></g></svg>`,

        wq: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g style="fill:#ffffff; stroke:#1a1a1a; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 22.5,10 L 14,25 L 6.5,13.5 L 9,26 z" /><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 11.5,38 12.5,38.5 14,39 C 22,39.5 23,39.5 31,39 C 32.5,38.5 33.5,38 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26" /><path d="M 11.5,30 C 15,29 30,29 33.5,30" style="fill:none;" /><path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" style="fill:none;" /><circle cx="6" cy="12" r="2" /><circle cx="14" cy="9" r="2" /><circle cx="22.5" cy="8" r="2" /><circle cx="31" cy="9" r="2" /><circle cx="39" cy="12" r="2" /></g></svg>`,

        bq: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g style="fill:#242220; stroke:#f0d9b5; stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round;"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 22.5,10 L 14,25 L 6.5,13.5 L 9,26 z" /><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 11.5,38 12.5,38.5 14,39 C 22,39.5 23,39.5 31,39 C 32.5,38.5 33.5,38 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26" /><path d="M 11.5,30 C 15,29 30,29 33.5,30" style="fill:none; stroke:#f0d9b5;" /><path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" style="fill:none; stroke:#f0d9b5;" /><circle cx="6" cy="12" r="2" /><circle cx="14" cy="9" r="2" /><circle cx="22.5" cy="8" r="2" /><circle cx="31" cy="9" r="2" /><circle cx="39" cy="12" r="2" /></g></svg>`,

        wk: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g style="fill:none; fill-rule:evenodd; stroke:#1a1a1a; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round;"><path d="M 22.5,11.63 L 22.5,6" style="stroke-linejoin:miter;" /><path d="M 20,8 L 25,8" style="stroke-linejoin:miter;" /><path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,25 z" style="fill:#ffffff;" /><path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,34 37,29 37,25 C 37,17.5 34.5,14 31,14 C 27.5,14 26.5,18 22.5,18 C 18.5,18 17.5,14 14,14 C 10.5,14 8,17.5 8,25 C 8,29 8.5,34 11.5,37 z" style="fill:#ffffff;" /><path d="M 11.5,30 C 17,27 28,27 33.5,30" /><path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" /><path d="M 11.5,37 C 17,34 28,34 33.5,37" /></g></svg>`,

        bk: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g style="fill:none; fill-rule:evenodd; stroke:#f0d9b5; stroke-width:1.3; stroke-linecap:round; stroke-linejoin:round;"><path d="M 22.5,11.63 L 22.5,6" style="stroke-linejoin:miter; stroke:#f0d9b5;" /><path d="M 20,8 L 25,8" style="stroke-linejoin:miter; stroke:#f0d9b5;" /><path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,25 z" style="fill:#242220; stroke:#f0d9b5;" /><path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,34 37,29 37,25 C 37,17.5 34.5,14 31,14 C 27.5,14 26.5,18 22.5,18 C 18.5,18 17.5,14 14,14 C 10.5,14 8,17.5 8,25 C 8,29 8.5,34 11.5,37 z" style="fill:#242220; stroke:#f0d9b5;" /><path d="M 11.5,30 C 17,27 28,27 33.5,30" style="stroke:#f0d9b5;" /><path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" style="stroke:#f0d9b5;" /><path d="M 11.5,37 C 17,34 28,34 33.5,37" style="stroke:#f0d9b5;" /></g></svg>`
    };

    /* Piece point values for evaluation and material display */
    const PIECE_VALUES = {
        p: 100,
        n: 320,
        b: 330,
        r: 500,
        q: 900,
        k: 20000
    };

    /* Piece-Square Tables (oriented for White; mirrored for Black) */
    const PST = {
        p: [
            [ 0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [ 5,  5, 10, 25, 25, 10,  5,  5],
            [ 0,  0,  0, 20, 20,  0,  0,  0],
            [ 5, -5,-10,  0,  0,-10, -5,  5],
            [ 5, 10, 10,-20,-20, 10, 10,  5],
            [ 0,  0,  0,  0,  0,  0,  0,  0]
        ],
        n: [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ],
        b: [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ],
        r: [
            [ 0,  0,  0,  0,  0,  0,  0,  0],
            [ 5, 10, 10, 10, 10, 10, 10,  5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [ 0,  0,  0,  5,  5,  0,  0,  0]
        ],
        q: [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [ -5,  0,  5,  5,  5,  5,  0, -5],
            [  0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ],
        k: [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [ 20, 20,  0,  0,  0,  0, 20, 20],
            [ 20, 30, 10,  0,  0, 10, 30, 20]
        ]
    };

    /* ==========================================================================
       2. Web Audio Procedural Sound Synthesizer
       ========================================================================== */

    let audioCtx = null;
    let soundEnabled = true;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playSound(type) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            if (type === 'move') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(280, now);
                osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === 'capture') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(360, now);
                osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'check') {
                [520, 780].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.09);
                    gain.gain.setValueAtTime(0.3, now + idx * 0.09);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.12);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.09);
                    osc.stop(now + idx * 0.09 + 0.12);
                });
            } else if (type === 'castle') {
                [0, 0.09].forEach(delay => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(220, now + delay);
                    osc.frequency.exponentialRampToValueAtTime(60, now + delay + 0.06);
                    gain.gain.setValueAtTime(0.3, now + delay);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.06);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + delay);
                    osc.stop(now + delay + 0.06);
                });
            } else if (type === 'promote') {
                [440, 554, 659, 880].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                    gain.gain.setValueAtTime(0.25, now + idx * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.15);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.06);
                    osc.stop(now + idx * 0.06 + 0.15);
                });
            } else if (type === 'gameover') {
                [330, 415, 493, 659].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                    gain.gain.setValueAtTime(0.3, now + idx * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.35);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.12);
                    osc.stop(now + idx * 0.12 + 0.35);
                });
            }
        } catch (e) {
            // Audio policy or unsupported audio
        }
    }

    /* ==========================================================================
       3. Game State & Data Structures
       ========================================================================== */

    let gameState = {
        board: createInitialBoardArray(),
        turn: 'w',
        castling: {
            w: { k: true, q: true },
            b: { k: true, q: true }
        },
        enPassantTarget: null, // { r, c }
        halfmoveClock: 0,
        fullmoveNumber: 1,
        captured: { w: [], b: [] },
        history: [], // array of { san, from, to, piece, captured, boardSnapshot }
        positionCounts: {}, // for threefold repetition
        
        isFlipped: false,
        gameMode: 'pve', // 'pve' (vs computer) or 'pvp' (vs player)
        aiDifficulty: 'medium', // 'easy', 'medium', 'hard'
        aiColor: 'b',
        
        selectedSquare: null, // { r, c }
        legalMovesForSelected: [],
        lastMove: null, // { from: { r, c }, to: { r, c } }
        inCheckSquare: null, // { r, c } of king in check
        
        isGameOver: false,
        gameOverTitle: '',
        gameOverReason: '',
        isThinking: false,
        pendingPromotion: null,
        
        viewHistoryIndex: null // null means viewing live board, otherwise index into history
    };

    let undoStack = [];
    let redoStack = [];

    function createInitialBoardArray() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
        for (let c = 0; c < 8; c++) {
            board[0][c] = { type: backRank[c], color: 'b' };
            board[1][c] = { type: 'p', color: 'b' };
            board[6][c] = { type: 'p', color: 'w' };
            board[7][c] = { type: backRank[c], color: 'w' };
        }
        return board;
    }

    function cloneBoard(board) {
        return board.map(row => row.map(cell => cell ? { ...cell } : null));
    }

    function cloneCastling(castling) {
        return {
            w: { ...castling.w },
            b: { ...castling.b }
        };
    }

    function createGameStateSnapshot() {
        return {
            board: cloneBoard(gameState.board),
            turn: gameState.turn,
            castling: cloneCastling(gameState.castling),
            enPassantTarget: gameState.enPassantTarget ? { ...gameState.enPassantTarget } : null,
            halfmoveClock: gameState.halfmoveClock,
            fullmoveNumber: gameState.fullmoveNumber,
            captured: {
                w: [...gameState.captured.w],
                b: [...gameState.captured.b]
            },
            history: gameState.history.map(h => ({ ...h })),
            positionCounts: { ...gameState.positionCounts },
            lastMove: gameState.lastMove ? { from: { ...gameState.lastMove.from }, to: { ...gameState.lastMove.to } } : null,
            isGameOver: gameState.isGameOver,
            gameOverTitle: gameState.gameOverTitle,
            gameOverReason: gameState.gameOverReason
        };
    }

    function restoreGameStateSnapshot(snapshot) {
        gameState.board = cloneBoard(snapshot.board);
        gameState.turn = snapshot.turn;
        gameState.castling = cloneCastling(snapshot.castling);
        gameState.enPassantTarget = snapshot.enPassantTarget ? { ...snapshot.enPassantTarget } : null;
        gameState.halfmoveClock = snapshot.halfmoveClock;
        gameState.fullmoveNumber = snapshot.fullmoveNumber;
        gameState.captured = {
            w: [...snapshot.captured.w],
            b: [...snapshot.captured.b]
        };
        gameState.history = snapshot.history.map(h => ({ ...h }));
        gameState.positionCounts = { ...snapshot.positionCounts };
        gameState.lastMove = snapshot.lastMove ? { from: { ...snapshot.lastMove.from }, to: { ...snapshot.lastMove.to } } : null;
        gameState.isGameOver = snapshot.isGameOver;
        gameState.gameOverTitle = snapshot.gameOverTitle;
        gameState.gameOverReason = snapshot.gameOverReason;

        gameState.selectedSquare = null;
        gameState.legalMovesForSelected = [];
        gameState.pendingPromotion = null;
        gameState.viewHistoryIndex = null;
        gameState.inCheckSquare = isCheck(gameState.turn, gameState.board) ? findKing(gameState.turn, gameState.board) : null;
    }

    function getPositionKey(board, turn, castling, enPassantTarget) {
        let key = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (!p) {
                    empty++;
                } else {
                    if (empty > 0) {
                        key += empty;
                        empty = 0;
                    }
                    key += (p.color === 'w' ? p.type.toUpperCase() : p.type);
                }
            }
            if (empty > 0) key += empty;
            if (r < 7) key += '/';
        }
        key += ` ${turn} `;
        let castStr = '';
        if (castling.w.k) castStr += 'K';
        if (castling.w.q) castStr += 'Q';
        if (castling.b.k) castStr += 'k';
        if (castling.b.q) castStr += 'q';
        key += (castStr || '-') + ' ';
        if (enPassantTarget) {
            key += String.fromCharCode(97 + enPassantTarget.c) + (8 - enPassantTarget.r);
        } else {
            key += '-';
        }
        return key;
    }

    /* ==========================================================================
       4. Chess Logic: Move Generation & Attack Detection
       ========================================================================== */

    function isOnBoard(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }

    function findKing(color, board) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p && p.color === color && p.type === 'k') {
                    return { r, c };
                }
            }
        }
        return null;
    }

    function isSquareAttacked(r, c, attackerColor, board) {
        // Pawn attacks
        const pawnDir = attackerColor === 'w' ? -1 : 1;
        const pawnFromR = r - pawnDir;
        for (const pawnFromC of [c - 1, c + 1]) {
            if (isOnBoard(pawnFromR, pawnFromC)) {
                const p = board[pawnFromR][pawnFromC];
                if (p && p.color === attackerColor && p.type === 'p') return true;
            }
        }

        // Knight attacks
        const knightOffsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of knightOffsets) {
            const nr = r + dr, nc = c + dc;
            if (isOnBoard(nr, nc)) {
                const p = board[nr][nc];
                if (p && p.color === attackerColor && p.type === 'n') return true;
            }
        }

        // King attacks (adjacent squares)
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (isOnBoard(nr, nc)) {
                    const p = board[nr][nc];
                    if (p && p.color === attackerColor && p.type === 'k') return true;
                }
            }
        }

        // Sliding Orthogonals (Rook, Queen)
        const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of straightDirs) {
            let nr = r + dr, nc = c + dc;
            while (isOnBoard(nr, nc)) {
                const p = board[nr][nc];
                if (p) {
                    if (p.color === attackerColor && (p.type === 'r' || p.type === 'q')) return true;
                    break;
                }
                nr += dr;
                nc += dc;
            }
        }

        // Sliding Diagonals (Bishop, Queen)
        const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of diagDirs) {
            let nr = r + dr, nc = c + dc;
            while (isOnBoard(nr, nc)) {
                const p = board[nr][nc];
                if (p) {
                    if (p.color === attackerColor && (p.type === 'b' || p.type === 'q')) return true;
                    break;
                }
                nr += dr;
                nc += dc;
            }
        }

        return false;
    }

    function isCheck(color, board) {
        const king = findKing(color, board);
        if (!king) return false;
        const oppColor = color === 'w' ? 'b' : 'w';
        return isSquareAttacked(king.r, king.c, oppColor, board);
    }

    /**
     * Generates all pseudo-legal moves for a specific piece
     */
    function getPseudoLegalMovesForPiece(r, c, board, state) {
        const piece = board[r][c];
        if (!piece) return [];
        const moves = [];
        const color = piece.color;
        const oppColor = color === 'w' ? 'b' : 'w';

        // 1. Pawn
        if (piece.type === 'p') {
            const dir = color === 'w' ? -1 : 1;
            const startRank = color === 'w' ? 6 : 1;
            const promoRank = color === 'w' ? 0 : 7;

            // Forward 1 step
            const f1R = r + dir;
            if (isOnBoard(f1R, c) && !board[f1R][c]) {
                const isPromo = f1R === promoRank;
                if (isPromo) {
                    ['q', 'r', 'b', 'n'].forEach(promo => {
                        moves.push({ from: { r, c }, to: { r: f1R, c }, piece, isPromotion: true, promotedTo: promo });
                    });
                } else {
                    moves.push({ from: { r, c }, to: { r: f1R, c }, piece, isPromotion: false });
                }

                // Forward 2 steps from start rank
                const f2R = r + 2 * dir;
                if (r === startRank && !board[f2R][c]) {
                    moves.push({ from: { r, c }, to: { r: f2R, c }, piece, isPromotion: false, isPawnDouble: true });
                }
            }

            // Diagonal Captures
            for (const dc of [-1, 1]) {
                const capR = r + dir;
                const capC = c + dc;
                if (isOnBoard(capR, capC)) {
                    const targetPiece = board[capR][capC];
                    // Normal capture
                    if (targetPiece && targetPiece.color === oppColor) {
                        const isPromo = capR === promoRank;
                        if (isPromo) {
                            ['q', 'r', 'b', 'n'].forEach(promo => {
                                moves.push({ from: { r, c }, to: { r: capR, c: capC }, piece, captured: targetPiece, isPromotion: true, promotedTo: promo });
                            });
                        } else {
                            moves.push({ from: { r, c }, to: { r: capR, c: capC }, piece, captured: targetPiece, isPromotion: false });
                        }
                    }
                    // En Passant capture
                    else if (state.enPassantTarget && state.enPassantTarget.r === capR && state.enPassantTarget.c === capC) {
                        const epPawn = board[r][capC];
                        if (epPawn && epPawn.color === oppColor && epPawn.type === 'p') {
                            moves.push({ from: { r, c }, to: { r: capR, c: capC }, piece, captured: epPawn, isEnPassant: true, isPromotion: false });
                        }
                    }
                }
            }
        }

        // 2. Knight
        else if (piece.type === 'n') {
            const jumps = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            for (const [dr, dc] of jumps) {
                const nr = r + dr, nc = c + dc;
                if (isOnBoard(nr, nc)) {
                    const target = board[nr][nc];
                    if (!target) {
                        moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece });
                    } else if (target.color === oppColor) {
                        moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: target });
                    }
                }
            }
        }

        // 3. Bishop
        else if (piece.type === 'b') {
            const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
            for (const [dr, dc] of dirs) {
                let nr = r + dr, nc = c + dc;
                while (isOnBoard(nr, nc)) {
                    const target = board[nr][nc];
                    if (!target) {
                        moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece });
                    } else {
                        if (target.color === oppColor) {
                            moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: target });
                        }
                        break;
                    }
                    nr += dr;
                    nc += dc;
                }
            }
        }

        // 4. Rook
        else if (piece.type === 'r') {
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of dirs) {
                let nr = r + dr, nc = c + dc;
                while (isOnBoard(nr, nc)) {
                    const target = board[nr][nc];
                    if (!target) {
                        moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece });
                    } else {
                        if (target.color === oppColor) {
                            moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: target });
                        }
                        break;
                    }
                    nr += dr;
                    nc += dc;
                }
            }
        }

        // 5. Queen
        else if (piece.type === 'q') {
            const dirs = [
                [-1, -1], [-1, 1], [1, -1], [1, 1],
                [-1, 0], [1, 0], [0, -1], [0, 1]
            ];
            for (const [dr, dc] of dirs) {
                let nr = r + dr, nc = c + dc;
                while (isOnBoard(nr, nc)) {
                    const target = board[nr][nc];
                    if (!target) {
                        moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece });
                    } else {
                        if (target.color === oppColor) {
                            moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: target });
                        }
                        break;
                    }
                    nr += dr;
                    nc += dc;
                }
            }
        }

        // 6. King
        else if (piece.type === 'k') {
            // Normal 1-step moves
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr, nc = c + dc;
                    if (isOnBoard(nr, nc)) {
                        const target = board[nr][nc];
                        if (!target) {
                            moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece });
                        } else if (target.color === oppColor) {
                            moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: target });
                        }
                    }
                }
            }

            // Castling
            const castlingRights = state.castling[color];
            const kingRank = color === 'w' ? 7 : 0;

            if (r === kingRank && c === 4 && !isCheck(color, board)) {
                // Kingside Castle
                if (castlingRights.k) {
                    const rook = board[kingRank][7];
                    if (rook && rook.color === color && rook.type === 'r') {
                        if (!board[kingRank][5] && !board[kingRank][6]) {
                            if (!isSquareAttacked(kingRank, 5, oppColor, board) &&
                                !isSquareAttacked(kingRank, 6, oppColor, board)) {
                                moves.push({
                                    from: { r, c },
                                    to: { r: kingRank, c: 6 },
                                    piece,
                                    isCastling: 'k'
                                });
                            }
                        }
                    }
                }

                // Queenside Castle
                if (castlingRights.q) {
                    const rook = board[kingRank][0];
                    if (rook && rook.color === color && rook.type === 'r') {
                        if (!board[kingRank][1] && !board[kingRank][2] && !board[kingRank][3]) {
                            if (!isSquareAttacked(kingRank, 3, oppColor, board) &&
                                !isSquareAttacked(kingRank, 2, oppColor, board)) {
                                moves.push({
                                    from: { r, c },
                                    to: { r: kingRank, c: 2 },
                                    piece,
                                    isCastling: 'q'
                                });
                            }
                        }
                    }
                }
            }
        }

        return moves;
    }

    /**
     * Simulates move on a new board clone
     */
    function applySimulatedMove(board, move) {
        const nextBoard = cloneBoard(board);
        const movingPiece = nextBoard[move.from.r][move.from.c];
        nextBoard[move.from.r][move.from.c] = null;

        // En Passant
        if (move.isEnPassant) {
            nextBoard[move.from.r][move.to.c] = null;
        }

        // Castling
        if (move.isCastling === 'k') {
            const rRow = move.to.r;
            nextBoard[rRow][5] = nextBoard[rRow][7];
            nextBoard[rRow][7] = null;
        } else if (move.isCastling === 'q') {
            const rRow = move.to.r;
            nextBoard[rRow][3] = nextBoard[rRow][0];
            nextBoard[rRow][0] = null;
        }

        // Promotion
        if (move.isPromotion) {
            nextBoard[move.to.r][move.to.c] = {
                type: move.promotedTo || 'q',
                color: movingPiece.color
            };
        } else {
            nextBoard[move.to.r][move.to.c] = movingPiece;
        }

        return nextBoard;
    }

    /**
     * Returns all strictly legal moves for a color (filters out self-check)
     */
    function getLegalMoves(color, board, state) {
        const legal = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.color === color) {
                    const pseudo = getPseudoLegalMovesForPiece(r, c, board, state);
                    for (const move of pseudo) {
                        const nextBoard = applySimulatedMove(board, move);
                        if (!isCheck(color, nextBoard)) {
                            legal.push(move);
                        }
                    }
                }
            }
        }
        return legal;
    }

    function isCheckmate(color, board, state) {
        return isCheck(color, board) && getLegalMoves(color, board, state).length === 0;
    }

    function isStalemate(color, board, state) {
        return !isCheck(color, board) && getLegalMoves(color, board, state).length === 0;
    }

    function isInsufficientMaterial(board) {
        const pieces = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p) pieces.push({ ...p, r, c });
            }
        }

        // King vs King
        if (pieces.length === 2) return true;

        // King + Minor Piece vs King
        if (pieces.length === 3) {
            const minor = pieces.find(p => p.type === 'n' || p.type === 'b');
            if (minor) return true;
        }

        // King + Bishop vs King + Bishop (same colored squares)
        if (pieces.length === 4) {
            const bishops = pieces.filter(p => p.type === 'b');
            if (bishops.length === 2 && bishops[0].color !== bishops[1].color) {
                const sqColor1 = (bishops[0].r + bishops[0].c) % 2;
                const sqColor2 = (bishops[1].r + bishops[1].c) % 2;
                if (sqColor1 === sqColor2) return true;
            }
        }

        return false;
    }

    /* ==========================================================================
       5. Standard Algebraic Notation (SAN) Generator
       ========================================================================== */

    function squareToAlgebraic(r, c) {
        return String.fromCharCode(97 + c) + (8 - r);
    }

    function generateSAN(move, boardBefore, stateBefore) {
        if (move.isCastling === 'k') return 'O-O';
        if (move.isCastling === 'q') return 'O-O-O';

        const piece = move.piece;
        const toSq = squareToAlgebraic(move.to.r, move.to.c);
        const fromSq = squareToAlgebraic(move.from.r, move.from.c);
        const isCapture = !!move.captured || !!move.isEnPassant;

        let san = '';

        if (piece.type === 'p') {
            if (isCapture) {
                san = fromSq[0] + 'x' + toSq;
            } else {
                san = toSq;
            }
            if (move.isPromotion) {
                san += '=' + (move.promotedTo || 'q').toUpperCase();
            }
        } else {
            san = piece.type.toUpperCase();

            // Disambiguation
            const allLegal = getLegalMoves(piece.color, boardBefore, stateBefore);
            const ambiguousMoves = allLegal.filter(m =>
                m.piece.type === piece.type &&
                m.to.r === move.to.r &&
                m.to.c === move.to.c &&
                !(m.from.r === move.from.r && m.from.c === move.from.c)
            );

            if (ambiguousMoves.length > 0) {
                const sameFile = ambiguousMoves.some(m => m.from.c === move.from.c);
                const sameRank = ambiguousMoves.some(m => m.from.r === move.from.r);

                if (!sameFile) {
                    san += fromSq[0]; // file
                } else if (!sameRank) {
                    san += fromSq[1]; // rank
                } else {
                    san += fromSq; // both file and rank
                }
            }

            if (isCapture) {
                san += 'x';
            }
            san += toSq;
        }

        // Apply check / checkmate suffix
        const nextBoard = applySimulatedMove(boardBefore, move);
        const oppColor = piece.color === 'w' ? 'b' : 'w';
        const simulatedState = {
            ...stateBefore,
            castling: cloneCastling(stateBefore.castling),
            enPassantTarget: move.isPawnDouble ? { r: (move.from.r + move.to.r) / 2, c: move.from.c } : null
        };

        if (isCheckmate(oppColor, nextBoard, simulatedState)) {
            san += '#';
        } else if (isCheck(oppColor, nextBoard)) {
            san += '+';
        }

        return san;
    }

    /* ==========================================================================
       6. Move Execution, Undo / Redo & State Transition
       ========================================================================== */

    function makeMove(move, isAi = false) {
        if (gameState.isGameOver) return false;

        // If viewing history, snap back to live position first
        if (gameState.viewHistoryIndex !== null) {
            gameState.viewHistoryIndex = null;
        }

        // Save current snapshot to undo stack
        undoStack.push(createGameStateSnapshot());
        redoStack = []; // Clear redo on fresh move

        const boardBefore = gameState.board;
        const stateBefore = {
            castling: cloneCastling(gameState.castling),
            enPassantTarget: gameState.enPassantTarget ? { ...gameState.enPassantTarget } : null
        };

        // Standard algebraic notation
        const san = generateSAN(move, boardBefore, stateBefore);

        // Captured piece handling
        let capturedPiece = move.captured || null;
        if (move.isEnPassant && !capturedPiece) {
            capturedPiece = gameState.board[move.from.r][move.to.c];
        }

        // Execute move on real board
        gameState.board = applySimulatedMove(gameState.board, move);

        if (capturedPiece) {
            gameState.captured[gameState.turn].push(capturedPiece.type);
        }

        // Update castling rights
        const color = move.piece.color;
        if (move.piece.type === 'k') {
            gameState.castling[color].k = false;
            gameState.castling[color].q = false;
        } else if (move.piece.type === 'r') {
            if (move.from.r === (color === 'w' ? 7 : 0) && move.from.c === 7) {
                gameState.castling[color].k = false;
            } else if (move.from.r === (color === 'w' ? 7 : 0) && move.from.c === 0) {
                gameState.castling[color].q = false;
            }
        }

        // Invalidate opponent's castling if rook was captured on original square
        if (move.to.r === 7 && move.to.c === 7) gameState.castling.w.k = false;
        if (move.to.r === 7 && move.to.c === 0) gameState.castling.w.q = false;
        if (move.to.r === 0 && move.to.c === 7) gameState.castling.b.k = false;
        if (move.to.r === 0 && move.to.c === 0) gameState.castling.b.q = false;

        // En Passant target
        if (move.piece.type === 'p' && Math.abs(move.from.r - move.to.r) === 2) {
            gameState.enPassantTarget = {
                r: (move.from.r + move.to.r) / 2,
                c: move.from.c
            };
        } else {
            gameState.enPassantTarget = null;
        }

        // 50-move clock
        if (move.piece.type === 'p' || capturedPiece) {
            gameState.halfmoveClock = 0;
        } else {
            gameState.halfmoveClock++;
        }

        // Fullmove count
        if (color === 'b') {
            gameState.fullmoveNumber++;
        }

        // Last move highlight
        gameState.lastMove = { from: { ...move.from }, to: { ...move.to } };
        gameState.selectedSquare = null;
        gameState.legalMovesForSelected = [];

        // Record to move history
        gameState.history.push({
            san,
            from: { ...move.from },
            to: { ...move.to },
            piece: { ...move.piece },
            captured: capturedPiece ? { ...capturedPiece } : null,
            boardSnapshot: cloneBoard(gameState.board)
        });

        // Switch Turn
        gameState.turn = color === 'w' ? 'b' : 'w';

        // Threefold Repetition tracking
        const posKey = getPositionKey(gameState.board, gameState.turn, gameState.castling, gameState.enPassantTarget);
        gameState.positionCounts[posKey] = (gameState.positionCounts[posKey] || 0) + 1;

        // Check & Game End Verification
        const oppColor = gameState.turn;
        const kingPos = findKing(oppColor, gameState.board);
        const inCheck = isCheck(oppColor, gameState.board);
        gameState.inCheckSquare = inCheck ? kingPos : null;

        // Sound effects
        if (move.isCastling) {
            playSound('castle');
        } else if (move.isPromotion) {
            playSound('promote');
        } else if (capturedPiece) {
            playSound('capture');
        } else if (inCheck) {
            playSound('check');
        } else {
            playSound('move');
        }

        // Check for Game Over conditions
        if (isCheckmate(oppColor, gameState.board, gameState)) {
            gameState.isGameOver = true;
            const winner = color === 'w' ? 'White' : 'Black';
            gameState.gameOverTitle = 'Checkmate!';
            gameState.gameOverReason = `${winner} Wins! 🎉`;
            playSound('gameover');
            showGameOverModal(gameState.gameOverTitle, gameState.gameOverReason);
        } else if (isStalemate(oppColor, gameState.board, gameState)) {
            gameState.isGameOver = true;
            gameState.gameOverTitle = 'Draw';
            gameState.gameOverReason = 'Stalemate - No legal moves available.';
            playSound('gameover');
            showGameOverModal(gameState.gameOverTitle, gameState.gameOverReason);
        } else if (gameState.positionCounts[posKey] >= 3) {
            gameState.isGameOver = true;
            gameState.gameOverTitle = 'Draw';
            gameState.gameOverReason = 'Draw by Threefold Repetition.';
            playSound('gameover');
            showGameOverModal(gameState.gameOverTitle, gameState.gameOverReason);
        } else if (gameState.halfmoveClock >= 100) {
            gameState.isGameOver = true;
            gameState.gameOverTitle = 'Draw';
            gameState.gameOverReason = 'Draw by 50-Move Rule.';
            playSound('gameover');
            showGameOverModal(gameState.gameOverTitle, gameState.gameOverReason);
        } else if (isInsufficientMaterial(gameState.board)) {
            gameState.isGameOver = true;
            gameState.gameOverTitle = 'Draw';
            gameState.gameOverReason = 'Draw by Insufficient Material.';
            playSound('gameover');
            showGameOverModal(gameState.gameOverTitle, gameState.gameOverReason);
        }

        renderBoard();
        updateGameStatus();
        updateMoveHistory();
        renderCapturedPieces();

        // Trigger AI move if in PvE mode and it's AI's turn
        if (!gameState.isGameOver && gameState.gameMode === 'pve' && gameState.turn === gameState.aiColor) {
            triggerAiMove();
        }

        return true;
    }

    function undoMove() {
        if (undoStack.length === 0) return;

        // Cancel any pending AI computation
        if (aiTimeoutId) {
            clearTimeout(aiTimeoutId);
            aiTimeoutId = null;
        }
        gameState.isThinking = false;

        // In PvE mode, if AI has moved and it's user's turn, undo two plies so player retains turn
        if (gameState.gameMode === 'pve' && gameState.turn !== gameState.aiColor && undoStack.length >= 2) {
            redoStack.push(createGameStateSnapshot());
            const previousAiSnapshot = undoStack.pop();
            redoStack.push(previousAiSnapshot);
            const previousUserSnapshot = undoStack.pop();
            restoreGameStateSnapshot(previousUserSnapshot);
        } else {
            redoStack.push(createGameStateSnapshot());
            const prevSnapshot = undoStack.pop();
            restoreGameStateSnapshot(prevSnapshot);
        }

        hideGameOverModal();
        hidePromotionModal();
        renderBoard();
        updateGameStatus();
        updateMoveHistory();
        renderCapturedPieces();
        playSound('move');
    }

    function redoMove() {
        if (gameState.isThinking || redoStack.length === 0) return;

        if (gameState.gameMode === 'pve' && redoStack.length >= 2) {
            undoStack.push(createGameStateSnapshot());
            const userMoveSnapshot = redoStack.pop();
            undoStack.push(userMoveSnapshot);
            const aiMoveSnapshot = redoStack.pop();
            restoreGameStateSnapshot(aiMoveSnapshot);
        } else {
            undoStack.push(createGameStateSnapshot());
            const nextSnapshot = redoStack.pop();
            restoreGameStateSnapshot(nextSnapshot);
        }

        renderBoard();
        updateGameStatus();
        updateMoveHistory();
        renderCapturedPieces();
        playSound('move');
    }

    function restartGame() {
        if (aiTimeoutId) {
            clearTimeout(aiTimeoutId);
            aiTimeoutId = null;
        }
        gameState.isThinking = false;
        undoStack = [];
        redoStack = [];
        gameState.board = createInitialBoardArray();
        gameState.turn = 'w';
        gameState.castling = {
            w: { k: true, q: true },
            b: { k: true, q: true }
        };
        gameState.enPassantTarget = null;
        gameState.halfmoveClock = 0;
        gameState.fullmoveNumber = 1;
        gameState.captured = { w: [], b: [] };
        gameState.history = [];
        gameState.positionCounts = {};
        gameState.selectedSquare = null;
        gameState.legalMovesForSelected = [];
        gameState.lastMove = null;
        gameState.inCheckSquare = null;
        gameState.isGameOver = false;
        gameState.gameOverTitle = '';
        gameState.gameOverReason = '';
        gameState.isThinking = false;
        gameState.pendingPromotion = null;
        gameState.viewHistoryIndex = null;

        hideGameOverModal();
        hidePromotionModal();
        renderBoard();
        updateGameStatus();
        updateMoveHistory();
        renderCapturedPieces();
        playSound('castle');

        if (gameState.gameMode === 'pve' && gameState.turn === gameState.aiColor) {
            triggerAiMove();
        }
    }

    function flipBoard() {
        gameState.isFlipped = !gameState.isFlipped;
        renderBoard();
        updatePlayerBars();
        renderCapturedPieces();
    }

    /* ==========================================================================
       7. Pawn Promotion UI Handling
       ========================================================================== */

    function showPromotionModal(pendingMove) {
        gameState.pendingPromotion = pendingMove;
        const modal = document.getElementById('promotionModal');
        const container = document.getElementById('promotionOptions');
        container.innerHTML = '';

        const promoPieces = [
            { type: 'q', name: '♕ Queen' },
            { type: 'r', name: '♖ Rook' },
            { type: 'b', name: '♗ Bishop' },
            { type: 'n', name: '♘ Knight' }
        ];

        promoPieces.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'promo-btn';
            btn.innerHTML = `
                ${PIECE_SVGS[pendingMove.piece.color + p.type]}
                <span>${p.name}</span>
            `;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                promotePawn(p.type);
            });
            container.appendChild(btn);
        });

        modal.classList.remove('hidden');
    }

    function hidePromotionModal() {
        const modal = document.getElementById('promotionModal');
        modal.classList.add('hidden');
        gameState.pendingPromotion = null;
    }

    function promotePawn(pieceType) {
        if (!gameState.pendingPromotion) return;
        const move = {
            ...gameState.pendingPromotion,
            promotedTo: pieceType
        };
        hidePromotionModal();
        makeMove(move);
    }

    /* ==========================================================================
       8. Chess AI Engine (Minimax with Alpha-Beta & Positional PSTs)
       ========================================================================== */

    function evaluateBoard(board) {
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (!piece) continue;

                const baseVal = PIECE_VALUES[piece.type];
                let pstTable = PST[piece.type];
                let pstVal = 0;

                if (pstTable) {
                    const pstRow = piece.color === 'w' ? r : 7 - r;
                    pstVal = pstTable[pstRow][c];
                }

                const totalVal = baseVal + pstVal;
                score += (piece.color === 'w' ? totalVal : -totalVal);
            }
        }
        return score;
    }

    function scoreMoveForOrdering(move, board) {
        let score = 0;
        const target = board[move.to.r][move.to.c];
        if (target) {
            // MVV - LVA: Most Valuable Victim - Least Valuable Attacker
            score += 10 * PIECE_VALUES[target.type] - PIECE_VALUES[move.piece.type];
        } else if (move.isEnPassant) {
            score += 10 * PIECE_VALUES.p - PIECE_VALUES.p;
        }
        if (move.isPromotion) {
            score += 800;
        }
        return score;
    }

    function minimax(depth, alpha, beta, isMaximizing, board, state) {
        if (depth === 0) {
            return evaluateBoard(board);
        }

        const currentColor = isMaximizing ? 'w' : 'b';
        const legalMoves = getLegalMoves(currentColor, board, state);

        if (legalMoves.length === 0) {
            if (isCheck(currentColor, board)) {
                return isMaximizing ? -100000 + (3 - depth) : 100000 - (3 - depth);
            }
            return 0; // Stalemate
        }

        // Sort moves for maximum alpha-beta pruning efficiency
        legalMoves.sort((a, b) => scoreMoveForOrdering(b, board) - scoreMoveForOrdering(a, board));

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of legalMoves) {
                const nextBoard = applySimulatedMove(board, move);
                const nextState = {
                    castling: cloneCastling(state.castling),
                    enPassantTarget: move.isPawnDouble ? { r: (move.from.r + move.to.r) / 2, c: move.from.c } : null
                };
                const evaluation = minimax(depth - 1, alpha, beta, false, nextBoard, nextState);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of legalMoves) {
                const nextBoard = applySimulatedMove(board, move);
                const nextState = {
                    castling: cloneCastling(state.castling),
                    enPassantTarget: move.isPawnDouble ? { r: (move.from.r + move.to.r) / 2, c: move.from.c } : null
                };
                const evaluation = minimax(depth - 1, alpha, beta, true, nextBoard, nextState);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function findBestMove(color) {
        const legalMoves = getLegalMoves(color, gameState.board, gameState);
        if (legalMoves.length === 0) return null;

        const isMaximizing = color === 'w';
        const diff = gameState.aiDifficulty;

        // Easy: Depth 1 with 25% chance of random legal move
        if (diff === 'easy') {
            if (Math.random() < 0.25) {
                return legalMoves[Math.floor(Math.random() * legalMoves.length)];
            }
        }

        const depth = diff === 'easy' ? 1 : (diff === 'medium' ? 2 : 3);

        // Sort moves
        legalMoves.sort((a, b) => scoreMoveForOrdering(b, gameState.board) - scoreMoveForOrdering(a, gameState.board));

        let bestMove = null;
        let bestScore = isMaximizing ? -Infinity : Infinity;

        for (const move of legalMoves) {
            const nextBoard = applySimulatedMove(gameState.board, move);
            const nextState = {
                castling: cloneCastling(gameState.castling),
                enPassantTarget: move.isPawnDouble ? { r: (move.from.r + move.to.r) / 2, c: move.from.c } : null
            };

            const score = minimax(depth - 1, -Infinity, Infinity, !isMaximizing, nextBoard, nextState);

            if (isMaximizing) {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
        }

        return bestMove || legalMoves[0];
    }

    let aiTimeoutId = null;

    function triggerAiMove() {
        if (gameState.isGameOver) return;
        if (aiTimeoutId) clearTimeout(aiTimeoutId);

        gameState.isThinking = true;
        updateGameStatus();

        // Realistic thinking delay
        aiTimeoutId = setTimeout(() => {
            aiTimeoutId = null;
            if (gameState.isGameOver || gameState.turn !== gameState.aiColor) {
                gameState.isThinking = false;
                updateGameStatus();
                return;
            }

            const best = findBestMove(gameState.turn);
            gameState.isThinking = false;

            if (best) {
                // If AI promotes, choose Queen
                if (best.isPromotion && !best.promotedTo) {
                    best.promotedTo = 'q';
                }
                makeMove(best, true);
            } else {
                updateGameStatus();
            }
        }, 300);
    }

    /* ==========================================================================
       9. Board Rendering & User Interaction (Clicks & Drag/Drop)
       ========================================================================== */

    const boardElement = document.getElementById('board');
    let draggedSquare = null;

    function createBoard() {
        renderBoard();
    }

    function renderBoard() {
        boardElement.innerHTML = '';

        // If viewing history, render that snapshot, else live board
        const activeBoard = (gameState.viewHistoryIndex !== null && gameState.history[gameState.viewHistoryIndex])
            ? gameState.history[gameState.viewHistoryIndex].boardSnapshot
            : gameState.board;

        // Display rows & cols according to board flip perspective
        for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
            for (let colIdx = 0; colIdx < 8; colIdx++) {
                const r = gameState.isFlipped ? 7 - rowIdx : rowIdx;
                const c = gameState.isFlipped ? 7 - colIdx : colIdx;

                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.r = r;
                square.dataset.c = c;

                // Color alternating
                const isLight = (r + c) % 2 === 0;
                square.classList.add(isLight ? 'light' : 'dark');

                // Coordinate label on files (bottom row of display)
                if (rowIdx === 7) {
                    const fileLabel = document.createElement('span');
                    fileLabel.className = 'coordinate file';
                    fileLabel.textContent = String.fromCharCode(97 + c);
                    square.appendChild(fileLabel);
                }

                // Coordinate label on ranks (left col of display)
                if (colIdx === 0) {
                    const rankLabel = document.createElement('span');
                    rankLabel.className = 'coordinate rank';
                    rankLabel.textContent = 8 - r;
                    square.appendChild(rankLabel);
                }

                // Highlights
                if (gameState.selectedSquare && gameState.selectedSquare.r === r && gameState.selectedSquare.c === c) {
                    square.classList.add('selected');
                }

                if (gameState.lastMove) {
                    if ((gameState.lastMove.from.r === r && gameState.lastMove.from.c === c) ||
                        (gameState.lastMove.to.r === r && gameState.lastMove.to.c === c)) {
                        square.classList.add('last-move');
                    }
                }

                if (gameState.inCheckSquare && gameState.inCheckSquare.r === r && gameState.inCheckSquare.c === c) {
                    square.classList.add('in-check');
                }

                // Legal Move Indicators
                const matchedMove = gameState.legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
                if (matchedMove) {
                    if (matchedMove.captured || matchedMove.isEnPassant) {
                        square.classList.add('valid-capture');
                    } else {
                        square.classList.add('valid-move');
                    }
                }

                // Place piece if present
                const piece = activeBoard[r][c];
                if (piece) {
                    const pieceEl = document.createElement('div');
                    pieceEl.className = 'piece';
                    pieceEl.setAttribute('draggable', 'true');
                    pieceEl.innerHTML = PIECE_SVGS[piece.color + piece.type] || '';

                    // HTML5 Drag Events
                    pieceEl.addEventListener('dragstart', (e) => {
                        if (gameState.isThinking || gameState.isGameOver) return e.preventDefault();
                        if (piece.color !== gameState.turn) return e.preventDefault();
                        if (gameState.gameMode === 'pve' && piece.color === gameState.aiColor) return e.preventDefault();

                        // Snap back from history review if dragging
                        if (gameState.viewHistoryIndex !== null) {
                            gameState.viewHistoryIndex = null;
                        }

                        draggedSquare = { r, c };
                        gameState.selectedSquare = { r, c };
                        gameState.legalMovesForSelected = getLegalMoves(gameState.turn, gameState.board, gameState)
                            .filter(m => m.from.r === r && m.from.c === c);
                        renderBoard();
                        pieceEl.classList.add('dragging');
                    });

                    pieceEl.addEventListener('dragend', () => {
                        pieceEl.classList.remove('dragging');
                        draggedSquare = null;
                    });

                    square.appendChild(pieceEl);
                }

                // Drop listener on square
                square.addEventListener('dragover', (e) => {
                    e.preventDefault();
                });

                square.addEventListener('drop', (e) => {
                    e.preventDefault();
                    if (!draggedSquare) return;
                    handleSquareClick(r, c);
                });

                // Click listener
                square.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleSquareClick(r, c);
                });

                boardElement.appendChild(square);
            }
        }
    }

    function handleSquareClick(r, c) {
        if (gameState.isGameOver || gameState.isThinking) return;
        if (gameState.gameMode === 'pve' && gameState.turn === gameState.aiColor) return;

        // If viewing history, snap back to live position first
        if (gameState.viewHistoryIndex !== null) {
            gameState.viewHistoryIndex = null;
            renderBoard();
            updateGameStatus();
        }

        const clickedPiece = gameState.board[r][c];

        // 1. If no square currently selected:
        if (!gameState.selectedSquare) {
            if (clickedPiece && clickedPiece.color === gameState.turn) {
                gameState.selectedSquare = { r, c };
                gameState.legalMovesForSelected = getLegalMoves(gameState.turn, gameState.board, gameState)
                    .filter(m => m.from.r === r && m.from.c === c);
                renderBoard();
            }
            return;
        }

        // 2. If clicking the exact same square -> deselect
        if (gameState.selectedSquare.r === r && gameState.selectedSquare.c === c) {
            gameState.selectedSquare = null;
            gameState.legalMovesForSelected = [];
            renderBoard();
            return;
        }

        // 3. Check if target is a legal destination
        const legalMove = gameState.legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);

        if (legalMove) {
            // Check for Pawn Promotion
            if (legalMove.isPromotion) {
                showPromotionModal(legalMove);
                return;
            }

            makeMove(legalMove);
            return;
        }

        // 4. If clicking another piece of the same color, switch selection
        if (clickedPiece && clickedPiece.color === gameState.turn) {
            gameState.selectedSquare = { r, c };
            gameState.legalMovesForSelected = getLegalMoves(gameState.turn, gameState.board, gameState)
                .filter(m => m.from.r === r && m.from.c === c);
            renderBoard();
            return;
        }

        // 5. Otherwise deselect
        gameState.selectedSquare = null;
        gameState.legalMovesForSelected = [];
        renderBoard();
    }

    /* ==========================================================================
       10. UI Status, Move History & Captures Display
       ========================================================================== */

    function updateGameStatus() {
        const statusEl = document.getElementById('status');
        const subStatusEl = document.getElementById('subStatus');
        const turnDotEl = document.getElementById('turnDot');
        const topBar = document.getElementById('topPlayerBar');
        const bottomBar = document.getElementById('bottomPlayerBar');

        const activeColor = gameState.turn;
        const colorName = activeColor === 'w' ? 'White' : 'Black';

        // Turn dot styling
        if (activeColor === 'b') {
            turnDotEl.classList.add('black');
        } else {
            turnDotEl.classList.remove('black');
        }

        // Active Player Bar highlight
        const isWhiteBottom = !gameState.isFlipped;
        if (activeColor === 'w') {
            if (isWhiteBottom) {
                bottomBar.classList.add('active-turn');
                topBar.classList.remove('active-turn');
            } else {
                topBar.classList.add('active-turn');
                bottomBar.classList.remove('active-turn');
            }
        } else {
            if (isWhiteBottom) {
                topBar.classList.add('active-turn');
                bottomBar.classList.remove('active-turn');
            } else {
                bottomBar.classList.add('active-turn');
                topBar.classList.remove('active-turn');
            }
        }

        if (gameState.isGameOver) {
            statusEl.textContent = gameState.gameOverTitle;
            subStatusEl.textContent = gameState.gameOverReason;
            subStatusEl.className = 'sub-status alert';
            return;
        }

        if (gameState.isThinking) {
            statusEl.textContent = `${colorName}'s Turn`;
            subStatusEl.innerHTML = `<span>Computer is thinking...</span>`;
            subStatusEl.className = 'sub-status thinking';
            return;
        }

        if (gameState.inCheckSquare) {
            statusEl.textContent = `${colorName}'s Turn`;
            subStatusEl.textContent = `Check! ${colorName} King is under attack!`;
            subStatusEl.className = 'sub-status alert';
            return;
        }

        statusEl.textContent = `${colorName}'s Turn`;
        subStatusEl.textContent = 'Game in progress';
        subStatusEl.className = 'sub-status';
    }

    function updateMoveHistory() {
        const tbody = document.getElementById('movesBody');
        const counter = document.getElementById('moveCounter');
        const wrapper = document.getElementById('movesWrapper');

        tbody.innerHTML = '';
        counter.textContent = `Move ${gameState.fullmoveNumber}`;

        const moves = gameState.history;
        for (let i = 0; i < moves.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1;
            const whiteMove = moves[i];
            const blackMove = moves[i + 1];

            const tr = document.createElement('tr');

            // Move Number
            const tdNum = document.createElement('td');
            tdNum.className = 'move-num';
            tdNum.textContent = `${moveNum}.`;
            tr.appendChild(tdNum);

            // White Move Cell
            const tdWhite = document.createElement('td');
            tdWhite.className = 'move-cell';
            tdWhite.textContent = whiteMove ? whiteMove.san : '';
            if (whiteMove) {
                if (gameState.viewHistoryIndex === i) tdWhite.classList.add('active-history-move');
                tdWhite.addEventListener('click', () => viewHistoryPosition(i));
            }
            tr.appendChild(tdWhite);

            // Black Move Cell
            const tdBlack = document.createElement('td');
            tdBlack.className = 'move-cell';
            tdBlack.textContent = blackMove ? blackMove.san : '';
            if (blackMove) {
                if (gameState.viewHistoryIndex === i + 1) tdBlack.classList.add('active-history-move');
                tdBlack.addEventListener('click', () => viewHistoryPosition(i + 1));
            }
            tr.appendChild(tdBlack);

            tbody.appendChild(tr);
        }

        // Autoscroll to bottom if viewing live game
        if (gameState.viewHistoryIndex === null) {
            wrapper.scrollTop = wrapper.scrollHeight;
        }
    }

    function viewHistoryPosition(index) {
        if (index < 0 || index >= gameState.history.length) return;
        gameState.viewHistoryIndex = index;
        const entry = gameState.history[index];

        gameState.lastMove = { from: { ...entry.from }, to: { ...entry.to } };
        gameState.selectedSquare = null;
        gameState.legalMovesForSelected = [];
        renderBoard();
        updateMoveHistory();
    }

    function renderCapturedPieces() {
        const topTray = document.getElementById('topCapturedTray');
        const bottomTray = document.getElementById('bottomCapturedTray');
        const topAdvantage = document.getElementById('topMaterialAdvantage');
        const bottomAdvantage = document.getElementById('bottomMaterialAdvantage');

        topTray.innerHTML = '';
        bottomTray.innerHTML = '';

        const whiteCaptures = gameState.captured.w; // black pieces taken by white
        const blackCaptures = gameState.captured.b; // white pieces taken by black

        const isWhiteBottom = !gameState.isFlipped;

        const bottomPlayerCaptures = isWhiteBottom ? whiteCaptures : blackCaptures;
        const topPlayerCaptures = isWhiteBottom ? blackCaptures : whiteCaptures;

        const bottomPiecePrefix = isWhiteBottom ? 'b' : 'w';
        const topPiecePrefix = isWhiteBottom ? 'w' : 'b';

        bottomPlayerCaptures.forEach(type => {
            const span = document.createElement('span');
            span.className = 'cap-piece';
            span.innerHTML = PIECE_SVGS[bottomPiecePrefix + type] || '';
            bottomTray.appendChild(span);
        });

        topPlayerCaptures.forEach(type => {
            const span = document.createElement('span');
            span.className = 'cap-piece';
            span.innerHTML = PIECE_SVGS[topPiecePrefix + type] || '';
            topTray.appendChild(span);
        });

        // Calculate material score difference
        let whiteScore = 0;
        let blackScore = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = gameState.board[r][c];
                if (p) {
                    if (p.color === 'w') whiteScore += PIECE_VALUES[p.type];
                    else blackScore += PIECE_VALUES[p.type];
                }
            }
        }

        const diff = (whiteScore - blackScore) / 100;

        if (diff > 0) {
            // White has advantage
            if (isWhiteBottom) {
                bottomAdvantage.textContent = `+${diff}`;
                bottomAdvantage.classList.add('visible');
                topAdvantage.classList.remove('visible');
            } else {
                topAdvantage.textContent = `+${diff}`;
                topAdvantage.classList.add('visible');
                bottomAdvantage.classList.remove('visible');
            }
        } else if (diff < 0) {
            // Black has advantage
            const absDiff = Math.abs(diff);
            if (isWhiteBottom) {
                topAdvantage.textContent = `+${absDiff}`;
                topAdvantage.classList.add('visible');
                bottomAdvantage.classList.remove('visible');
            } else {
                bottomAdvantage.textContent = `+${absDiff}`;
                bottomAdvantage.classList.add('visible');
                topAdvantage.classList.remove('visible');
            }
        } else {
            topAdvantage.classList.remove('visible');
            bottomAdvantage.classList.remove('visible');
        }
    }

    function updatePlayerBars() {
        const topName = document.getElementById('topPlayerName');
        const topTag = document.getElementById('topPlayerTag');
        const topAvatar = document.getElementById('topPlayerAvatar');

        const bottomName = document.getElementById('bottomPlayerName');
        const bottomTag = document.getElementById('bottomPlayerTag');
        const bottomAvatar = document.getElementById('bottomPlayerAvatar');

        if (!gameState.isFlipped) {
            // Standard perspective: White bottom, Black top
            if (gameState.gameMode === 'pve') {
                topName.textContent = 'Computer (AI)';
                topAvatar.textContent = '🤖';
            } else {
                topName.textContent = 'Player 2';
                topAvatar.textContent = '👤';
            }
            topTag.textContent = 'Black';

            bottomName.textContent = 'Player 1';
            bottomTag.textContent = 'White';
            bottomAvatar.textContent = '👤';
        } else {
            // Inverted perspective: White top, Black bottom
            if (gameState.gameMode === 'pve') {
                bottomName.textContent = 'Computer (AI)';
                bottomAvatar.textContent = '🤖';
            } else {
                bottomName.textContent = 'Player 2';
                bottomAvatar.textContent = '👤';
            }
            bottomTag.textContent = 'Black';

            topName.textContent = 'Player 1';
            topTag.textContent = 'White';
            topAvatar.textContent = '👤';
        }
    }

    /* ==========================================================================
       11. Game Over Modal
       ========================================================================== */

    function showGameOverModal(title, reason) {
        const modal = document.getElementById('gameOverModal');
        const titleEl = document.getElementById('gameOverTitle');
        const reasonEl = document.getElementById('gameOverReason');
        const iconEl = document.getElementById('gameOverIcon');

        titleEl.textContent = title;
        reasonEl.textContent = reason;
        iconEl.textContent = title.includes('Checkmate') ? '🏆' : '🤝';

        modal.classList.remove('hidden');
    }

    function hideGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        modal.classList.add('hidden');
    }

    /* ==========================================================================
       12. Event Listeners & Initialization
       ========================================================================== */

    function initEventListeners() {
        // Mode buttons
        const modeAiBtn = document.getElementById('modeAiBtn');
        const modePvpBtn = document.getElementById('modePvpBtn');
        const difficultyGroup = document.getElementById('difficultyGroup');

        modeAiBtn.addEventListener('click', () => {
            modeAiBtn.classList.add('active');
            modePvpBtn.classList.remove('active');
            difficultyGroup.classList.remove('hidden');
            gameState.gameMode = 'pve';
            updatePlayerBars();
            restartGame();
        });

        modePvpBtn.addEventListener('click', () => {
            modePvpBtn.classList.add('active');
            modeAiBtn.classList.remove('active');
            difficultyGroup.classList.add('hidden');
            gameState.gameMode = 'pvp';
            updatePlayerBars();
            restartGame();
        });

        // Difficulty buttons
        const diffButtons = document.querySelectorAll('.diff-btn');
        diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                diffButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.aiDifficulty = btn.dataset.diff;
            });
        });

        // Action controls
        document.getElementById('newGameBtn').addEventListener('click', restartGame);
        document.getElementById('restartBtn').addEventListener('click', restartGame);
        document.getElementById('undoBtn').addEventListener('click', undoMove);
        document.getElementById('redoBtn').addEventListener('click', redoMove);
        document.getElementById('flipBtn').addEventListener('click', flipBoard);

        // History stepping
        document.getElementById('stepStartBtn').addEventListener('click', () => {
            if (gameState.history.length > 0) viewHistoryPosition(0);
        });
        document.getElementById('stepBackBtn').addEventListener('click', () => {
            const current = gameState.viewHistoryIndex !== null ? gameState.viewHistoryIndex : gameState.history.length;
            if (current > 0) viewHistoryPosition(current - 1);
        });
        document.getElementById('stepForwardBtn').addEventListener('click', () => {
            if (gameState.viewHistoryIndex !== null) {
                if (gameState.viewHistoryIndex < gameState.history.length - 1) {
                    viewHistoryPosition(gameState.viewHistoryIndex + 1);
                } else {
                    gameState.viewHistoryIndex = null;
                    renderBoard();
                    updateMoveHistory();
                }
            }
        });
        document.getElementById('stepEndBtn').addEventListener('click', () => {
            gameState.viewHistoryIndex = null;
            renderBoard();
            updateMoveHistory();
        });

        // Sound toggle
        const soundBtn = document.getElementById('soundToggleBtn');
        const soundIcon = document.getElementById('soundIcon');
        soundBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
            if (soundEnabled) playSound('move');
        });

        // Game Over modal buttons
        document.getElementById('gameOverRestartBtn').addEventListener('click', () => {
            hideGameOverModal();
            restartGame();
        });
        document.getElementById('gameOverReviewBtn').addEventListener('click', () => {
            hideGameOverModal();
        });

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            // Undo: Ctrl+Z or Z
            if ((e.ctrlKey && e.key.toLowerCase() === 'z') || (!e.ctrlKey && e.key.toLowerCase() === 'z')) {
                if (!e.shiftKey) {
                    undoMove();
                }
            }
            // Redo: Ctrl+Y or Shift+Z
            if ((e.ctrlKey && e.key.toLowerCase() === 'y') || (e.shiftKey && e.key.toLowerCase() === 'z')) {
                redoMove();
            }
            // Flip: F
            if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
                flipBoard();
            }
            // Mute: M
            if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey) {
                soundBtn.click();
            }
        });

        // Mobile touch & click outside board deselect
        document.addEventListener('click', (e) => {
            if (!boardElement.contains(e.target) && !e.target.closest('.controls-card') && !e.target.closest('.promotion-modal')) {
                if (gameState.selectedSquare) {
                    gameState.selectedSquare = null;
                    gameState.legalMovesForSelected = [];
                    renderBoard();
                }
            }
        });
    }

    // Expose API for testing and external access
    window.chessGame = {
        gameState,
        makeMove,
        undoMove,
        redoMove,
        restartGame,
        flipBoard,
        getLegalMoves,
        isCheck,
        isCheckmate,
        isStalemate,
        isInsufficientMaterial,
        findBestMove,
        evaluateBoard,
        renderBoard,
        updateGameStatus,
        updateMoveHistory
    };

    // Initialize Game
    function init() {
        createBoard();
        initEventListeners();
        updateGameStatus();
        updatePlayerBars();
        renderCapturedPieces();
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
