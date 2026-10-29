import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Trophy, Flame, Shield, Award, Calendar } from 'lucide-react';
import api from '../services/api';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        refreshUser();
    }, []);

    const totalGames = user?.gamesPlayed || 0;
    const wins = user?.gamesWon || 0;
    const losses = user?.gamesLost || 0;
    const draws = user?.gamesDrawn || 0;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            {/* Profile Header */}
            <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-1 shadow-lg shadow-emerald-500/20">
                    <div className="w-full h-full bg-[#181a1d] rounded-[14px] flex items-center justify-center text-4xl font-extrabold text-emerald-400">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            {user?.username || 'Guest Player'}
                        </h1>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            Elo: {user?.rating || 1200}
                        </span>
                    </div>

                    <p className="text-sm text-gray-400 mb-4">{user?.email}</p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-4 text-center shadow">
                    <div className="text-xs uppercase font-semibold text-gray-400 mb-1">Rating</div>
                    <div className="text-2xl font-mono font-black text-emerald-400">{user?.rating || 1200}</div>
                </div>
                <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-4 text-center shadow">
                    <div className="text-xs uppercase font-semibold text-gray-400 mb-1">Win Rate</div>
                    <div className="text-2xl font-mono font-black text-amber-400">{winRate}%</div>
                </div>
                <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-4 text-center shadow">
                    <div className="text-xs uppercase font-semibold text-gray-400 mb-1">Victories</div>
                    <div className="text-2xl font-mono font-black text-emerald-400">{wins}</div>
                </div>
                <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-4 text-center shadow">
                    <div className="text-xs uppercase font-semibold text-gray-400 mb-1">Total Matches</div>
                    <div className="text-2xl font-mono font-black text-gray-200">{totalGames}</div>
                </div>
            </div>

            {/* Win/Loss/Draw Bar */}
            <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4">Match Record Breakdown</h3>
                <div className="w-full h-4 bg-[#26292f] rounded-full overflow-hidden flex mb-4">
                    {totalGames > 0 ? (
                        <>
                            <div
                                style={{ width: `${(wins / totalGames) * 100}%` }}
                                className="bg-emerald-500 h-full"
                                title={`Wins: ${wins}`}
                            />
                            <div
                                style={{ width: `${(draws / totalGames) * 100}%` }}
                                className="bg-amber-500 h-full"
                                title={`Draws: ${draws}`}
                            />
                            <div
                                style={{ width: `${(losses / totalGames) * 100}%` }}
                                className="bg-red-500 h-full"
                                title={`Losses: ${losses}`}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gray-700" />
                    )}
                </div>

                <div className="flex items-center justify-around text-xs font-semibold">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-500" />
                        <span className="text-gray-300">Won: {wins}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-amber-500" />
                        <span className="text-gray-300">Drawn: {draws}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500" />
                        <span className="text-gray-300">Lost: {losses}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

