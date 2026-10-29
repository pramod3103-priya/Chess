import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Key, LogIn, Swords, Shield, Zap, Trophy, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between">
            {/* Hero Main */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center max-w-4xl mx-auto">
                {/* ♟ ONLINE CHESS */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-black tracking-widest uppercase mb-6 shadow-sm">
                    <span className="text-xl leading-none">♟</span>
                    <span>ONLINE CHESS</span>
                </div>

                {/* Play Chess Online */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-4">
                    Play Chess Online
                </h1>

                <p className="text-gray-400 text-base sm:text-lg max-w-xl mb-10">
                    Real-time multiplayer chess with instant room codes, authoritative FIDE rules, live clocks, and Elo rating tracking.
                </p>

                {/* Main Action Buttons: [ Create Game ] [ Join Game ] [ Login ] */}
                <div className="w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
                    <Link
                        to="/create-game"
                        className="w-full sm:flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-0.5 text-base"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span>Create Game</span>
                    </Link>

                    <Link
                        to="/join-game"
                        className="w-full sm:flex-1 py-4 px-6 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-xl shadow-amber-600/25 transition transform hover:-translate-y-0.5 text-base"
                    >
                        <Key className="w-5 h-5" />
                        <span>Join Game</span>
                    </Link>

                    {!isAuthenticated ? (
                        <Link
                            to="/login"
                            className="w-full sm:w-auto py-4 px-6 bg-[#1e2024] hover:bg-[#26292f] text-gray-200 border border-[#2e323b] hover:border-[#3a3f4b] font-bold rounded-2xl flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 shadow-lg text-base"
                        >
                            <LogIn className="w-5 h-5 text-emerald-400" />
                            <span>Login</span>
                        </Link>
                    ) : (
                        <Link
                            to="/profile"
                            className="w-full sm:w-auto py-4 px-6 bg-[#1e2024] hover:bg-[#26292f] text-emerald-400 border border-[#2e323b] hover:border-emerald-500/40 font-bold rounded-2xl flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 shadow-lg text-base"
                        >
                            <User className="w-5 h-5" />
                            <span>Profile</span>
                        </Link>
                    )}
                </div>

                {/* Additional Lobby Quick-Link */}
                <Link
                    to="/lobby"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-emerald-400 transition"
                >
                    <Swords className="w-4 h-4 text-emerald-400" />
                    <span>Or browse public arena lobby & rankings &rarr;</span>
                </Link>
            </main>

            {/* Feature Highlights Grid */}
            <section className="border-t border-[#2e323b] bg-[#181a1d]/60 py-10">
                <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-2xl bg-[#1e2024] border border-[#2e323b] flex flex-col items-center sm:items-start text-center sm:text-left shadow-md">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                            <Shield className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">Authoritative chess.js Rules</h3>
                        <p className="text-xs text-gray-400">
                            Check, checkmate, stalemate, castling, en passant, and pawn promotion verified on the server.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#1e2024] border border-[#2e323b] flex flex-col items-center sm:items-start text-center sm:text-left shadow-md">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                            <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">Real-Time WebSockets</h3>
                        <p className="text-xs text-gray-400">
                            Move broadcast, authoritative timers, draw offers, resignations, and instant board state sync.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#1e2024] border border-[#2e323b] flex flex-col items-center sm:items-start text-center sm:text-left shadow-md">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
                            <Trophy className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">Elo Ratings & History</h3>
                        <p className="text-xs text-gray-400">
                            Standard FIDE Elo calculation updates your rating on every win, draw, and loss in MongoDB.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
