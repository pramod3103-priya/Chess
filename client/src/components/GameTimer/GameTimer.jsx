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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-lg md:text-xl transition-all border ${
                isActive
                    ? isLowTime
                        ? 'bg-red-500/20 text-red-400 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                        : 'bg-[#374151] text-[#F9FAFB] border-[#D1D5DB] shadow-[0_0_12px_rgba(255,255,255,0.12)]'
                    : 'bg-[#1F2937] text-[#9CA3AF] border-[#4B5563]'
            }`}
        >
            <Clock className={`w-4 h-4 ${isActive ? (isLowTime ? 'text-red-400 animate-spin' : 'text-[#F9FAFB]') : 'text-[#9CA3AF]'}`} />
            <span>{formatTime(seconds)}</span>
        </div>
    );
}
