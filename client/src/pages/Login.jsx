import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || '/lobby';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(identifier, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="bg-[#1e2024] border border-[#2e323b] rounded-2xl max-w-md w-full p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                        <LogIn className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Pramod Chess</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Track your games, compete on the leaderboard, and gain Elo rating.
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
                            Username or Email
                        </label>
                        <input
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="grandmaster or player@example.com"
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
                            placeholder="••••••••"
                            className="w-full bg-[#26292f] border border-[#3a3f4b] focus:border-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                    >
                        <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Don't have an account yet?{' '}
                    <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold underline">
                        Create one now
                    </Link>
                </p>
            </div>
        </div>
    );
}

