import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Key, Swords, Trophy, Users, RefreshCw, Eye } from 'lucide-react';
import { useGame } from '../context/GameContext';
import api from '../services/api';

const TIME_CONTROLS = [
    { label: '1 min Bullet', time: 60, inc: 0 },
    { label: '3 min Blitz', time: 180, inc: 0 },
    { label: '5 min Blitz', time: 300, inc: 0 },
    { label: '10 min Rapid', time: 600, inc: 0 },
    { label: '15 min Rapid', time: 900, inc: 10 }
];

export default function Lobby() {
    const navigate = useNavigate();
    const { createGame } = useGame();

    const [selectedTime, setSelectedTime] = useState(TIME_CONTROLS[2]);
    const [joinCode, setJoinCode] = useState('');
    const [activeGames, setActiveGames] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingLobby, setLoadingLobby] = useState(true);

    const fetchLobbyData = async () => {
        setLoadingLobby(true);
        try {
            const [gamesRes, leadRes] = await Promise.all([
                api.get('/games/lobby'),
                api.get('/games/leaderboard')
            ]);
            setActiveGames(gamesRes.data.games || []);
            setLeaderboard(leadRes.data.leaderboard || []);
        } catch (err) {
            console.error('Failed to fetch lobby data:', err);
        } finally {
            setLoadingLobby(false);
        }
    };

    useEffect(() => {
        fetchLobbyData();
        const interval = setInterval(fetchLobbyData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCreate = async () => {
        try {
            setLoadingCreate(true);
            const roomId = await createGame({
                timeControl: selectedTime.time,
                increment: selectedTime.inc
            });
            navigate(`/game/${roomId}`);
        } catch (err) {
            console.error('Error creating game:', err);
        } finally {
            setLoadingCreate(false);
        }
    };

    const handleJoin = (e) => {
        e.preventDefault();
        const code = joinCode.trim().toUpperCase();
        if (code) {
            navigate(`/game/${code}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight flex items-center gap-3">
                        <Swords className="w-8 h-8 text-[#D1D5DB]" />
                        <span>Game Lobby</span>
                    </h1>
                    <p className="text-sm text-[#9CA3AF] mt-1">
                        Create a custom challenge, join an open room, or spectate ongoing matches.
                    </p>
                </div>
                <button
                    onClick={fetchLobbyData}
                    className="p-2.5 rounded-xl bg-[#273244] border border-[#4B5563] hover:bg-[#374151] text-[#D1D5DB] transition flex items-center gap-2 text-xs font-semibold shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${loadingLobby ? 'animate-spin text-[#D1D5DB]' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Create & Join Cards */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Create Room Card */}
                    <div className="bg-[#273244] border border-[#4B5563] rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-2.5 mb-4 text-[#F9FAFB] font-bold text-lg">
                            <PlusCircle className="w-5 h-5 text-[#D1D5DB]" />
                            <span>Create a Room</span>
                        </div>
                        <p className="text-xs text-[#9CA3AF] mb-5">
                            You'll get a unique 6-character room code to share with a friend or opponent.
                        </p>

                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-[#D1D5DB] uppercase tracking-wider mb-2.5">
                                Select Time Control
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {TIME_CONTROLS.map((tc) => (
                                    <button
                                        key={tc.label}
                                        type="button"
                                        onClick={() => setSelectedTime(tc)}
                                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                                            selectedTime.label === tc.label
                                                ? 'bg-[#374151] border-[#9CA3AF] text-[#F9FAFB] shadow-md shadow-black/20'
                                                : 'bg-[#1F2937] border-[#4B5563] text-[#D1D5DB] hover:bg-[#374151]'
                                        }`}
                                    >
                                        {tc.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={loadingCreate}
                            className="w-full py-3.5 px-4 bg-[#374151] hover:bg-[#4B5563] disabled:opacity-50 text-[#F9FAFB] font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-black/30 border border-[#4B5563]"
                        >
                            <PlusCircle className="w-5 h-5 text-[#D1D5DB]" />
                            <span>{loadingCreate ? 'Creating Room...' : 'Create & Play as White'}</span>
                        </button>
                    </div>

                    {/* Join with Code Card */}
                    <div className="bg-[#273244] border border-[#4B5563] rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-2.5 mb-4 text-[#F9FAFB] font-bold text-lg">
                            <Key className="w-5 h-5 text-[#D1D5DB]" />
                            <span>Join with Room Code</span>
                        </div>
                        <form onSubmit={handleJoin} className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="ENTER 6-DIGIT CODE"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                maxLength={8}
                                className="w-full bg-[#1F2937] border border-[#4B5563] focus:border-[#D1D5DB] text-center font-mono font-bold text-[#F9FAFB] uppercase tracking-widest px-4 py-3 rounded-xl focus:outline-none transition shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={!joinCode.trim()}
                                className="w-full py-3 px-4 bg-[#1F2937] hover:bg-[#374151] disabled:opacity-40 text-[#F9FAFB] font-bold rounded-xl transition shadow-lg border border-[#4B5563]"
                            >
                                Enter Room (Play as Black)
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Active Games & Leaderboard */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Active Games List */}
                    <div className="bg-[#273244] border border-[#4B5563] rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5 text-[#F9FAFB] font-bold text-lg">
                                <Users className="w-5 h-5 text-[#D1D5DB]" />
                                <span>Active Arena Matches</span>
                            </div>
                            <span className="text-xs font-mono text-[#9CA3AF]">
                                {activeGames.length} active
                            </span>
                        </div>

                        {activeGames.length === 0 ? (
                            <div className="text-center py-10 text-[#9CA3AF] text-sm italic">
                                No active games right now. Create a room to start the first match!
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                                {activeGames.map((g) => (
                                    <div
                                        key={g.roomId}
                                        className="p-3.5 rounded-xl bg-[#1F2937] border border-[#4B5563] hover:border-[#6B7280] flex items-center justify-between transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="font-mono font-bold text-sm text-[#F9FAFB] bg-[#374151] px-2.5 py-1 rounded border border-[#4B5563]">
                                                {g.roomId}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-[#F9FAFB]">
                                                    {g.whitePlayer?.username || 'White'} vs {g.blackPlayer?.username || 'Waiting for opponent...'}
                                                </div>
                                                <div className="text-xs text-[#9CA3AF]">
                                                    Status: <span className="text-[#D1D5DB] font-medium">{g.status}</span> • Moves: {g.movesCount || 0}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/game/${g.roomId}`)}
                                            className="py-1.5 px-3 bg-[#273244] hover:bg-[#374151] text-[#D1D5DB] hover:text-white border border-[#4B5563] rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                                        >
                                            {g.status === 'WAITING' ? (
                                                <>
                                                    <Swords className="w-3.5 h-3.5 text-[#D1D5DB]" />
                                                    <span>Join Game</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-3.5 h-3.5 text-[#9CA3AF]" />
                                                    <span>Spectate</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-[#273244] border border-[#4B5563] rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-2.5 mb-4 text-[#F9FAFB] font-bold text-lg">
                            <Trophy className="w-5 h-5 text-[#D1D5DB]" />
                            <span>Top Players Leaderboard</span>
                        </div>

                        {leaderboard.length === 0 ? (
                            <div className="text-center py-6 text-[#9CA3AF] text-sm">
                                No rankings recorded yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#4B5563]">
                                {leaderboard.map((p, idx) => (
                                    <div key={p._id || idx} className="py-2.5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-5 font-bold text-xs ${
                                                idx === 0 ? 'text-[#F9FAFB]' : idx === 1 ? 'text-[#D1D5DB]' : idx === 2 ? 'text-[#9CA3AF]' : 'text-gray-500'
                                            }`}>
                                                #{idx + 1}
                                            </span>
                                            <span className="text-sm font-semibold text-[#F9FAFB]">
                                                {p.username}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-mono">
                                            <span className="text-[#9CA3AF]">
                                                {p.gamesWon}W / {p.gamesLost}L
                                            </span>
                                            <span className="font-bold text-[#F9FAFB] bg-[#374151] px-2.5 py-0.5 rounded border border-[#4B5563]">
                                                {p.rating}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
