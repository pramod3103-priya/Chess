import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Swords, Trophy, History, User, LogOut, LogIn } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-[#2e323b] bg-[#141517]/85 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        <div className="w-full h-full bg-[#141517] rounded-[10px] flex items-center justify-center">
                            <span className="text-xl">♞</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                            Pramod Chess
                        </span>
                        <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                            Multiplayer
                        </span>
                    </div>
                </Link>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-300">
                    <Link
                        to="/create-game"
                        className="px-3 py-2 rounded-xl hover:text-white hover:bg-[#1e2024] transition text-xs uppercase tracking-wider text-emerald-400 font-bold"
                    >
                        + Create Game
                    </Link>
                    <Link
                        to="/join-game"
                        className="px-3 py-2 rounded-xl hover:text-white hover:bg-[#1e2024] transition text-xs uppercase tracking-wider text-amber-400 font-bold"
                    >
                        Join Code
                    </Link>
                    <Link
                        to="/lobby"
                        className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-[#1e2024] transition flex items-center gap-2"
                    >
                        <Swords className="w-4 h-4 text-emerald-400" />
                        <span>Arena</span>
                    </Link>
                    <Link
                        to="/history"
                        className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-[#1e2024] transition flex items-center gap-2"
                    >
                        <History className="w-4 h-4 text-emerald-400" />
                        <span>History</span>
                    </Link>
                </nav>

                {/* Right side Auth */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#1e2024] border border-[#2e323b] hover:border-[#3a3f4b] transition shadow-sm"
                            >
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-sm text-gray-200 hidden sm:inline">
                                    {user.username}
                                </span>
                                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
                                    {user.rating}
                                </span>
                            </Link>

                            <button
                                onClick={logout}
                                title="Log Out"
                                className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-[#1e2024] border border-transparent hover:border-[#2e323b] transition"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-[#1e2024] transition"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-1.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

