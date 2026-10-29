import React from 'react';
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

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <GameProvider>
                    <div className="min-h-screen bg-[#141517] text-[#f3f4f6] flex flex-col font-sans">
                        <Navbar />
                        <main className="flex-1">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/lobby" element={<Lobby />} />
                                <Route path="/create-game" element={<CreateGame />} />
                                <Route path="/join-game" element={<JoinGame />} />
                                <Route path="/game/:roomId" element={<ChessGame />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/history" element={<GameHistory />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                    </div>
                </GameProvider>
            </AuthProvider>
        </Router>
    );
}
