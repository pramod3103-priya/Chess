import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, ArrowRight, ArrowLeft, AlertCircle, Loader2, Camera, X, QrCode } from 'lucide-react';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { joinGame as apiJoinGame } from '../services/api';

export default function JoinGame() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);
    const [scanMessage, setScanMessage] = useState('');
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const frameRef = useRef(null);

    const stopScanner = () => {
        setScanning(false);
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    }, []);

    const openScannedInvite = (rawValue) => {
        try {
            let code = '';
            if (/^[A-Z0-9]{4,8}$/i.test(rawValue.trim())) {
                code = rawValue.trim().toUpperCase();
            } else {
                const url = new URL(rawValue);
                if (url.origin !== window.location.origin) throw new Error('This QR code is not for THE PROXI CHESS website.');
                const pathParts = url.pathname.split('/').filter(Boolean);
                if (pathParts.length !== 2 || pathParts[0] !== 'game' || !/^[A-Z0-9]{4,8}$/i.test(pathParts[1])) {
                    throw new Error('QR code does not contain a valid chess room invite.');
                }
                code = pathParts[1].toUpperCase();
            }
            stopScanner();
            setRoomId(code);
            navigate('/game/' + encodeURIComponent(code));
        } catch (err) {
            setScanMessage(err.message || 'Invalid QR code. Please scan a THE PROXI CHESS room QR.');
        }
    };

    const startScanner = async () => {
        setError('');
        setScanMessage('');
        if (Capacitor.isNativePlatform()) {
            try {
                const permission = await BarcodeScanner.requestPermissions();
                if (permission.camera !== 'granted') throw new Error('Allow camera permission to scan the invite QR.');
                const result = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
                const value = result.barcodes?.[0]?.rawValue;
                if (!value) throw new Error('No QR code detected. Try again.');
                openScannedInvite(value);
            } catch (err) {
                setScanMessage(err.message || 'QR scanner could not start.');
            }
            return;
        }
        if (!('BarcodeDetector' in window)) {
            setScanMessage('This browser does not support camera QR scanning. Use Chrome or enter the room code manually below.');
            return;
        }
        try {
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
            streamRef.current = stream;
            setScanning(true);
            window.setTimeout(() => {
                if (videoRef.current && streamRef.current) {
                    videoRef.current.srcObject = streamRef.current;
                    videoRef.current.play().catch(() => {});
                    const scanFrame = async () => {
                        if (!streamRef.current || !videoRef.current) return;
                        try {
                            const codes = await detector.detect(videoRef.current);
                            if (codes.length && codes[0].rawValue) {
                                openScannedInvite(codes[0].rawValue);
                                return;
                            }
                        } catch {}
                        frameRef.current = requestAnimationFrame(scanFrame);
                    };
                    frameRef.current = requestAnimationFrame(scanFrame);
                }
            }, 0);
        } catch (err) {
            stopScanner();
            setScanMessage(err.name === 'NotAllowedError'
                ? 'Camera permission denied. Allow camera access in your browser settings.'
                : (err.message || 'Could not open camera. Use the room code option below.'));
        }
    };

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
                navigate(`/game/${code}`);
            } catch (apiErr) {
                const msg = apiErr.message || '';
                // If it's a game state validation error (e.g. room full/cancelled), display it
                if (msg.includes('closed') || msg.includes('full') || msg.includes('not found') || msg.includes('completed')) {
                    setError(msg);
                    setLoading(false);
                    return;
                }
                // If it's a transient network issue or socket will handle it, proceed to room
                navigate(`/game/${code}`);
            }
        } catch (err) {
            const msg = err.message || 'Failed to join room';
            if (msg.toLowerCase().includes('network error')) {
                setError('Cannot reach the game server. Please verify your connection.');
            } else {
                setError(msg);
            }
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

                <div className="mb-4">
                    <button
                        type="button"
                        onClick={startScanner}
                        className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-3 text-sm font-extrabold text-emerald-300 flex items-center justify-center gap-2 transition"
                    >
                        <QrCode className="w-5 h-5" />
                        <Camera className="w-4 h-4" />
                        Scan Room QR Code
                    </button>
                    {scanning && (
                        <div className="mt-3 rounded-xl border border-[#4B5563] bg-[#1F2937] p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-white">Point camera at the room QR</span>
                                <button type="button" onClick={stopScanner} className="rounded-lg p-1.5 text-gray-300 hover:bg-[#374151]" aria-label="Close scanner"><X className="w-4 h-4" /></button>
                            </div>
                            <video ref={videoRef} muted playsInline className="w-full max-h-72 rounded-lg bg-black object-cover" />
                            <p className="mt-2 text-[11px] text-gray-400">Use your rear camera and keep the QR code inside the frame.</p>
                        </div>
                    )}
                    {scanMessage && <p className="mt-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-200">{scanMessage}</p>}
                </div>

                <div className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
                    <span className="h-px flex-1 bg-[#4B5563]" />
                    <span>OR ENTER ROOM CODE</span>
                    <span className="h-px flex-1 bg-[#4B5563]" />
                </div>

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
