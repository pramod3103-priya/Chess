import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import { QRCodeSVG } from 'qrcode.react';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { BluetoothLowEnergy } from '@capgo/capacitor-bluetooth-low-energy';
import { Capacitor } from '@capacitor/core';
import { ArrowLeft, Bluetooth, Camera, Copy, Wifi, X } from 'lucide-react';
import ChessBoard from '../components/ChessBoard/ChessBoard';

const SERVICE = '7c4a1000-7d2a-4b5b-9f4d-6b9a2c110001';
const CHAR = '7c4a1001-7d2a-4b5b-9f4d-6b9a2c110001';
const CCCD = '00002902-0000-1000-8000-00805f9b34fb';
const enc = (s) => Array.from(new TextEncoder().encode(s));
const dec = (v = []) => new TextDecoder().decode(new Uint8Array(v));
const newCode = () => Math.random().toString(36).slice(2, 10).toUpperCase();

export default function OfflineChess() {
    const [role, setRole] = useState(null);
    const [token, setToken] = useState('');
    const [status, setStatus] = useState('Create a QR room or scan your friend’s QR code.');
    const [connected, setConnected] = useState(false);
    const [fen, setFen] = useState(new Chess().fen());
    const [turn, setTurn] = useState('w');
    const [moves, setMoves] = useState([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const chessRef = useRef(new Chess());
    const deviceRef = useRef(null);
    const listenersRef = useRef([]);
    const joinedRef = useRef(false);
    const tokenRef = useRef('');

    const listen = async (name, fn) => {
        const h = await BluetoothLowEnergy.addListener(name, fn);
        listenersRef.current.push(h);
    };

    const updateFromMove = (move, sendToPeer = false) => {
        try {
            const result = chessRef.current.move(move);
            if (!result) return false;
            setFen(chessRef.current.fen());
            setTurn(chessRef.current.turn());
            setMoves(chessRef.current.history());
            if (sendToPeer) {
                const packet = 'M' + result.from + result.to + (result.promotion || 'q');
                const bytes = enc(packet);
                if (role === 'host') {
                    void BluetoothLowEnergy.notifyGattCharacteristicChanged({ service: SERVICE, characteristic: CHAR, value: bytes });
                } else if (deviceRef.current) {
                    void BluetoothLowEnergy.writeCharacteristic({ deviceId: deviceRef.current, service: SERVICE, characteristic: CHAR, value: bytes, type: 'withResponse' });
                }
            }
            return true;
        } catch { return false; }
    };

    const setupHost = async () => {
        setBusy(true); setError(''); setStatus('Starting offline Bluetooth host…');
        try {
            if (!Capacitor.isNativePlatform()) throw new Error('Offline phone-to-phone mode requires the installed app on both phones.');
            const code = newCode();
            tokenRef.current = code;
            setToken(code);
            await BluetoothLowEnergy.initialize({ mode: 'peripheral' });
            const permission = await BluetoothLowEnergy.requestPermissions();
            if (permission.bluetooth !== 'granted') throw new Error('Bluetooth permission is required.');
            const enabled = await BluetoothLowEnergy.isEnabled();
            if (!enabled.enabled) { await BluetoothLowEnergy.openBluetoothSettings(); throw new Error('Turn Bluetooth on, return here and tap Create QR again.'); }
            await listen('centralConnected', () => setStatus('Phone found. Checking QR pairing code…'));
            await listen('centralDisconnected', () => { setConnected(false); joinedRef.current = false; setStatus('Other phone disconnected.'); });
            await listen('gattCharacteristicWriteRequest', async (event) => {
                if (event.service?.toLowerCase() !== SERVICE || event.characteristic?.toLowerCase() !== CHAR) return;
                const packet = dec(event.value);
                if (packet.startsWith('J')) {
                    if (packet.slice(1) !== tokenRef.current) { setStatus('Wrong QR code. Ask your friend to scan this phone’s QR.'); return; }
                    joinedRef.current = true;
                    setConnected(true);
                    setStatus('Connected offline! You are White.');
                    await BluetoothLowEnergy.notifyGattCharacteristicChanged({ service: SERVICE, characteristic: CHAR, value: enc('R') });
                    return;
                }
                if (packet.startsWith('M') && joinedRef.current) {
                    const move = { from: packet.slice(1, 3), to: packet.slice(3, 5), promotion: packet.slice(5, 6) || 'q' };
                    if (updateFromMove(move, false)) setStatus('Opponent move received over Bluetooth.');
                }
            });
            await BluetoothLowEnergy.addGattService({
                service: SERVICE,
                characteristics: [{
                    uuid: CHAR,
                    properties: { broadcast: false, read: true, writeWithoutResponse: false, write: true, notify: true, indicate: false, authenticatedSignedWrites: false, extendedProperties: false },
                    value: [],
                    descriptors: [{ uuid: CCCD, value: [0, 0] }]
                }]
            });
            await BluetoothLowEnergy.startAdvertising({ name: 'PROXI CHESS', services: [SERVICE], includeName: true });
            setRole('host');
            setStatus('Show this QR to the other phone. Keep this screen open.');
        } catch (e) { setError(e?.message || 'Could not start offline mode.'); }
        finally { setBusy(false); }
    };

    const scanAndJoin = async () => {
        setBusy(true); setError('');
        try {
            if (!Capacitor.isNativePlatform()) throw new Error('QR camera scanning requires the installed app.');
            const permission = await BarcodeScanner.requestPermissions();
            if (permission.camera !== 'granted') throw new Error('Allow camera permission to scan the QR code.');
            const scan = await BarcodeScanner.scan({ formats: [BarcodeFormat.QrCode] });
            const raw = scan.barcodes?.[0]?.rawValue || '';
            if (!raw.startsWith('PROXI-OFFLINE|')) throw new Error('This is not a THE PROXI CHESS offline QR code.');
            const scannedToken = raw.split('|')[1] || '';
            if (!/^[A-Z0-9]{8}$/.test(scannedToken)) throw new Error('Invalid pairing QR code.');
            setToken(scannedToken);
            setStatus('QR scanned. Finding the nearby phone…');
            await BluetoothLowEnergy.initialize({ mode: 'central' });
            const btPermission = await BluetoothLowEnergy.requestPermissions();
            if (btPermission.bluetooth !== 'granted') throw new Error('Bluetooth permission is required.');
            const enabled = await BluetoothLowEnergy.isEnabled();
            if (!enabled.enabled) { await BluetoothLowEnergy.openBluetoothSettings(); throw new Error('Turn Bluetooth on, return here and tap Scan QR again.'); }
            await listen('characteristicChanged', (event) => {
                if (event.service?.toLowerCase() !== SERVICE || event.characteristic?.toLowerCase() !== CHAR) return;
                const packet = dec(event.value);
                if (packet === 'R') { setConnected(true); setStatus('Connected offline! You are Black.'); }
                if (packet.startsWith('M')) {
                    const move = { from: packet.slice(1, 3), to: packet.slice(3, 5), promotion: packet.slice(5, 6) || 'q' };
                    if (updateFromMove(move, false)) setStatus('Opponent move received over Bluetooth.');
                }
            });
            await listen('deviceScanned', ({ device }) => {
                if (joinedRef.current || !device.serviceUuids?.some((u) => u.toLowerCase() === SERVICE)) return;
                joinedRef.current = true;
                void (async () => {
                    try {
                        await BluetoothLowEnergy.stopScan();
                        await BluetoothLowEnergy.connect({ deviceId: device.deviceId });
                        deviceRef.current = device.deviceId;
                        await BluetoothLowEnergy.discoverServices({ deviceId: device.deviceId });
                        await BluetoothLowEnergy.startCharacteristicNotifications({ deviceId: device.deviceId, service: SERVICE, characteristic: CHAR });
                        await BluetoothLowEnergy.writeCharacteristic({ deviceId: device.deviceId, service: SERVICE, characteristic: CHAR, value: enc('J' + scannedToken), type: 'withResponse' });
                        setRole('guest');
                        setStatus('Pairing with QR code…');
                    } catch (e) { joinedRef.current = false; setError(e?.message || 'Could not connect to the host phone.'); }
                })();
            });
            await BluetoothLowEnergy.startScan({ services: [SERVICE], timeout: 30000 });
            setStatus('Point camera at the QR first, then keep both phones close while Bluetooth pairs.');
        } catch (e) { setError(e?.message || 'QR scan was cancelled or failed.'); }
        finally { setBusy(false); }
    };

    const playMove = (move) => {
        if (!connected || (role === 'host' && turn !== 'w') || (role === 'guest' && turn !== 'b')) return;
        if (!updateFromMove(move, true)) setStatus('That move is not legal.');
        else setStatus('Move sent directly phone-to-phone. No internet used.');
    };

    const stop = async () => {
        try { await BluetoothLowEnergy.stopScan(); } catch {}
        try { await BluetoothLowEnergy.stopAdvertising(); } catch {}
        if (deviceRef.current) { try { await BluetoothLowEnergy.disconnect({ deviceId: deviceRef.current }); } catch {} }
        listenersRef.current.forEach((h) => { void h.remove().catch(() => {}); });
        listenersRef.current = [];
        deviceRef.current = null; joinedRef.current = false; tokenRef.current = '';
        setRole(null); setConnected(false); setToken('');
        setStatus('Offline session stopped.');
    };

    useEffect(() => () => {
        try { void BluetoothLowEnergy.stopScan(); void BluetoothLowEnergy.stopAdvertising(); } catch {}
        listenersRef.current.forEach((h) => { void h.remove().catch(() => {}); });
        if (deviceRef.current) void BluetoothLowEnergy.disconnect({ deviceId: deviceRef.current }).catch(() => {});
    }, []);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#111827] text-white px-4 py-6">
            <div className="max-w-2xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-sky-300 font-bold"><ArrowLeft className="w-4 h-4"/> Back to Home</Link>
                <div className="mt-5 rounded-3xl border border-[#374151] bg-[#1F2937] p-5 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center"><Bluetooth className="w-6 h-6 text-sky-300"/></div>
                        <div><h1 className="text-2xl font-black">Offline QR Chess</h1><p className="text-xs text-gray-400">QR pairing + Bluetooth • No internet</p></div>
                    </div>
                    {!role && (
                        <div className="grid sm:grid-cols-2 gap-3">
                            <button onClick={setupHost} disabled={busy} className="rounded-xl bg-sky-600 p-4 font-bold disabled:opacity-50">Create QR Room<span className="block text-xs font-normal mt-1">White • Show QR to friend</span></button>
                            <button onClick={scanAndJoin} disabled={busy} className="rounded-xl bg-emerald-600 p-4 font-bold disabled:opacity-50"><Camera className="inline w-4 h-4 mr-2"/>Scan QR to Join<span className="block text-xs font-normal mt-1">Black • Scan friend’s QR</span></button>
                        </div>
                    )}
                    {role === 'host' && !connected && (
                        <div className="my-4 flex flex-col items-center rounded-2xl bg-white p-4">
                            <QRCodeSVG value={'PROXI-OFFLINE|' + token} size={220} level="M"/>
                            <p className="mt-3 text-sm font-bold text-slate-900">Scan with the other THE PROXI CHESS app</p>
                            <p className="text-xs text-slate-600 mt-1">Pairing code: {token}</p>
                        </div>
                    )}
                    {role && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-300 mb-3"><span>{role === 'host' ? 'White' : 'Black'} player</span><span>{connected ? 'Connected' : 'Waiting for connection'}</span></div>
                            <div className="max-w-[560px] mx-auto"><ChessBoard fen={fen} myColor={role === 'host' ? 'w' : 'b'} orientation={role === 'host' ? 'white' : 'black'} isInteractive={connected && turn === (role === 'host' ? 'w' : 'b')} onMove={playMove}/></div>
                            <div className="mt-3 rounded-xl bg-[#111827] p-3 text-sm text-gray-300">Turn: {turn === 'w' ? 'White' : 'Black'} • Moves: {moves.length} • {chessRef.current.isGameOver() ? (chessRef.current.isCheckmate() ? 'Checkmate' : 'Game over') : 'Game in progress'}</div>
                        </div>
                    )}
                    <div className="mt-4 rounded-xl bg-[#111827] p-3 text-sm text-gray-300">{status}</div>
                    {error && <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
                    {role && <button onClick={stop} className="mt-4 w-full rounded-xl border border-gray-600 py-3 text-sm font-bold text-gray-200"><X className="inline w-4 h-4 mr-2"/>Stop Offline Game</button>}
                    <p className="mt-4 text-[11px] leading-relaxed text-gray-500">Both phones must have Bluetooth enabled and the installed app open. QR is used only for pairing; moves travel directly over Bluetooth, not through the internet. Keep both phones nearby.</p>
                </div>
            </div>
        </div>
    );
}
