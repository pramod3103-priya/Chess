import React from 'react';

/**
 * ODI Avatar Component
 * Stylized parody illustration inspired by Narendra Modi's public persona.
 * Supports dynamic emotional states: 'idle' | 'thinking' | 'winning' | 'losing'
 */
export default function OdiAvatar({ state = 'idle', className = 'w-24 h-24', isThinking = false }) {
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
                    <radialGradient id="odiBgGrad" cx="50%" cy="40%" r="55%">
                        <stop offset="0%" stopColor="#2D3748" />
                        <stop offset="100%" stopColor="#1A202C" />
                    </radialGradient>
                    <linearGradient id="odiSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FBD38D" />
                        <stop offset="100%" stopColor="#ED8936" />
                    </linearGradient>
                    <linearGradient id="odiHair" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="60%" stopColor="#E2E8F0" />
                        <stop offset="100%" stopColor="#CBD5E0" />
                    </linearGradient>
                    <linearGradient id="odiJacket" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1E3A8A" />
                        <stop offset="100%" stopColor="#0F172A" />
                    </linearGradient>
                    <linearGradient id="odiKurta" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FEF3C7" />
                        <stop offset="100%" stopColor="#FDE68A" />
                    </linearGradient>
                    <filter id="odiGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.4" />
                    </filter>
                </defs>

                {/* Base Avatar Circle */}
                <circle cx="100" cy="100" r="94" fill="url(#odiBgGrad)" stroke="#4A5568" strokeWidth="4" />

                {/* Ambient Aura for Winning */}
                {currentState === 'winning' && (
                    <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="#F59E0B"
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
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                        opacity="0.6"
                        className="animate-pulse"
                    />
                )}

                {/* Shoulders & Traditional Kurta + Modi Jacket */}
                <g id="odi-body">
                    {/* Inner Kurta Collar */}
                    <path d="M 68 152 Q 100 170 132 152 L 138 200 L 62 200 Z" fill="url(#odiKurta)" />
                    {/* Nehru/Modi Jacket Outer */}
                    <path
                        d="M 40 196 L 46 160 Q 65 148 85 146 L 85 200 L 40 200 Z"
                        fill="url(#odiJacket)"
                        stroke="#1E293B"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M 160 196 L 154 160 Q 135 148 115 146 L 115 200 L 160 200 Z"
                        fill="url(#odiJacket)"
                        stroke="#1E293B"
                        strokeWidth="1.5"
                    />
                    {/* Mandarin Collar */}
                    <path
                        d="M 78 144 C 78 138 122 138 122 144 L 126 156 C 126 156 100 162 74 156 Z"
                        fill="#1E3A8A"
                        stroke="#0F172A"
                        strokeWidth="1.5"
                    />
                    {/* Buttons on Jacket */}
                    <circle cx="100" cy="168" r="2.2" fill="#F59E0B" />
                    <circle cx="100" cy="182" r="2.2" fill="#F59E0B" />
                    <circle cx="100" cy="195" r="2.2" fill="#F59E0B" />

                    {/* Pocket with Saffron / White Square */}
                    <rect x="122" y="165" width="18" height="1.8" rx="0.9" fill="#F59E0B" />
                    <polygon points="126,165 130,157 134,165" fill="#FFFFFF" />
                </g>

                {/* Head Base */}
                <g id="odi-head">
                    {/* Ears */}
                    <ellipse cx="58" cy="100" rx="7" ry="11" fill="url(#odiSkin)" stroke="#DD6B20" strokeWidth="1" />
                    <ellipse cx="142" cy="100" rx="7" ry="11" fill="url(#odiSkin)" stroke="#DD6B20" strokeWidth="1" />

                    {/* Face Silhouette */}
                    <ellipse cx="100" cy="98" rx="42" ry="46" fill="url(#odiSkin)" />

                    {/* Back Hair Volume */}
                    <path
                        d="M 58 92 C 54 62 74 42 100 42 C 126 42 146 62 142 92 C 146 80 148 68 140 54 C 130 40 115 36 100 36 C 85 36 70 40 60 54 C 52 68 54 80 58 92 Z"
                        fill="url(#odiHair)"
                    />

                    {/* White Brushed Hair on Top & Temples */}
                    <path
                        d="M 64 74 C 70 54 88 48 100 48 C 112 48 130 54 136 74 C 132 64 120 54 100 54 C 80 54 68 64 64 74 Z"
                        fill="#FFFFFF"
                    />
                    <path
                        d="M 58 76 C 60 90 62 102 62 108 C 64 104 65 92 68 84 Z"
                        fill="url(#odiHair)"
                    />
                    <path
                        d="M 142 76 C 140 90 138 102 138 108 C 136 104 135 92 132 84 Z"
                        fill="url(#odiHair)"
                    />

                    {/* Eyebrows */}
                    {currentState === 'losing' ? (
                        // Steely, determined angled eyebrows
                        <g stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none">
                            <line x1="74" y1="83" x2="92" y2="87" />
                            <line x1="126" y1="83" x2="108" y2="87" />
                        </g>
                    ) : currentState === 'thinking' ? (
                        // One arched, one focused
                        <g stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none">
                            <path d="M 74 84 Q 84 79 92 84" />
                            <path d="M 108 85 Q 116 87 126 84" />
                        </g>
                    ) : (
                        // Dignified, calm arch
                        <g stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none">
                            <path d="M 74 83 Q 84 80 92 84" />
                            <path d="M 108 84 Q 116 80 126 83" />
                        </g>
                    )}

                    {/* Eyes */}
                    {currentState === 'winning' ? (
                        // Joyful crinkled eyes
                        <g stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" fill="none">
                            <path d="M 76 93 Q 84 88 90 93" />
                            <path d="M 110 93 Q 116 88 124 93" />
                        </g>
                    ) : currentState === 'thinking' ? (
                        // Narrowed sharp eyes
                        <g>
                            <ellipse cx="83" cy="92" rx="5" ry="3.5" fill="#FFFFFF" stroke="#4A5568" strokeWidth="1" />
                            <circle cx="85" cy="92" r="2.2" fill="#1A202C" />
                            <ellipse cx="117" cy="92" rx="5" ry="3.5" fill="#FFFFFF" stroke="#4A5568" strokeWidth="1" />
                            <circle cx="115" cy="92" r="2.2" fill="#1A202C" />
                        </g>
                    ) : (
                        // Normal focused eyes
                        <g>
                            <ellipse cx="83" cy="93" rx="5.5" ry="4" fill="#FFFFFF" stroke="#4A5568" strokeWidth="1" />
                            <circle cx="84" cy="93" r="2.5" fill="#1A202C" />
                            <circle cx="85" cy="92" r="0.8" fill="#FFFFFF" />
                            <ellipse cx="117" cy="93" rx="5.5" ry="4" fill="#FFFFFF" stroke="#4A5568" strokeWidth="1" />
                            <circle cx="116" cy="93" r="2.5" fill="#1A202C" />
                            <circle cx="117" cy="92" r="0.8" fill="#FFFFFF" />
                        </g>
                    )}

                    {/* Iconic Wire/Rimless Spectacles */}
                    <g stroke="#CBD5E0" strokeWidth="1.8" fill="rgba(255,255,255,0.18)">
                        {/* Left Lens */}
                        <rect x="73" y="86" width="22" height="16" rx="4" />
                        {/* Right Lens */}
                        <rect x="105" y="86" width="22" height="16" rx="4" />
                        {/* Bridge */}
                        <line x1="95" y1="92" x2="105" y2="92" stroke="#A0AEC0" strokeWidth="2" />
                        {/* Frames to ears */}
                        <line x1="73" y1="91" x2="60" y2="93" stroke="#A0AEC0" strokeWidth="1.5" />
                        <line x1="127" y1="91" x2="140" y2="93" stroke="#A0AEC0" strokeWidth="1.5" />
                        {/* Glass Glint */}
                        <line x1="77" y1="88" x2="81" y2="92" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.8" />
                        <line x1="109" y1="88" x2="113" y2="92" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.8" />
                    </g>

                    {/* Nose */}
                    <path
                        d="M 97 93 Q 100 106 96 109 Q 100 111 104 109 Q 100 106 103 93"
                        fill="none"
                        stroke="#C05621"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />

                    {/* White Beard & Mustache Covering Lower Face */}
                    <g id="odi-beard">
                        {/* Full Beard Base Contour */}
                        <path
                            d="M 64 104 C 64 135 78 152 100 152 C 122 152 136 135 136 104 C 132 118 124 136 100 136 C 76 136 68 118 64 104 Z"
                            fill="url(#odiHair)"
                            stroke="#E2E8F0"
                            strokeWidth="1"
                        />
                        {/* Mustache */}
                        <path
                            d="M 82 115 Q 100 114 100 120 Q 100 114 118 115 Q 108 124 100 123 Q 92 124 82 115 Z"
                            fill="#FFFFFF"
                            stroke="#CBD5E0"
                            strokeWidth="1"
                        />
                        {/* Subtle Smile / Lip under Mustache */}
                        {currentState === 'winning' ? (
                            <path d="M 94 125 Q 100 129 106 125" stroke="#E53E3E" strokeWidth="2" fill="none" strokeLinecap="round" />
                        ) : currentState === 'losing' ? (
                            <path d="M 94 127 Q 100 125 106 127" stroke="#9B2C2C" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                        ) : (
                            <path d="M 94 126 Q 100 128 106 126" stroke="#C53030" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                        )}
                        {/* Beard Texture Strokes */}
                        <path d="M 78 128 Q 86 142 98 148" stroke="#E2E8F0" strokeWidth="1" fill="none" opacity="0.6" />
                        <path d="M 122 128 Q 114 142 102 148" stroke="#E2E8F0" strokeWidth="1" fill="none" opacity="0.6" />
                        <path d="M 100 134 L 100 150" stroke="#E2E8F0" strokeWidth="1" fill="none" opacity="0.6" />
                    </g>
                </g>

                {/* State-specific Accents */}
                {currentState === 'thinking' && (
                    <g transform="translate(142, 45)" className="animate-bounce">
                        <circle cx="0" cy="0" r="14" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                        <circle cx="-5" cy="0" r="2.2" fill="#F59E0B" />
                        <circle cx="0" cy="0" r="2.2" fill="#F59E0B" />
                        <circle cx="5" cy="0" r="2.2" fill="#F59E0B" />
                    </g>
                )}

                {currentState === 'winning' && (
                    <g transform="translate(150, 48)">
                        {/* Trophy / Star Sparkle */}
                        <path
                            d="M 0 -10 L 3 -3 L 10 0 L 3 3 L 0 10 L -3 3 L -10 0 L -3 -3 Z"
                            fill="#F59E0B"
                            className="animate-pulse"
                        />
                    </g>
                )}

                {currentState === 'losing' && (
                    <g transform="translate(142, 60)">
                        {/* Blue Sweat Drop */}
                        <path d="M 0 0 C 4 6 5 10 0 13 C -5 10 -4 6 0 0 Z" fill="#38BDF8" opacity="0.85" />
                    </g>
                )}
            </svg>
        </div>
    );
}

