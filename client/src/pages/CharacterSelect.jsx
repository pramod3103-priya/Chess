import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Bot, Sparkles, Check, ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';
import CharacterAvatar from '../components/Characters/CharacterAvatar';
import { CHARACTERS, CHARACTER_LIST } from '../components/Characters/characterData';

export default function CharacterSelect() {
    const navigate = useNavigate();

    const [selectedCharId, setSelectedCharId] = useState('odi');
    const [difficulty, setDifficulty] = useState('medium');
    const [color, setColor] = useState('w'); // 'w' | 'b' | 'random'
    const [timeControl, setTimeControl] = useState('casual'); // 'casual' | '300' | '600'

    const selectedChar = CHARACTERS[selectedCharId] || CHARACTERS.odi;

    const handleStartGame = () => {
        let assignedColor = color;
        if (color === 'random') {
            assignedColor = Math.random() < 0.5 ? 'w' : 'b';
        }

        const params = new URLSearchParams({
            char: selectedCharId,
            diff: difficulty,
            color: assignedColor,
            time: timeControl
        });

        navigate(`/play-computer/arena?${params.toString()}`);
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#111827] text-[#F9FAFB] py-10 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1F2937] border border-[#4B5563] text-[#D1D5DB] text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
                        <Bot className="w-4 h-4 text-[#38BDF8]" />
                        <span>100% OFFLINE IN-BROWSER AI</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#F9FAFB] mb-3">
                        Play With Computer
                    </h1>
                    <p className="text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
                        Pick your parody challenger, dial in the engine difficulty, and play authoritative FIDE chess without needing an internet connection.
                    </p>
                </div>

                {/* Character Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {CHARACTER_LIST.map((char) => {
                        const isSelected = selectedCharId === char.id;
                        return (
                            <div
                                key={char.id}
                                onClick={() => setSelectedCharId(char.id)}
                                className={`relative cursor-pointer rounded-3xl p-6 sm:p-8 transition-all duration-300 border-2 bg-gradient-to-b ${char.cardGradient} ${
                                    isSelected
                                        ? `${char.activeBorder} scale-[1.01]`
                                        : 'border-[#374151] hover:border-[#4B5563] opacity-80 hover:opacity-100'
                                }`}
                            >
                                {/* Selected Badge */}
                                {isSelected && (
                                    <div
                                        className="absolute top-5 right-5 w-7 h-7 rounded-full flex items-center justify-center font-bold text-white shadow-lg animate-fadeIn"
                                        style={{ backgroundColor: char.accentColor }}
                                    >
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                                    {/* Avatar Display */}
                                    <div className="relative flex-shrink-0">
                                        <div
                                            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center p-2 border-2 ${
                                                isSelected ? 'border-white/40 shadow-xl' : 'border-[#4B5563]'
                                            } ${char.avatarBg}`}
                                        >
                                            <CharacterAvatar
                                                characterId={char.id}
                                                state={isSelected ? 'winning' : 'idle'}
                                                className="w-full h-full"
                                            />
                                        </div>
                                        <div
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border bg-[#111827] whitespace-nowrap"
                                            style={{ color: char.accentColor, borderColor: `${char.accentColor}66` }}
                                        >
                                            ~{char.elo[difficulty]} ELO
                                        </div>
                                    </div>

                                    {/* Character Info */}
                                    <div className="flex-1 text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                            <h2 className="text-2xl font-black text-[#F9FAFB] tracking-wide">
                                                {char.name}
                                            </h2>
                                            <span
                                                className="text-xs px-2.5 py-0.5 rounded-full font-bold border"
                                                style={{
                                                    color: char.accentColor,
                                                    backgroundColor: `${char.accentColor}18`,
                                                    borderColor: `${char.accentColor}44`
                                                }}
                                            >
                                                {char.title}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-[#D1D5DB] mb-2.5">
                                            {char.tagline}
                                        </p>
                                        <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                                            {char.description}
                                        </p>

                                        {/* Sample dialogue pill */}
                                        <div className="p-3 rounded-xl bg-[#111827]/70 border border-[#374151] text-[11px] text-[#D1D5DB] italic">
                                            &ldquo;{char.quotes.start[0]}&rdquo;
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Configuration Bar */}
                <div className="bg-[#1F2937] border border-[#374151] rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
                    <h3 className="text-xs font-black text-[#9CA3AF] uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#D1D5DB]" />
                        <span>Match Customization</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Difficulty Level */}
                        <div>
                            <label className="block text-xs font-bold text-[#D1D5DB] mb-2.5">
                                AI Difficulty
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'easy', label: 'Easy', sub: 'Casual' },
                                    { id: 'medium', label: 'Medium', sub: 'Tactical' },
                                    { id: 'hard', label: 'Hard', sub: 'Grandmaster' }
                                ].map((d) => (
                                    <button
                                        key={d.id}
                                        type="button"
                                        onClick={() => setDifficulty(d.id)}
                                        className={`py-2.5 px-3 rounded-xl border text-center transition font-bold text-xs ${
                                            difficulty === d.id
                                                ? 'bg-[#374151] text-white border-white/60 shadow-md'
                                                : 'bg-[#273244] text-[#9CA3AF] border-[#4B5563] hover:text-white hover:bg-[#374151]'
                                        }`}
                                    >
                                        <div>{d.label}</div>
                                        <div className="text-[10px] font-normal opacity-75">{d.sub}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Choose Your Side */}
                        <div>
                            <label className="block text-xs font-bold text-[#D1D5DB] mb-2.5">
                                Play As
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'w', label: 'White', icon: '♔', sub: '1st Move' },
                                    { id: 'b', label: 'Black', icon: '♚', sub: '2nd Move' },
                                    { id: 'random', label: 'Random', icon: '🎲', sub: 'Surprise' }
                                ].map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setColor(c.id)}
                                        className={`py-2 px-3 rounded-xl border text-center transition font-bold text-xs ${
                                            color === c.id
                                                ? 'bg-[#374151] text-white border-white/60 shadow-md'
                                                : 'bg-[#273244] text-[#9CA3AF] border-[#4B5563] hover:text-white hover:bg-[#374151]'
                                        }`}
                                    >
                                        <div className="text-base leading-none mb-0.5">{c.icon}</div>
                                        <div>{c.label}</div>
                                        <div className="text-[9px] font-normal opacity-75">{c.sub}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Clock / Time Control */}
                        <div>
                            <label className="block text-xs font-bold text-[#D1D5DB] mb-2.5">
                                Clock Mode
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'casual', label: 'Untimed', sub: 'No Rush' },
                                    { id: '300', label: '5 Min', sub: 'Blitz' },
                                    { id: '600', label: '10 Min', sub: 'Rapid' }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTimeControl(t.id)}
                                        className={`py-2.5 px-3 rounded-xl border text-center transition font-bold text-xs ${
                                            timeControl === t.id
                                                ? 'bg-[#374151] text-white border-white/60 shadow-md'
                                                : 'bg-[#273244] text-[#9CA3AF] border-[#4B5563] hover:text-white hover:bg-[#374151]'
                                        }`}
                                    >
                                        <div>{t.label}</div>
                                        <div className="text-[10px] font-normal opacity-75">{t.sub}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Launch Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#1F2937] via-[#273244] to-[#1F2937] border border-[#4B5563]">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border"
                            style={{
                                backgroundColor: `${selectedChar.accentColor}22`,
                                color: selectedChar.accentColor,
                                borderColor: `${selectedChar.accentColor}44`
                            }}
                        >
                            <Swords className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-[#F9FAFB]">
                                Ready to battle {selectedChar.name} ({difficulty.toUpperCase()})
                            </div>
                            <div className="text-xs text-[#9CA3AF]">
                                {color === 'random' ? 'Random color' : color === 'w' ? 'White (You move first)' : 'Black (Computer moves first)'} &bull; {timeControl === 'casual' ? 'Untimed play' : `${parseInt(timeControl, 10) / 60} min timer`}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleStartGame}
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-white text-base shadow-2xl flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5 active:translate-y-0"
                        style={{
                            backgroundColor: selectedChar.accentColor,
                            boxShadow: `0 10px 25px -5px ${selectedChar.accentColor}66`
                        }}
                    >
                        <span>Start Game</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

