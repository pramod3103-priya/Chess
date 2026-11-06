import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function SpeechBubble({
    characterName = 'ODI',
    accentColor = '#F59E0B',
    message = '',
    isThinking = false
}) {
    if (!message) return null;

    return (
        <div className="relative w-full max-w-xl mx-auto my-2 animate-fadeIn">
            {/* Speech bubble card */}
            <div
                className="relative rounded-2xl px-4 py-3 bg-[#1F2937] border shadow-xl flex items-start gap-3 transition-all duration-300"
                style={{
                    borderColor: `${accentColor}55`,
                    boxShadow: `0 8px 24px -4px rgba(0,0,0,0.5), 0 0 16px -2px ${accentColor}22`
                }}
            >
                {/* Pointer arrow pointing up towards the opponent banner */}
                <div
                    className="absolute -top-2 left-10 w-4 h-4 bg-[#1F2937] rotate-45 border-t border-l"
                    style={{ borderColor: `${accentColor}55` }}
                />

                {/* Speaker indicator */}
                <div
                    className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-inner"
                    style={{
                        backgroundColor: `${accentColor}22`,
                        color: accentColor,
                        border: `1px solid ${accentColor}44`
                    }}
                >
                    {isThinking ? (
                        <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                    ) : (
                        <MessageSquare className="w-4 h-4" />
                    )}
                </div>

                {/* Message body */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-black tracking-wider uppercase" style={{ color: accentColor }}>
                            {characterName}
                        </span>
                        {isThinking && (
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#9CA3AF] animate-pulse">
                                Calculating move...
                            </span>
                        )}
                    </div>
                    <p className="text-sm font-medium text-[#F9FAFB] leading-snug italic">
                        &ldquo;{message}&rdquo;
                    </p>
                </div>
            </div>
        </div>
    );
}

