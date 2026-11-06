import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Key, LogIn, Swords, Shield, Zap, Trophy, User, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CharacterAvatar from '../components/Characters/CharacterAvatar';

export default function Home() {
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between bg-[#111827]">
            {/* Hero Main */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center max-w-5xl mx-auto">
                {/* Mode Tag */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#273244] border border-[#4B5563] text-[#D1D5DB] text-xs font-black tracking-widest uppercase mb-6 shadow-sm">
                    <span className="text-lg leading-none text-white">♟</span>
                    <span>ONLINE MULTIPLAYER & OFFLINE AI ARENA</span>
                </div>

                {/* Hero Title */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#F9FAFB] tracking-tight leading-tight mb-4">
                    Play Chess Anywhere
                </h1>

                <p className="text-[#9CA3AF] text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
                    Battle real players in online multiplayer rooms or challenge autonomous parody grandmasters <strong className="text-amber-400 font-bold">ODI</strong> and <strong className="text-sky-400 font-bold">RAHU</strong> running 100% offline in your browser.
                </p>

                {/* Two Core Game Modes Grid */}
                <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
                    {/* Mode 1: Play With Computer (Parody Bots) */}
                    <Link
                        to="/play-computer"
                        className="group relative p-6 rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#1F2937] to-[#273244] border-2 border-amber-500/40 hover:border-amber-400 shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
                    >
                        <div className="absolute top-4 right-4 flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-[#1E293B] bg-[#111827] overflow-hidden">
                                <CharacterAvatar characterId="odi" state="idle" className="w-full h-full" />
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-[#1E293B] bg-[#111827] overflow-hidden">
                                <CharacterAvatar characterId="rahu" state="idle" className="w-full h-full" />
                            </div>
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>No Internet Required</span>
                            </div>
                            <h2 className="text-2xl font-black text-[#F9FAFB] mb-1.5 flex items-center gap-2">
                                <Bot className="w-6 h-6 text-amber-400" />
                                <span>Play With Computer</span>
                            </h2>
                            <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                                Challenge parody characters <strong>ODI</strong> & <strong>RAHU</strong> with 3 difficulty levels, live animated reactions, and witty strategic quotes.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-black text-amber-400 group-hover:translate-x-1 transition-transform">
                            <span>Choose Opponent & Start &rarr;</span>
                        </div>
                    </Link>

                    {/* Mode 2: Play Online Multiplayer */}
                    <div className="p-6 rounded-3xl bg-[#1F2937] border-2 border-[#374151] hover:border-[#4B5563] shadow-xl transition-all duration-300 flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#374151] text-[#D1D5DB] border border-[#4B5563] mb-3">
                                <Swords className="w-3 h-3 text-[#D1D5DB]" />
                                <span>Live Multiplayer</span>
                            </div>
                            <h2 className="text-2xl font-black text-[#F9FAFB] mb-1.5 flex items-center gap-2">
                                <Swords className="w-6 h-6 text-emerald-400" />
                                <span>Play Online</span>
                            </h2>
                            <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                                Create an instant private game room with a 6-character code, invite a friend with a direct link, or join a public arena lobby.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                to="/create-game"
                                className="flex-1 py-2.5 px-3 bg-[#374151] hover:bg-[#4B5563] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition border border-[#4B5563]"
                            >
                                <PlusCircle className="w-4 h-4 text-[#D1D5DB]" />
                                <span>Create Room</span>
                            </Link>

                            <Link
                                to="/join-game"
                                className="flex-1 py-2.5 px-3 bg-[#273244] hover:bg-[#374151] text-[#D1D5DB] hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-[#4B5563]"
                            >
                                <Key className="w-4 h-4 text-[#D1D5DB]" />
                                <span>Join Code</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Additional Lobby & Auth Quick-Links */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#9CA3AF]">
                    <Link
                        to="/lobby"
                        className="inline-flex items-center gap-1.5 hover:text-[#F9FAFB] transition px-3 py-1.5 rounded-lg hover:bg-[#1F2937]"
                    >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Public Lobby Arena &rarr;</span>
                    </Link>

                    {!isAuthenticated ? (
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 hover:text-[#F9FAFB] transition px-3 py-1.5 rounded-lg hover:bg-[#1F2937]"
                        >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Sign In to Track Ratings &rarr;</span>
                        </Link>
                    ) : (
                        <Link
                            to="/profile"
                            className="inline-flex items-center gap-1.5 hover:text-[#F9FAFB] transition px-3 py-1.5 rounded-lg hover:bg-[#1F2937]"
                        >
                            <User className="w-3.5 h-3.5" />
                            <span>Profile ({user.username}) &rarr;</span>
                        </Link>
                    )}
                </div>
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
                            Check, checkmate, stalemate, castling, en passant, and pawn promotion verified with zero illegal moves.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#273244] border border-[#4B5563] flex flex-col items-center sm:items-start text-center sm:text-left shadow-lg">
                        <div className="w-11 h-11 rounded-xl bg-[#374151] border border-[#4B5563] flex items-center justify-center mb-4">
                            <Bot className="w-5 h-5 text-[#38BDF8]" />
                        </div>
                        <h3 className="text-base font-bold text-[#F9FAFB] mb-1.5">Autonomous Browser AI</h3>
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">
                            Minimax with alpha-beta pruning and piece-square tables runs 100% offline in-browser without server lag.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#273244] border border-[#4B5563] flex flex-col items-center sm:items-start text-center sm:text-left shadow-lg">
                        <div className="w-11 h-11 rounded-xl bg-[#374151] border border-[#4B5563] flex items-center justify-center mb-4">
                            <Trophy className="w-5 h-5 text-amber-400" />
                        </div>
                        <h3 className="text-base font-bold text-[#F9FAFB] mb-1.5">Elo Ratings & Parody Bots</h3>
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">
                            Play against ODI and RAHU with custom animated expressions, witty quotes, and multiple skill tiers.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
