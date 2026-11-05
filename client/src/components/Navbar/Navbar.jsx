import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Swords, Trophy, History, User, LogOut, LogIn, Plus } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-[#4B5563] bg-[#1F2937]/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#374151] to-[#64748B] p-0.5 shadow-md shadow-black/40 group-hover:scale-105 transition-transform">
                        <div className="w-full h-full bg-[#111827] rounded-[10px] flex items-center justify-center text-white">
                            <span className="text-xl">♞</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-lg font-black tracking-tight text-[#F9FAFB] group-hover:text-[#D1D5DB] transition-colors">
                            Pramod Chess
                        </span>
                        <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#273244] text-[#D1D5DB] rounded border border-[#4B5563]">
                            Multiplayer
                        </span>
                    </div>
                </Link>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#9CA3AF]">
                    <Link
                        to="/create-game"
                        className="px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider text-[#F9FAFB] font-bold bg-[#273244] hover:bg-[#374151] border border-[#4B5563] transition flex items-center gap-1.5 shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5 text-[#D1D5DB]" />
                        <span>Create Game</span>
                    </Link>
                    <Link
                        to="/join-game"
                        className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider text-[#D1D5DB] hover:text-[#F9FAFB] hover:bg-[#273244] border border-transparent hover:border-[#4B5563] transition font-bold"
                    >
                        Join Code
                    </Link>
                    <Link
                        to="/lobby"
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#D1D5DB] hover:text-[#F9FAFB] hover:bg-[#273244] border border-transparent hover:border-[#4B5563] transition flex items-center gap-2"
                    >
                        <Swords className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        <span>Arena</span>
                    </Link>
                    <Link
                        to="/history"
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#D1D5DB] hover:text-[#F9FAFB] hover:bg-[#273244] border border-transparent hover:border-[#4B5563] transition flex items-center gap-2"
                    >
                        <History className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        <span>History</span>
                    </Link>
                </nav>

                {/* Right side Auth */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#273244] border border-[#4B5563] hover:bg-[#374151] transition shadow-sm"
                            >
                                <div className="w-7 h-7 rounded-lg bg-[#374151] border border-[#4B5563] flex items-center justify-center text-xs font-bold text-[#F9FAFB]">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-sm text-[#F9FAFB] hidden sm:inline">
                                    {user.username}
                                </span>
                                <span className="text-xs font-mono font-bold text-[#D1D5DB] bg-[#1F2937] px-2 py-0.5 rounded border border-[#4B5563]">
                                    {user.rating}
                                </span>
                            </Link>

                            <button
                                onClick={logout}
                                title="Log Out"
                                className="p-2 rounded-xl text-[#9CA3AF] hover:text-red-400 hover:bg-[#273244] border border-transparent hover:border-[#4B5563] transition"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-[#D1D5DB] hover:text-white hover:bg-[#273244] border border-transparent hover:border-[#4B5563] transition"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-1.5 rounded-xl text-sm font-bold bg-[#374151] hover:bg-[#4B5563] text-white border border-[#4B5563] shadow-md transition"
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
