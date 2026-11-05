import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
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
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#111827]">
            <div className="bg-[#273244] border border-[#4B5563] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </button>

                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#374151] border border-[#4B5563] flex items-center justify-center mx-auto mb-3 shadow-md">
                        <Key className="w-7 h-7 text-[#D1D5DB]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">Join a Match</h2>
                    <p className="text-sm text-[#9CA3AF] mt-1">
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
                        <label className="block text-xs font-semibold text-[#D1D5DB] uppercase tracking-wider mb-2">
                            Room ID / Invite Code
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. ABC123"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            maxLength={8}
                            className="w-full bg-[#1F2937] border border-[#4B5563] focus:border-[#D1D5DB] text-center font-mono font-bold text-xl text-[#F9FAFB] uppercase tracking-widest px-4 py-3.5 rounded-xl focus:outline-none transition shadow-inner"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !roomId.trim()}
                        className="w-full py-3.5 px-4 bg-[#374151] hover:bg-[#4B5563] disabled:opacity-40 text-white font-bold rounded-xl text-sm transition shadow-xl shadow-black/40 border border-[#4B5563] flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-[#D1D5DB]" />
                                <span>Joining Match...</span>
                            </>
                        ) : (
                            <>
                                <span>Join Game</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
