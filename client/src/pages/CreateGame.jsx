import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Clock, Zap, Flame, Timer, Settings2, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { createGame as apiCreateGame } from '../services/api';
import { useGame } from '../context/GameContext';
import { getPlayerToken } from '../services/socket';

const TIME_CATEGORIES = [
    {
        id: 'bullet',
        name: 'Bullet',
        icon: Zap,
        options: [
            { label: '1 min', time: 60, inc: 0 },
            { label: '1 | 1', time: 60, inc: 1 },
            { label: '2 | 1', time: 120, inc: 1 }
        ]
    },
    {
        id: 'blitz',
        name: 'Blitz',
        icon: Flame,
        options: [
            { label: '3 min', time: 180, inc: 0 },
            { label: '3 | 2', time: 180, inc: 2 },
            { label: '5 min', time: 300, inc: 0 },
            { label: '5 | 3', time: 300, inc: 3 }
        ]
    },
    {
        id: 'rapid',
        name: 'Rapid',
        icon: Timer,
        options: [
            { label: '10 min', time: 600, inc: 0 },
            { label: '15 | 10', time: 900, inc: 10 },
            { label: '30 min', time: 1800, inc: 0 }
        ]
    },
    {
        id: 'custom',
        name: 'Custom',
        icon: Settings2,
        options: []
    }
];

export default function CreateGame() {
    const navigate = useNavigate();
    const { createGame: socketCreateGame } = useGame();

    const [activeTab, setActiveTab] = useState('rapid');
    const [selectedPreset, setSelectedPreset] = useState(TIME_CATEGORIES[2].options[0]); // 10 min
    const [customMinutes, setCustomMinutes] = useState(10);
    const [customIncrement, setCustomIncrement] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (loading) return;
        setLoading(true);
        setError('');

        let initialSeconds = 600;
        let incrementSeconds = 0;

        if (activeTab === 'custom') {
            const mins = Math.max(1, Math.min(60, Number(customMinutes) || 10));
            const inc = Math.max(0, Math.min(60, Number(customIncrement) || 0));
            initialSeconds = mins * 60;
            incrementSeconds = inc;
        } else if (selectedPreset) {
            initialSeconds = selectedPreset.time;
            incrementSeconds = selectedPreset.inc;
        }

        try {
            const playerToken = getPlayerToken();
            let resRoomId = null;

            // Direct socket creation takes authoritative precedence
            try {
                resRoomId = await socketCreateGame({
                    timeControl: initialSeconds,
                    increment: incrementSeconds,
                    playerToken
                });
            } catch (socketErr) {
                console.warn('Socket create failed, attempting REST create fallback:', socketErr);
            }

            // Fallback to REST API if socket is connecting
            if (!resRoomId) {
                const res = await apiCreateGame({
                    timeControl: initialSeconds,
                    increment: incrementSeconds,
                    playerToken
                });
                if (res && res.roomId) {
                    resRoomId = res.roomId;
                }
            }

            if (resRoomId) {
                navigate(`/game/${resRoomId}`);
            } else {
                throw new Error('Server did not return a valid Room ID.');
            }
        } catch (err) {
            setError(err.message || 'Failed to create room. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#111827]">
            <div className="bg-[#273244] border border-[#4B5563] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </button>

                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#374151] border border-[#4B5563] flex items-center justify-center mx-auto mb-3 shadow-md">
                        <PlusCircle className="w-7 h-7 text-[#D1D5DB]" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">Create a Match</h2>
                    <p className="text-sm text-[#9CA3AF] mt-1">
                        Choose your clock rules. You will receive a unique 6-character room code as White.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-400 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Time Category Tabs: [ Bullet ] [ Blitz ] [ Rapid ] [ Custom ] */}
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#1F2937] border border-[#4B5563] rounded-xl mb-5">
                    {TIME_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeTab === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                    setActiveTab(cat.id);
                                    if (cat.options.length > 0) {
                                        setSelectedPreset(cat.options[0]);
                                    }
                                }}
                                className={`py-2 px-2 rounded-lg font-semibold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition ${
                                    isActive
                                        ? 'bg-[#374151] text-[#F9FAFB] border border-[#9CA3AF] shadow-sm'
                                        : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#273244]'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{cat.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Preset Options for Active Category */}
                {activeTab !== 'custom' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                        {TIME_CATEGORIES.find((c) => c.id === activeTab)?.options.map((opt) => {
                            const isSelected = selectedPreset?.label === opt.label;
                            return (
                                <button
                                    key={opt.label}
                                    type="button"
                                    onClick={() => setSelectedPreset(opt)}
                                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                                        isSelected
                                            ? 'bg-[#374151] border-[#9CA3AF] text-[#F9FAFB] font-bold shadow-md'
                                            : 'bg-[#1F2937] border-[#4B5563] text-[#D1D5DB] hover:bg-[#374151] font-medium'
                                    }`}
                                >
                                    <Clock className={`w-4 h-4 ${isSelected ? 'text-[#F9FAFB]' : 'text-[#9CA3AF]'}`} />
                                    <span className="text-sm">{opt.label}</span>
                                    <span className="text-[11px] text-[#9CA3AF] font-mono">
                                        {opt.inc > 0 ? `+${opt.inc}s inc` : 'No inc'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Custom Time Control Inputs */}
                {activeTab === 'custom' && (
                    <div className="bg-[#1F2937] border border-[#4B5563] rounded-xl p-4 mb-6 flex flex-col gap-4">
                        <div>
                            <div className="flex justify-between text-xs font-semibold text-[#D1D5DB] mb-1.5">
                                <span>Minutes per player:</span>
                                <span className="font-mono text-[#F9FAFB] font-bold">{customMinutes} min</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="60"
                                value={customMinutes}
                                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                                className="w-full accent-[#9CA3AF] cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-semibold text-[#D1D5DB] mb-1.5">
                                <span>Increment per move:</span>
                                <span className="font-mono text-[#F9FAFB] font-bold">{customIncrement} sec</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="30"
                                value={customIncrement}
                                onChange={(e) => setCustomIncrement(Number(e.target.value))}
                                className="w-full accent-[#9CA3AF] cursor-pointer"
                            />
                        </div>
                    </div>
                )}

                {/* Action Button: Create Room (with duplicate protection) */}
                <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full py-4 px-6 bg-[#374151] hover:bg-[#4B5563] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-base transition shadow-xl shadow-black/40 border border-[#4B5563] flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin text-[#D1D5DB]" />
                            <span>Creating Room...</span>
                        </>
                    ) : (
                        <>
                            <PlusCircle className="w-5 h-5 text-[#D1D5DB]" />
                            <span>Create Match & Get Room Code</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
