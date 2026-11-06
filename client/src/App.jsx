import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import CreateGame from './pages/CreateGame';
import JoinGame from './pages/JoinGame';
import ChessGame from './pages/ChessGame';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import GameHistory from './pages/GameHistory';
import CharacterSelect from './pages/CharacterSelect';
import ComputerGame from './pages/ComputerGame';
import BluetoothNearby from './pages/BluetoothNearby';

function AppUpdateNotice() {
    const [update, setUpdate] = useState(null);
    const [webUpdate, setWebUpdate] = useState(null);

    useEffect(() => {
        let active = true;
        const currentBuild = Number(import.meta.env.VITE_BUILD_NUMBER || 0);

        fetch('https://api.github.com/repos/pramod3103-priya/Chess/releases/tags/android-latest', {
            cache: 'no-store',
            headers: { Accept: 'application/vnd.github+json' }
        })
            .then(response => {
                if (!response.ok) throw new Error('Release check unavailable');
                return response.json();
            })
            .then(release => {
                const match = String(release.body || '').match(/Build number:\s*(\d+)/i);
                const latestBuild = match ? Number(match[1]) : 0;
                const apk = (release.assets || []).find(asset => asset.name === 'THE-PROXI-CHESS.apk');
                if (active && apk && latestBuild > currentBuild) {
                    const notice = { url: apk.browser_download_url, version: latestBuild };
                    if (Capacitor.isNativePlatform()) setUpdate(notice);
                    else setWebUpdate(notice);
                }
            })
            .catch(() => {});
        return () => { active = false; };
    }, []);

    if (!update && !webUpdate) return null;
    if (!Capacitor.isNativePlatform() && webUpdate) {
        return (
            <div className="sticky top-0 z-[90] flex items-center justify-between gap-3 border-b border-sky-400/30 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
                <div className="min-w-0">
                    <p className="font-bold text-sky-300">♟ THE PROXI CHESS Android Update</p>
                    <p className="text-xs text-gray-300">Naya app version {webUpdate.version} available hai.</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <a href={webUpdate.url} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white" target="_blank" rel="noreferrer">
                        Download APK
                    </a>
                    <button onClick={() => setWebUpdate(null)} aria-label="Dismiss update notice" className="rounded-lg px-2 py-1 text-gray-300">✕</button>
                </div>
            </div>
        );
    }
    if (!update) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-5">
            <div className="w-full max-w-sm rounded-2xl border border-sky-400/40 bg-[#1F2937] p-6 text-center shadow-2xl">
                <div className="mb-3 text-4xl">♟</div>
                <h2 className="text-xl font-black text-white">Update Available</h2>
                <p className="mt-2 text-sm text-gray-300">THE PROXI CHESS ka naya version available hai. Best experience ke liye update install karein.</p>
                <button
                    onClick={() => Browser.open({ url: update.url })}
                    className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white"
                >
                    Download Update
                </button>
                <button onClick={() => setUpdate(null)} className="mt-3 w-full rounded-xl border border-gray-600 px-4 py-2 text-sm font-semibold text-gray-300">
                    Later
                </button>
            </div>
        </div>
    );
}

function ProxiSplash({ visible }) {
    if (!visible) return null;
    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#070B14] text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(30,64,175,0.30),transparent_48%)]" />
            <div className="relative flex h-36 w-36 items-center justify-center rounded-[2rem] border border-amber-300/50 bg-gradient-to-br from-[#202B43] to-[#090D16] shadow-[0_0_55px_rgba(234,179,8,0.22)]">
                <svg viewBox="0 0 120 120" className="h-24 w-24" role="img" aria-label="Golden chess king">
                    <defs><linearGradient id="proxiGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF1A8"/><stop offset=".48" stopColor="#D6A637"/><stop offset="1" stopColor="#8A5B12"/></linearGradient></defs>
                    <path d="M60 9v16M52 17h16" stroke="url(#proxiGold)" strokeWidth="5" strokeLinecap="round"/>
                    <path d="M39 35 27 26l-4 9 12 9-7 37h64l-7-37 12-9-4-9-12 9-21-8-21 8Z" fill="url(#proxiGold)" stroke="#FFE9A0" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M34 84h52l7 10H27l7-10Z" fill="url(#proxiGold)"/>
                    <path d="M25 99h70v8H25z" rx="3" fill="#D6A637"/>
                    <path d="M43 49h34M40 61h40" stroke="#70470D" strokeWidth="3" strokeLinecap="round" opacity=".7"/>
                </svg>
            </div>
            <h1 className="relative mt-7 text-3xl font-black tracking-[0.18em] text-amber-200">THE PROXI</h1>
            <p className="relative mt-1 text-sm font-semibold tracking-[0.42em] text-white">CHESS</p>
            <div className="relative mt-9 h-1 w-32 overflow-hidden rounded-full bg-slate-700"><div className="h-full w-1/2 animate-[proxiLoad_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-amber-500 to-yellow-100" /></div>
            <style>{'@keyframes proxiLoad{0%{transform:translateX(-110%)}100%{transform:translateX(220%)}}'}</style>
        </div>
    );
}

export default function App() {
    const [showSplash, setShowSplash] = useState(true);
    useEffect(() => {
        const timer = window.setTimeout(() => setShowSplash(false), 2400);
        return () => window.clearTimeout(timer);
    }, []);
    return (
        <Router>
            <AuthProvider>
                <GameProvider>
                    <div className={`min-h-screen bg-[#111827] text-[#F9FAFB] flex flex-col font-sans selection:bg-[#374151] selection:text-[#F9FAFB] ${Capacitor.isNativePlatform() ? "native-app-shell" : ""}`}>
                        <Navbar />
                        <main className="flex-1">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/lobby" element={<Lobby />} />
                                <Route path="/create-game" element={<CreateGame />} />
                                <Route path="/join-game" element={<JoinGame />} />
                                <Route path="/play-computer" element={<CharacterSelect />} />
                                <Route path="/play-computer/arena" element={<ComputerGame />} />
                                <Route path="/bluetooth-nearby" element={<BluetoothNearby />} />
                                <Route path="/game/:roomId" element={<ChessGame />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/history" element={<GameHistory />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                        <AppUpdateNotice />
                        <ProxiSplash visible={showSplash} />
                    </div>
                </GameProvider>
            </AuthProvider>
        </Router>
    );
}
