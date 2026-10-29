import React from 'react';
import GameTimer from '../GameTimer/GameTimer';
import CapturedTray from './CapturedTray';
import { User } from 'lucide-react';

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
        <div className="flex items-center justify-between w-full max-w-[620px] px-2 py-1.5 bg-[#1e2024]/80 backdrop-blur rounded-xl border border-[#2e323b]/60">
            {/* Player details */}
            <div className="flex items-center gap-3">
                {/* Avatar with piece indicator circle */}
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-[#26292f] border border-[#3a3f4b] flex items-center justify-center font-bold text-gray-200 shadow-md">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    {/* Color chip */}
                    <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1e2024] shadow ${
                            isWhite ? 'bg-white' : 'bg-[#2b2b2b]'
                        }`}
                        title={isWhite ? 'Playing White' : 'Playing Black'}
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm md:text-base text-gray-100 truncate max-w-[150px] md:max-w-[200px]">
                            {displayName}
                        </span>
                        <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {rating}
                        </span>
                        {/* Connected status dot */}
                        <div
                            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-500 animate-ping'}`}
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

