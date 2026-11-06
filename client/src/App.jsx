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

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
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
                    setUpdate({ url: apk.browser_download_url, version: latestBuild });
                }
            })
            .catch(() => {});
        return () => { active = false; };
    }, []);

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

export default function App() {
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
                    </div>
                </GameProvider>
            </AuthProvider>
        </Router>
    );
}
