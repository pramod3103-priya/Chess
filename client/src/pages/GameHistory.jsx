import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Swords, Calendar, Eye, Trophy } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function GameHistory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/games/history');
                setGames(res.data.games || []);
            } catch (err) {
                console.error('Failed to fetch game history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 bg-[#111827]">
            <div className="flex items-center gap-3 mb-6">
                <History className="w-8 h-8 text-[#D1D5DB]" />
                <div>
                    <h1 className="text-3xl font-extrabold text-[#F9FAFB] tracking-tight">Match History</h1>
                    <p className="text-sm text-[#9CA3AF]">Review past online matches, game outcomes, and move counts.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-[#9CA3AF] text-sm">
                    Loading matches...
                </div>
            ) : games.length === 0 ? (
                <div className="bg-[#273244] border border-[#4B5563] rounded-2xl p-12 text-center shadow-xl">
                    <Swords className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-[#F9FAFB] mb-2">No Matches Played Yet</h3>
                    <p className="text-sm text-[#9CA3AF] mb-6">
                        Jump into the lobby or create a room to record your first game!
                    </p>
                    <button
                        onClick={() => navigate('/lobby')}
                        className="py-2.5 px-6 bg-[#374151] hover:bg-[#4B5563] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-black/40 border border-[#4B5563]"
                    >
                        Go to Lobby
                    </button>
                </div>
            ) : (
                <div className="bg-[#273244] border border-[#4B5563] rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#1F2937] text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider border-b border-[#4B5563]">
                                <tr>
                                    <th className="px-6 py-4">Room</th>
                                    <th className="px-6 py-4">White</th>
                                    <th className="px-6 py-4">Black</th>
                                    <th className="px-6 py-4">Result</th>
                                    <th className="px-6 py-4">Moves</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#4B5563]">
                                {games.map((g) => (
                                    <tr key={g._id} className="hover:bg-[#374151] transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-[#F9FAFB]">
                                            {g.roomId}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-[#F9FAFB]">
                                            {g.whitePlayer?.username || 'Guest'}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-[#D1D5DB]">
                                            {g.blackPlayer?.username || 'Guest'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${
                                                g.winner === 'w'
                                                    ? 'bg-[#374151] text-[#F9FAFB] border-[#4B5563]'
                                                    : g.winner === 'b'
                                                    ? 'bg-[#1F2937] text-[#D1D5DB] border-[#4B5563]'
                                                    : 'bg-[#273244] text-[#9CA3AF] border-[#4B5563]'
                                            }`}>
                                                {g.winner === 'w' ? 'White Won' : g.winner === 'b' ? 'Black Won' : 'Draw'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-[#9CA3AF] text-xs">
                                            {g.moves?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-[#9CA3AF]">
                                            {new Date(g.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/game/${g.roomId}`)}
                                                className="py-1 px-3 bg-[#1F2937] hover:bg-[#374151] text-[#D1D5DB] hover:text-white border border-[#4B5563] rounded-lg text-xs font-semibold transition"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
