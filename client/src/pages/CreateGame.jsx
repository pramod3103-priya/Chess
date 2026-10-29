import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Clock, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { createGame as apiCreateGame } from '../services/api';
import { useGame } from '../context/GameContext';

const TIME_OPTIONS = [
    { label: '3 min (Blitz)', time: 180, inc: 0 },
    { label: '5 min (Blitz)', time: 300, inc: 0 },
    { label: '10 min (Rapid)', time: 600, inc: 0 },
    { label: '15 min (Rapid)', time: 900, inc: 0 },
    { label: '30 min (Classical)', time: 1800, inc: 0 }
];

export default function CreateGame() {
    const navigate = useNavigate();
    const { createGame: socketCreateGame } = useGame();

    const [selectedTime, setSelectedTime] = useState(TIME_OPTIONS[2]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        setLoading(true);
        setError('');
        try {
            // First call the backend REST API POST /api/games
            let resRoomId = null;
            try {
                const res = await apiCreateGame({
                    timeControl: selectedTime.time,
                    increment: selectedTime.inc
                });
                if (res && res.roomId) {
                    resRoomId = res.roomId;
                }
            } catch (apiErr) {
                console.warn('REST create failed, falling back to socket create:', apiErr);
            }

            // Also register with socket if needed or fallback
            if (!resRoomId) {
                resRoomId = await socketCreateGame({
                    timeControl: selectedTime.time,
                    increment: selectedTime.inc
                });
            }

            if (resRoomId) {
                navigate(`/game/${resRoomId}`);
            } else {
                throw new Error('No room ID returned from server');
            }
        } catch (err) {
            setError(err.message || 'Failed to create room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-400 mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </button>

                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                        <PlusCircle className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create a Match</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        You'll get a 6-character room code to invite your opponent. You play as White.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2.5">
                        Select Clock Duration
                    </label>
                    <div className="flex flex-col gap-2">
                        {TIME_OPTIONS.map((tc) => (
                            <button
                                key={tc.label}
                                type="button"
                                onClick={() => setSelectedTime(tc)}
                                className={`flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all ${
                                    selectedTime.label === tc.label
                                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm'
                                        : 'bg-[#26292f] border-[#3a3f4b] text-gray-300 hover:border-gray-500'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Clock className="w-4 h-4" />
                                    <span>{tc.label}</span>
                                </div>
                                <span className="text-xs font-mono font-normal opacity-75">
                                    {tc.time / 60}m per player
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>{loading ? 'Creating Game...' : 'Create Game'}</span>
                </button>
            </div>
        </div>
    );
}

