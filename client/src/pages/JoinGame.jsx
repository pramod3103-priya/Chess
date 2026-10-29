import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { joinGame as apiJoinGame } from '../services/api';

export default function JoinGame() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async (e) => {
        e.preventDefault();
        const code = roomId.trim().toUpperCase();
        if (!code) {
            setError('Please enter a room code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Call REST API POST /api/games/:roomId/join
            try {
                await apiJoinGame(code);
            } catch (apiErr) {
                // If it fails with "already full" or something, handle message, else navigate directly
                if (apiErr.response?.data?.message) {
                    console.warn('REST join warning:', apiErr.response.data.message);
                }
            }
            // Navigate to /game/:roomId
            navigate(`/game/${code}`);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to join room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </button>

                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                        <Key className="w-7 h-7 text-amber-400" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Join a Match</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Enter the 6-character room code provided by your opponent. You will play as Black.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleJoin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                            Room ID / Invite Code
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. ABC123"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            maxLength={8}
                            className="w-full bg-[#26292f] border border-[#3a3f4b] focus:border-amber-400 text-center font-mono font-bold text-xl text-amber-300 uppercase tracking-widest px-4 py-3.5 rounded-xl focus:outline-none transition shadow-inner"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !roomId.trim()}
                        className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2"
                    >
                        <span>{loading ? 'Joining Match...' : 'Join Game'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}

