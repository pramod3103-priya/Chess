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
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#111827]">
            <div className="bg-[#273244] border border-[#4B5563] rounded-2xl max-w-md w-full p-8 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#374151] border border-[#4B5563] flex items-center justify-center mx-auto mb-3 shadow-md">
                        <LogIn className="w-6 h-6 text-[#D1D5DB]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#F9FAFB] tracking-tight">Sign In to Pramod Chess</h2>
                    <p className="text-sm text-[#9CA3AF] mt-1">
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
                        <label className="block text-xs font-semibold text-[#D1D5DB] uppercase tracking-wider mb-1.5">
                            Username or Email
                        </label>
                        <input
                            type="text"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="grandmaster or player@example.com"
                            className="w-full bg-[#1F2937] border border-[#4B5563] focus:border-[#D1D5DB] text-[#F9FAFB] px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#D1D5DB] uppercase tracking-wider mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#1F2937] border border-[#4B5563] focus:border-[#D1D5DB] text-[#F9FAFB] px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full py-3 px-4 bg-[#374151] hover:bg-[#4B5563] disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-black/40 border border-[#4B5563] flex items-center justify-center gap-2"
                    >
                        <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    </button>
                </form>

                <p className="text-center text-xs text-[#9CA3AF] mt-6">
                    Don't have an account yet?{' '}
                    <Link to="/register" className="text-[#D1D5DB] hover:text-white font-semibold underline">
                        Create one now
                    </Link>
                </p>
            </div>
        </div>
    );
}
