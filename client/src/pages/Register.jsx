import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (username.length < 3) {
            setError('Username must be at least 3 characters long');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await register(username, email, password);
            navigate('/lobby');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Username or email may already be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl max-w-md w-full p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                        <UserPlus className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Create Free Chess Account</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Start with a default 1200 Elo rating and compete in multiplayer rooms.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Grandmaster99"
                            className="w-full bg-[#26292f] border border-[#3a3f4b] focus:border-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="player@example.com"
                            className="w-full bg-[#26292f] border border-[#3a3f4b] focus:border-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full bg-[#26292f] border border-[#3a3f4b] focus:border-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                    >
                        <span>{loading ? 'Creating Account...' : 'Sign Up & Play'}</span>
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Already registered?{' '}
                    <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold underline">
                        Sign In here
                    </Link>
                </p>
            </div>
        </div>
    );
}

