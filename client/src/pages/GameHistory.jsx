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
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-6">
                <History className="w-8 h-8 text-emerald-400" />
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Match History</h1>
                    <p className="text-sm text-gray-400">Review past online matches, game outcomes, and move counts.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                    Loading matches...
                </div>
            ) : games.length === 0 ? (
                <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl p-12 text-center shadow-xl">
                    <Swords className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No Matches Played Yet</h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Jump into the lobby or create a room to record your first game!
                    </p>
                    <button
                        onClick={() => navigate('/lobby')}
                        className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/25"
                    >
                        Go to Lobby
                    </button>
                </div>
            ) : (
                <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#181a1d] text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-[#2e323b]">
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
                            <tbody className="divide-y divide-[#2e323b]">
                                {games.map((g) => (
                                    <tr key={g._id} className="hover:bg-[#26292f] transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                                            {g.roomId}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-200">
                                            {g.whitePlayer?.username || 'Guest'}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-200">
                                            {g.blackPlayer?.username || 'Guest'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                                                g.winner === 'w'
                                                    ? 'bg-emerald-500/15 text-emerald-400'
                                                    : g.winner === 'b'
                                                    ? 'bg-purple-500/15 text-purple-400'
                                                    : 'bg-amber-500/15 text-amber-400'
                                            }`}>
                                                {g.winner === 'w' ? 'White Won' : g.winner === 'b' ? 'Black Won' : 'Draw'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                                            {g.moves?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400">
                                            {new Date(g.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/game/${g.roomId}`)}
                                                className="py-1 px-3 bg-[#26292f] hover:bg-emerald-600 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition"
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

