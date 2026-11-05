import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Key, LogIn, Swords, Shield, Zap, Trophy, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between bg-[#111827]">
            {/* Hero Main */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto">
                {/* ♟ ONLINE CHESS */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#273244] border border-[#4B5563] text-[#D1D5DB] text-xs font-black tracking-widest uppercase mb-6 shadow-sm">
                    <span className="text-lg leading-none text-white">♟</span>
                    <span>ONLINE CHESS ARENA</span>
                </div>

                {/* Play Chess Online */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#F9FAFB] tracking-tight leading-tight mb-4">
                    Play Chess Online
                </h1>

                <p className="text-[#9CA3AF] text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
                    Real-time multiplayer chess with instant room codes, authoritative FIDE rules, live clocks, and Elo rating tracking.
                </p>

                {/* Main Action Buttons: [ Create Game ] [ Join Game ] [ Login ] */}
                <div className="w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
                    <Link
                        to="/create-game"
                        className="w-full sm:flex-1 py-4 px-6 bg-[#374151] hover:bg-[#4B5563] text-[#F9FAFB] border border-[#4B5563] font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-black/40 transition transform hover:-translate-y-0.5 text-base"
                    >
                        <PlusCircle className="w-5 h-5 text-[#D1D5DB]" />
                        <span>Create Game</span>
                    </Link>

                    <Link
                        to="/join-game"
                        className="w-full sm:flex-1 py-4 px-6 bg-[#273244] hover:bg-[#374151] text-[#F9FAFB] border border-[#4B5563] font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-black/30 transition transform hover:-translate-y-0.5 text-base"
                    >
                        <Key className="w-5 h-5 text-[#D1D5DB]" />
                        <span>Join Game</span>
                    </Link>

                    {!isAuthenticated ? (
                        <Link
                            to="/login"
                            className="w-full sm:w-auto py-4 px-6 bg-[#1F2937] hover:bg-[#273244] text-[#D1D5DB] hover:text-white border border-[#4B5563] font-bold rounded-2xl flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 shadow-lg text-base"
                        >
                            <LogIn className="w-5 h-5 text-[#9CA3AF]" />
                            <span>Login</span>
                        </Link>
                    ) : (
                        <Link
                            to="/profile"
                            className="w-full sm:w-auto py-4 px-6 bg-[#1F2937] hover:bg-[#273244] text-[#F9FAFB] border border-[#4B5563] font-bold rounded-2xl flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 shadow-lg text-base"
                        >
                            <User className="w-5 h-5 text-[#D1D5DB]" />
                            <span>Profile</span>
                        </Link>
                    )}
                </div>

                {/* Additional Lobby Quick-Link */}
                <Link
                    to="/lobby"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#F9FAFB] transition"
                >
                    <Swords className="w-4 h-4 text-[#9CA3AF]" />
                    <span>Browse public arena lobby & rankings &rarr;</span>
                </Link>
            </main>

            {/* Feature Highlights Grid */}
            <section className="border-t border-[#4B5563] bg-[#1F2937] py-12">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-[#273244] border border-[#4B5563] flex flex-col items-center sm:items-start text-center sm:text-left shadow-lg">
                        <div className="w-11 h-11 rounded-xl bg-[#374151] border border-[#4B5563] flex items-center justify-center mb-4">
                            <Shield className="w-5 h-5 text-[#D1D5DB]" />
                        </div>
                        <h3 className="text-base font-bold text-[#F9FAFB] mb-1.5">Authoritative chess.js Rules</h3>
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">
                            Check, checkmate, stalemate, castling, en passant, and pawn promotion verified on the server.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#273244] border border-[#4B5563] flex flex-col items-center sm:items-start text-center sm:text-left shadow-lg">
                        <div className="w-11 h-11 rounded-xl bg-[#374151] border border-[#4B5563] flex items-center justify-center mb-4">
                            <Zap className="w-5 h-5 text-[#D1D5DB]" />
                        </div>
                        <h3 className="text-base font-bold text-[#F9FAFB] mb-1.5">Real-Time WebSockets</h3>
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">
                            Move broadcast, authoritative timers, draw offers, resignations, and instant board state sync.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#273244] border border-[#4B5563] flex flex-col items-center sm:items-start text-center sm:text-left shadow-lg">
                        <div className="w-11 h-11 rounded-xl bg-[#374151] border border-[#4B5563] flex items-center justify-center mb-4">
                            <Trophy className="w-5 h-5 text-[#D1D5DB]" />
                        </div>
                        <h3 className="text-base font-bold text-[#F9FAFB] mb-1.5">Elo Ratings & History</h3>
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">
                            Standard FIDE Elo calculation updates your rating on every win, draw, and loss in MongoDB.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
