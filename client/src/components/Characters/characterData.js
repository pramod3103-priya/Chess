/**
 * Parody Character Definitions & Strategic Dialogue Sets
 * ODI: "The Master Strategist"
 * RAHU: "The Unexpected Challenger"
 */

export const CHARACTERS = {
    odi: {
        id: 'odi',
        name: 'ODI',
        title: 'The Master Strategist',
        tagline: '56-inch grandmaster vision and visionary pawn structures.',
        description:
            'A legendary grandmaster of long-term planning, rock-solid central control, and inspirational diplomatic maneuvers. Unshakably calm under pressure.',
        defaultDifficulty: 'hard',
        accentColor: '#F59E0B',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        cardGradient: 'from-[#1E293B] via-[#1F2937] to-[#1E293B]',
        activeBorder: 'border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.25)]',
        avatarBg: 'bg-gradient-to-b from-amber-500/20 via-slate-800 to-slate-900',
        elo: {
            easy: 950,
            medium: 1550,
            hard: 2050
        },
        quotes: {
            start: [
                'Mitron, welcome to the grand arena! Every pawn has the potential to lead.',
                '56-inch grandmaster calculations are locked in. Let the game of minds begin!',
                'In chess as in national reform, vision and discipline decide the outcome. Make your move!',
                'From the 1st rank to the 8th rank — that is the journey of unwavering dedication.'
            ],
            thinking: [
                'Analyzing 140 crore potential countermoves across all 64 squares...',
                'Patience, my friend. Nation-building and chess both demand master planning.',
                'Calibrating our strategic supply lines and center control...',
                'Executing tactical diplomacy on the queenside...'
            ],
            move: [
                'A development move! Expanding our digital and tactical infrastructure.',
                'Strengthening our defense. Atmanirbhar pieces protect each other!',
                'Pawn structure consolidated. Step by step, victory is built.',
                'Controlling the central squares — governance begins at the center!'
            ],
            check: [
                'Kripya dhyan dein — that is CHECK! Masterstroke in motion!',
                'Direct accountability on your King! Defend your position, mitron!',
                'Alert! The diagonal is breached. Where will your majesty retreat?'
            ],
            win: [
                'VICTORY! The vision has succeeded. A masterstroke delivered on the board!',
                'Abki baar, checkmate sarkar! A splendid battle, mitron!',
                'Strategic discipline always prevails. Thank you for this historic contest!'
            ],
            loss: [
                "In democracy and chess, we respect the people's verdict! Well played, friend.",
                'A tactical pause, but our spirit remains undeterred. I look forward to our rematch!',
                'You played with exceptional foresight today. My heartiest congratulations!'
            ],
            opponentCheck: [
                'A bold check! But our defense is robust, disciplined, and unyielding.',
                'Check? No problem, mitron. We adapt and emerge even stronger!'
            ]
        }
    },
    rahu: {
        id: 'rahu',
        name: 'RAHU',
        title: 'The Unexpected Challenger',
        tagline: 'Energetic, philosophical, and opening the Mohabbat ki Dukaan!',
        description:
            'A passionate challenger who believes chess is a state of mind. Marches pawns forward like a yatra across the ranks, surprising opponents with unconventional moves.',
        defaultDifficulty: 'medium',
        accentColor: '#38BDF8',
        badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
        cardGradient: 'from-[#1E293B] via-[#1F2937] to-[#1E293B]',
        activeBorder: 'border-sky-500/80 shadow-[0_0_25px_rgba(56,189,248,0.25)]',
        avatarBg: 'bg-gradient-to-b from-sky-500/20 via-slate-800 to-slate-900',
        elo: {
            easy: 850,
            medium: 1400,
            hard: 1900
        },
        quotes: {
            start: [
                "Dosto! Chess is not just pieces, chess is a state of mind. Let's play with love!",
                'I have walked thousands of kilometers — now my knights are ready for the yatra!',
                'Open the Mohabbat ki Dukaan on the 64 squares! Let every move count.',
                'Listen to the voice of the pawns. Today, the common pieces will rise!'
            ],
            thinking: [
                'Wait, if the knight jumps right... what is the deeper systemic question here?',
                'Processing the youth energy into a dynamic counter-offensive...',
                'Thinking... thinking... Chess is like a machine, we need to understand the gears!',
                'Connecting with the grassroots pawns before making this decision...'
            ],
            move: [
                'Forward march! Every step brings us closer to transformation.',
                'Look at this bishop — complete freedom of movement on both flanks!',
                'Moving the rook! We are breaking monopolies on the open file.',
                'A bold move for the youth! Let us see how you respond.'
            ],
            check: [
                'CHECK! Dekha aapne? That is the power of the youth wing!',
                "Mohabbat ki Dukaan is now officially open on your King's file!",
                'Watch out! Direct question posed to the establishment king!'
            ],
            win: [
                'Maza aaya! The common pieces united and delivered CHECKMATE!',
                'Dosto, victory for the people! A historic moment on the board!',
                'Historic victory! When the grassroots organize, checkmate is inevitable!'
            ],
            loss: [
                'Khatam? Tata, bye-bye? Hey, we learn from every struggle and march forward!',
                'The board was challenging today, but the journey continues. Rematch soon!',
                'You played brilliantly, my friend. Spread love and let us play again!'
            ],
            opponentCheck: [
                'Whoa! A surprise check? The system is challenging us, but we stand firm with courage!',
                "Check? Don't worry, dosto, we will tackle this together!"
            ]
        }
    }
};

export const CHARACTER_LIST = [CHARACTERS.odi, CHARACTERS.rahu];

export function getRandomQuote(characterId, type = 'thinking') {
    const char = CHARACTERS[characterId] || CHARACTERS.odi;
    const quotes = char.quotes[type] || char.quotes.thinking || [];
    if (!quotes.length) return 'Making my move...';
    const idx = Math.floor(Math.random() * quotes.length);
    return quotes[idx];
}

