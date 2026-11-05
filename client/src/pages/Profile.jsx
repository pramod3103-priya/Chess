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
        <div className="max-w-4xl mx-auto px-4 py-10 bg-[#111827]">
            {/* Profile Header */}
            <div className="bg-[#273244] border border-[#4B5563] rounded-2xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#374151] to-[#64748B] p-1 shadow-lg shadow-black/40">
                    <div className="w-full h-full bg-[#111827] rounded-[14px] flex items-center justify-center text-4xl font-extrabold text-[#F9FAFB]">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <h1 className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight">
                            {user?.username || 'Guest Player'}
                        </h1>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#374151] border border-[#4B5563] text-[#F9FAFB]">
                            Elo: {user?.rating || 1200}
                        </span>
                    </div>

                    <p className="text-sm text-[#9CA3AF] mb-4">{user?.email}</p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#9CA3AF]">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                            <span>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#273244] border border-[#4B5563] rounded-2xl p-4 text-center shadow">
                    <div className="text-xs uppercase font-semibold text-[#9CA3AF] mb-1">Rating</div>
                    <div className="text-2xl font-mono font-black text-[#F9FAFB]">{user?.rating || 1200}</div>
                </div>
                <div className="bg-[#273244] border border-[#4B5563] rounded-2xl p-4 text-center shadow">
                    <div className="text-xs uppercase font-semibold text-[#9CA3AF] mb-1">Win Rate</div>
                    <div className="text-2xl font-mono font-black text-[#D1D5DB]">{winRate}%</div>
                </div>
                <div className="bg-[#273244] border border-[#4B5563] rounded-2xl p-4 text-center shadow">
                    <div className="text-xs uppercase font-semibold text-[#9CA3AF] mb-1">Victories</div>
                    <div className="text-2xl font-mono font-black text-[#F9FAFB]">{wins}</div>
                </div>
                <div className="bg-[#273244] border border-[#4B5563] rounded-2xl p-4 text-center shadow">
                    <div className="text-xs uppercase font-semibold text-[#9CA3AF] mb-1">Total Matches</div>
                    <div className="text-2xl font-mono font-black text-[#9CA3AF]">{totalGames}</div>
                </div>
            </div>

            {/* Win/Loss/Draw Bar */}
            <div className="bg-[#273244] border border-[#4B5563] rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-[#F9FAFB] mb-4">Match Record Breakdown</h3>
                <div className="w-full h-4 bg-[#1F2937] rounded-full overflow-hidden flex mb-4 border border-[#4B5563]">
                    {totalGames > 0 ? (
                        <>
                            <div
                                style={{ width: `${(wins / totalGames) * 100}%` }}
                                className="bg-[#D1D5DB] h-full"
                                title={`Wins: ${wins}`}
                            />
                            <div
                                style={{ width: `${(draws / totalGames) * 100}%` }}
                                className="bg-[#64748B] h-full"
                                title={`Draws: ${draws}`}
                            />
                            <div
                                style={{ width: `${(losses / totalGames) * 100}%` }}
                                className="bg-[#374151] h-full"
                                title={`Losses: ${losses}`}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full bg-[#374151]" />
                    )}
                </div>

                <div className="flex items-center justify-around text-xs font-semibold">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#D1D5DB]" />
                        <span className="text-[#D1D5DB]">Won: {wins}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#64748B]" />
                        <span className="text-[#D1D5DB]">Drawn: {draws}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#374151] border border-gray-500" />
                        <span className="text-[#D1D5DB]">Lost: {losses}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
