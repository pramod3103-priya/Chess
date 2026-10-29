import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Key, Swords, Trophy, Users, RefreshCw, Eye } from 'lucide-react';
import { useGame } from '../context/GameContext';
import api from '../services/api';

const TIME_CONTROLS = [
    { label: '3 min Blitz', time: 180, inc: 0 },
    { label: '5 min Blitz', time: 300, inc: 0 },
    { label: '10 min Rapid', time: 600, inc: 0 },
    { label: '15 min Rapid', time: 900, inc: 0 }
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
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <Swords className="w-8 h-8 text-emerald-400" />
                        <span>Game Lobby</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Create a custom challenge, join an open room, or spectate ongoing matches.
                    </p>
                </div>
                <button
                    onClick={fetchLobbyData}
                    className="p-2.5 rounded-xl bg-[#1e2024] border border-[#2e323b] hover:border-gray-500 text-gray-300 transition flex items-center gap-2 text-xs font-semibold"
                >
                    <RefreshCw className={`w-4 h-4 ${loadingLobby ? 'animate-spin text-emerald-400' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Create & Join Cards */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Create Room Card */}
                    <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-2.5 mb-4 text-emerald-400 font-bold text-lg">
                            <PlusCircle className="w-5 h-5" />
                            <span>Create a Room</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-5">
                            You'll get a unique 6-character room code to share with a friend or opponent.
                        </p>

                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2.5">
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
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                                                : 'bg-[#26292f] border-[#3a3f4b] text-gray-300 hover:border-gray-500'
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
                            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/25"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>{loadingCreate ? 'Creating Room...' : 'Create & Play as White'}</span>
                        </button>
                    </div>

                    {/* Join with Code Card */}
                    <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-2.5 mb-4 text-amber-400 font-bold text-lg">
                            <Key className="w-5 h-5" />
                            <span>Join with Room Code</span>
                        </div>
                        <form onSubmit={handleJoin} className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="ENTER 6-DIGIT CODE"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                maxLength={8}
                                className="w-full bg-[#26292f] border border-[#3a3f4b] focus:border-amber-400 text-center font-mono font-bold text-amber-300 uppercase tracking-widest px-4 py-3 rounded-xl focus:outline-none transition"
                            />
                            <button
                                type="submit"
                                disabled={!joinCode.trim()}
                                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold rounded-xl transition shadow-lg shadow-amber-600/20"
                            >
                                Enter Room (Play as Black)
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Active Games & Leaderboard */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Active Games List */}
                    <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
                                <Users className="w-5 h-5 text-emerald-400" />
                                <span>Active Arena Matches</span>
                            </div>
                            <span className="text-xs font-mono text-gray-400">
                                {activeGames.length} active
                            </span>
                        </div>

                        {activeGames.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 text-sm italic">
                                No active games right now. Create a room to start the first match!
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                                {activeGames.map((g) => (
                                    <div
                                        key={g.roomId}
                                        className="p-3.5 rounded-xl bg-[#26292f] border border-[#3a3f4b] hover:border-[#4b5263] flex items-center justify-between transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="font-mono font-bold text-sm text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                                {g.roomId}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-gray-200">
                                                    {g.whitePlayer?.username || 'White'} vs {g.blackPlayer?.username || 'Waiting for opponent...'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Status: <span className="text-emerald-400 font-medium">{g.status}</span> • Moves: {g.movesCount || 0}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/game/${g.roomId}`)}
                                            className="py-1.5 px-3 bg-[#1e2024] hover:bg-emerald-600 text-gray-300 hover:text-white border border-[#3a3f4b] rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                                        >
                                            {g.status === 'WAITING' ? (
                                                <>
                                                    <Swords className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span>Join Game</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-3.5 h-3.5 text-purple-400" />
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
                    <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-2.5 mb-4 text-white font-bold text-lg">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            <span>Top Players Leaderboard</span>
                        </div>

                        {leaderboard.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-sm">
                                No rankings recorded yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-[#2e323b]">
                                {leaderboard.map((p, idx) => (
                                    <div key={p._id || idx} className="py-2.5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-5 font-bold text-xs ${
                                                idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-500'
                                            }`}>
                                                #{idx + 1}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-200">
                                                {p.username}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-mono">
                                            <span className="text-gray-400">
                                                {p.gamesWon}W / {p.gamesLost}L
                                            </span>
                                            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
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

