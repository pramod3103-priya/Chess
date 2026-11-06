import React from 'react';

/**
 * RAHU Avatar Component
 * Stylized parody illustration inspired by Rahul Gandhi's public persona.
 * Supports dynamic emotional states: 'idle' | 'thinking' | 'winning' | 'losing'
 */
export default function RahuAvatar({ state = 'idle', className = 'w-24 h-24', isThinking = false }) {
    const currentState = isThinking ? 'thinking' : state;

    return (
        <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
            <svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-xl transition-all duration-300"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Background Gradients */}
                    <radialGradient id="rahuBgGrad" cx="50%" cy="40%" r="55%">
                        <stop offset="0%" stopColor="#1E293B" />
                        <stop offset="100%" stopColor="#0F172A" />
                    </radialGradient>
                    <linearGradient id="rahuSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FED7AA" />
                        <stop offset="100%" stopColor="#FDBA74" />
                    </linearGradient>
                    <linearGradient id="rahuHair" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="50%" stopColor="#1E293B" />
                        <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>
                    <linearGradient id="rahuTee" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#F1F5F9" />
                    </linearGradient>
                </defs>

                {/* Base Avatar Circle */}
                <circle cx="100" cy="100" r="94" fill="url(#rahuBgGrad)" stroke="#475569" strokeWidth="4" />

                {/* Ambient Aura for Winning */}
                {currentState === 'winning' && (
                    <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                        className="animate-spin"
                        style={{ animationDuration: '14s' }}
                    />
                )}

                {/* Thinking Pulse Aura */}
                {currentState === 'thinking' && (
                    <circle
                        cx="100"
                        cy="100"
                        r="88"
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="2.5"
                        opacity="0.6"
                        className="animate-pulse"
                    />
                )}

                {/* Shoulders & Crisp White Kurta / Tee */}
                <g id="rahu-body">
                    {/* Shoulders */}
                    <path
                        d="M 36 200 C 44 165 65 148 100 148 C 135 148 156 165 164 200 Z"
                        fill="url(#rahuTee)"
                        stroke="#CBD5E1"
                        strokeWidth="1.5"
                    />
                    {/* Round Neck Collar */}
                    <path
                        d="M 80 148 C 84 162 116 162 120 148"
                        fill="none"
                        stroke="#94A3B8"
                        strokeWidth="2"
                    />
                    {/* Neck Shadow */}
                    <path d="M 86 138 Q 100 150 114 138 L 114 148 Q 100 156 86 148 Z" fill="#F97316" opacity="0.3" />
                </g>

                {/* Head Base */}
                <g id="rahu-head">
                    {/* Ears */}
                    <ellipse cx="56" cy="102" rx="7" ry="11" fill="url(#rahuSkin)" stroke="#EA580C" strokeWidth="1" />
                    <ellipse cx="144" cy="102" rx="7" ry="11" fill="url(#rahuSkin)" stroke="#EA580C" strokeWidth="1" />

                    {/* Face Silhouette */}
                    <path
                        d="M 64 88 C 64 60 76 48 100 48 C 124 48 136 60 136 88 C 136 122 126 140 100 142 C 74 140 64 122 64 88 Z"
                        fill="url(#rahuSkin)"
                    />

                    {/* Wavy Dark Hair */}
                    <path
                        d="M 58 84 C 54 50 72 34 100 34 C 128 34 146 50 142 84 C 146 70 144 56 136 46 C 125 36 112 34 98 34 C 80 34 68 40 62 52 C 56 64 56 74 58 84 Z"
                        fill="url(#rahuHair)"
                    />
                    {/* Front Hair Volume & Parting */}
                    <path
                        d="M 62 68 C 72 48 94 44 110 46 C 128 48 138 58 138 68 C 134 56 120 50 106 50 C 88 50 72 56 62 68 Z"
                        fill="#334155"
                    />
                    {/* Sideburns */}
                    <path d="M 62 76 L 64 96 L 68 96 L 68 76 Z" fill="#1E293B" />
                    <path d="M 138 76 L 136 96 L 132 96 L 132 76 Z" fill="#1E293B" />

                    {/* Eyebrows */}
                    {currentState === 'losing' ? (
                        // Surprised raised arches
                        <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none">
                            <path d="M 72 78 Q 82 72 92 78" />
                            <path d="M 108 78 Q 118 72 128 78" />
                        </g>
                    ) : currentState === 'thinking' ? (
                        // One arched high, one furrowed
                        <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none">
                            <path d="M 72 80 Q 82 74 92 82" />
                            <path d="M 108 83 Q 118 84 128 80" />
                        </g>
                    ) : (
                        // Friendly natural arch
                        <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none">
                            <path d="M 72 80 Q 82 76 92 80" />
                            <path d="M 108 80 Q 118 76 128 80" />
                        </g>
                    )}

                    {/* Eyes */}
                    {currentState === 'losing' ? (
                        // Wide round surprised eyes
                        <g>
                            <circle cx="82" cy="88" r="6" fill="#FFFFFF" stroke="#334155" strokeWidth="1.2" />
                            <circle cx="82" cy="88" r="2.8" fill="#0F172A" />
                            <circle cx="83.5" cy="86.5" r="1" fill="#FFFFFF" />
                            <circle cx="118" cy="88" r="6" fill="#FFFFFF" stroke="#334155" strokeWidth="1.2" />
                            <circle cx="118" cy="88" r="2.8" fill="#0F172A" />
                            <circle cx="119.5" cy="86.5" r="1" fill="#FFFFFF" />
                        </g>
                    ) : currentState === 'winning' ? (
                        // Excited smiling crinkle eyes
                        <g stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none">
                            <path d="M 76 89 Q 82 83 88 89" />
                            <path d="M 112 89 Q 118 83 124 89" />
                        </g>
                    ) : currentState === 'thinking' ? (
                        // Curious sideways glance
                        <g>
                            <ellipse cx="82" cy="88" rx="5.5" ry="4" fill="#FFFFFF" stroke="#334155" strokeWidth="1" />
                            <circle cx="84" cy="87" r="2.5" fill="#0F172A" />
                            <ellipse cx="118" cy="88" rx="5.5" ry="4" fill="#FFFFFF" stroke="#334155" strokeWidth="1" />
                            <circle cx="120" cy="87" r="2.5" fill="#0F172A" />
                        </g>
                    ) : (
                        // Warm friendly eyes
                        <g>
                            <ellipse cx="82" cy="88" rx="5.5" ry="4.5" fill="#FFFFFF" stroke="#334155" strokeWidth="1" />
                            <circle cx="82" cy="88" r="2.5" fill="#0F172A" />
                            <circle cx="83.5" cy="87" r="0.8" fill="#FFFFFF" />
                            <ellipse cx="118" cy="88" rx="5.5" ry="4.5" fill="#FFFFFF" stroke="#334155" strokeWidth="1" />
                            <circle cx="118" cy="88" r="2.5" fill="#0F172A" />
                            <circle cx="119.5" cy="87" r="0.8" fill="#FFFFFF" />
                        </g>
                    )}

                    {/* Straight Nose */}
                    <path
                        d="M 98 86 Q 100 102 96 106 Q 100 108 104 106"
                        fill="none"
                        stroke="#EA580C"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />

                    {/* Salt & Pepper Trimmed Stubble Beard */}
                    <g id="rahu-beard" opacity="0.65">
                        <path
                            d="M 68 106 C 68 126 78 138 100 138 C 122 138 132 126 132 106 C 130 114 124 126 100 126 C 76 126 70 114 68 106 Z"
                            fill="#334155"
                        />
                        {/* Trimmed mustache */}
                        <path
                            d="M 85 111 Q 100 110 100 114 Q 100 110 115 111 Q 107 117 100 116 Q 93 117 85 111 Z"
                            fill="#334155"
                        />
                    </g>

                    {/* Mouth & Expression */}
                    {currentState === 'winning' ? (
                        // Big toothy joyful grin
                        <g>
                            <path d="M 86 116 Q 100 130 114 116 Z" fill="#FFFFFF" stroke="#B91C1C" strokeWidth="1.5" />
                            {/* Dimples */}
                            <path d="M 80 118 Q 82 122 81 125" stroke="#EA580C" strokeWidth="1.5" fill="none" />
                            <path d="M 120 118 Q 118 122 119 125" stroke="#EA580C" strokeWidth="1.5" fill="none" />
                        </g>
                    ) : currentState === 'losing' ? (
                        // Open 'O' shock mouth
                        <ellipse cx="100" cy="120" rx="6" ry="7" fill="#7F1D1D" stroke="#991B1B" strokeWidth="1.5" />
                    ) : currentState === 'thinking' ? (
                        // Pensive slight pout / smile
                        <path d="M 90 118 Q 102 117 110 119" stroke="#991B1B" strokeWidth="2" fill="none" strokeLinecap="round" />
                    ) : (
                        // Friendly warm smile
                        <g>
                            <path d="M 88 116 Q 100 125 112 116" stroke="#B91C1C" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                            {/* Signature Dimple */}
                            <path d="M 82 117 Q 83 120 82 123" stroke="#EA580C" strokeWidth="1.2" fill="none" />
                            <path d="M 118 117 Q 117 120 118 123" stroke="#EA580C" strokeWidth="1.2" fill="none" />
                        </g>
                    )}
                </g>

                {/* State-specific Accents */}
                {currentState === 'thinking' && (
                    <g transform="translate(142, 45)" className="animate-bounce">
                        {/* Lightbulb / Thought bubble */}
                        <circle cx="0" cy="0" r="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                        <text x="0" y="5" textAnchor="middle" fill="#38BDF8" fontSize="13" fontWeight="bold">?</text>
                    </g>
                )}

                {currentState === 'winning' && (
                    <g transform="translate(148, 48)">
                        {/* Heart / Mohabbat symbol */}
                        <path
                            d="M 0 -2 C -5 -8 -11 0 0 9 C 11 0 5 -8 0 -2 Z"
                            fill="#EF4444"
                            className="animate-pulse"
                        />
                    </g>
                )}

                {currentState === 'losing' && (
                    <g transform="translate(142, 60)">
                        {/* Surprise sweat drop */}
                        <path d="M 0 0 C 4 6 5 10 0 13 C -5 10 -4 6 0 0 Z" fill="#38BDF8" opacity="0.85" />
                    </g>
                )}
            </svg>
        </div>
    );
}

