import React from 'react';
import { Clock } from 'lucide-react';

export default function GameTimer({ seconds = 600, isActive = false }) {
    const isLowTime = seconds <= 30;

    const formatTime = (totalSecs) => {
        const s = Math.max(0, Math.floor(totalSecs));
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono font-bold text-lg md:text-xl transition-all border ${
                isActive
                    ? isLowTime
                        ? 'bg-red-500/20 text-red-400 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-[#1a1c20] text-gray-400 border-[#2e323b]'
            }`}
        >
            <Clock className={`w-4 h-4 ${isActive ? (isLowTime ? 'text-red-400 animate-spin' : 'text-emerald-400') : 'text-gray-500'}`} />
            <span>{formatTime(seconds)}</span>
        </div>
    );
}

