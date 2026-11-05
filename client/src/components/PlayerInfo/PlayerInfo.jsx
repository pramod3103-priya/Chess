import React from 'react';
import GameTimer from '../GameTimer/GameTimer';
import CapturedTray from './CapturedTray';

export default function PlayerInfo({
    player,
    color = 'w',
    isActive = false,
    timerSeconds = 600,
    capturedPieces = [],
    advantage = 0
}) {
    const isWhite = color === 'w';
    const displayName = player?.name || (isWhite ? 'White Player' : 'Black Player');
    const rating = player?.rating || 1200;
    const isConnected = player?.connected !== false;

    return (
        <div className="flex items-center justify-between w-full max-w-[620px] px-3 py-2 bg-[#273244] rounded-2xl border border-[#4B5563] shadow-md">
            {/* Player details */}
            <div className="flex items-center gap-3">
                {/* Avatar with piece indicator circle */}
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#4B5563] flex items-center justify-center font-bold text-[#F9FAFB] shadow-md">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    {/* Color chip */}
                    <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#273244] shadow ${
                            isWhite ? 'bg-white' : 'bg-[#1F2937] border-gray-400'
                        }`}
                        title={isWhite ? 'Playing White' : 'Playing Black'}
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm md:text-base text-[#F9FAFB] truncate max-w-[150px] md:max-w-[200px]">
                            {displayName}
                        </span>
                        <span className="text-xs font-mono font-medium text-[#D1D5DB] bg-[#1F2937] border border-[#4B5563] px-1.5 py-0.5 rounded">
                            {rating}
                        </span>
                        {/* Connected status dot */}
                        <div
                            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#9CA3AF]' : 'bg-red-500 animate-ping'}`}
                            title={isConnected ? 'Connected' : 'Disconnected'}
                        />
                    </div>
                    <CapturedTray
                        pieces={capturedPieces}
                        advantage={advantage}
                        color={isWhite ? 'b' : 'w'} // pieces captured by White are Black pieces
                    />
                </div>
            </div>

            {/* Clock Timer */}
            <GameTimer seconds={timerSeconds} isActive={isActive} />
        </div>
    );
}
