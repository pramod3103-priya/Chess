import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bluetooth, BluetoothConnected, BluetoothOff, Send, StopCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { BluetoothLowEnergy } from '@capgo/capacitor-bluetooth-low-energy';

const SERVICE_UUID = '7c4a1000-7d2a-4b5b-9f4d-6b9a2c110001';
const MESSAGE_UUID = '7c4a1001-7d2a-4b5b-9f4d-6b9a2c110001';
const CCCD_UUID = '00002902-0000-1000-8000-00805f9b34fb';
const MAX_MESSAGE_BYTES = 20;

const toBytes = (value) => Array.from(new TextEncoder().encode(value).slice(0, MAX_MESSAGE_BYTES));
const fromBytes = (value = []) => new TextDecoder().decode(new Uint8Array(value));

export default function BluetoothNearby() {
    const [role, setRole] = useState(null);
    const [status, setStatus] = useState('Choose Host on one phone and Join on the other.');
    const [connected, setConnected] = useState(false);
    const [peerName, setPeerName] = useState('');
    const [message, setMessage] = useState('HELLO PROXI');
    const [messages, setMessages] = useState([]);
    const [busy, setBusy] = useState(false);
    const modeRef = useRef(null);
    const joiningRef = useRef(false);
    const peerIdRef = useRef(null);
    const listenersRef = useRef([]);

    const addMessage = (from, text) => {
        if (!text) return;
        setMessages((items) => [...items, { id: Date.now() + Math.random(), from, text }].slice(-30));
    };

    const addListener = async (eventName, handler) => {
        const handle = await BluetoothLowEnergy.addListener(eventName, handler);
        listenersRef.current.push(handle);
    };

    const prepareBluetooth = async (mode) => {
        if (!Capacitor.isNativePlatform()) {
            throw new Error('Bluetooth works only inside the installed THE PROXI CHESS app.');
        }
        if (modeRef.current && modeRef.current !== mode) {
            throw new Error('This app session is already set to the other Bluetooth role. Close and reopen the app to switch roles.');
        }
        if (!modeRef.current) {
            await BluetoothLowEnergy.initialize({ mode });
            modeRef.current = mode;
            setRole(mode);
        }

        const permission = await BluetoothLowEnergy.requestPermissions();
        if (permission.bluetooth !== 'granted') {
            throw new Error('Bluetooth permission is not granted. Allow it in the Android permission popup and try again.');
        }
        if (permission.location && permission.location !== 'granted') {
            throw new Error('Location permission is required by Android for nearby BLE scanning. Allow it and try again.');
        }
        const available = await BluetoothLowEnergy.isAvailable();
        if (!available.available) throw new Error('This phone does not support Bluetooth Low Energy.');
        const enabled = await BluetoothLowEnergy.isEnabled();
        if (!enabled.enabled) {
            await BluetoothLowEnergy.openBluetoothSettings();
            throw new Error('Turn Bluetooth on, return to the app, and try again.');
        }
    };

    const startHosting = async () => {
        if (busy) return;
        setBusy(true);
        setStatus('Preparing Bluetooth host…');
        try {
            await prepareBluetooth('peripheral');
            await addListener('centralConnected', () => {
                setConnected(true);
                setPeerName('Nearby phone');
                setStatus('Phone connected. Send a test message.');
            });
            await addListener('centralDisconnected', () => {
                setConnected(false);
                setPeerName('');
                setStatus('Other phone disconnected. You can keep waiting for a new connection.');
            });
            await addListener('gattCharacteristicWriteRequest', async (event) => {
                if (event.service?.toLowerCase() !== SERVICE_UUID) return;
                const received = fromBytes(event.value);
                addMessage('Nearby phone', received);
                try {
                    const ack = toBytes('PROXI ACK');
                    await BluetoothLowEnergy.setGattCharacteristicValue({
                        service: SERVICE_UUID,
                        characteristic: MESSAGE_UUID,
                        value: ack
                    });
                    await BluetoothLowEnergy.notifyGattCharacteristicChanged({
                        service: SERVICE_UUID,
                        characteristic: MESSAGE_UUID,
                        value: ack
                    });
                } catch (error) {
                    setStatus(error?.message || 'Message received, but the reply could not be sent.');
                }
            });
            await BluetoothLowEnergy.addGattService({
                service: SERVICE_UUID,
                characteristics: [{
                    uuid: MESSAGE_UUID,
                    properties: {
                        broadcast: false,
                        read: true,
                        writeWithoutResponse: false,
                        write: true,
                        notify: true,
                        indicate: false,
                        authenticatedSignedWrites: false,
                        extendedProperties: false
                    },
                    value: [],
                    descriptors: [{ uuid: CCCD_UUID, value: [0, 0] }]
                }]
            });
            await BluetoothLowEnergy.startAdvertising({
                name: 'THE PROXI CHESS',
                services: [SERVICE_UUID],
                includeName: false
            });
            setStatus('Hosting nearby game test. Keep this screen open while the other phone joins.');
        } catch (error) {
            setStatus(error?.message || 'Could not start Bluetooth hosting.');
        } finally {
            setBusy(false);
        }
    };

    const connectToDevice = async (device) => {
        if (joiningRef.current) return;
        joiningRef.current = true;
        try {
            await BluetoothLowEnergy.stopScan();
            setStatus('Found a PROXI phone. Connecting…');
            setPeerName(device.name || 'THE PROXI CHESS phone');
            peerIdRef.current = device.deviceId;
            await BluetoothLowEnergy.connect({ deviceId: device.deviceId });
            await BluetoothLowEnergy.discoverServices({ deviceId: device.deviceId });
            await BluetoothLowEnergy.startCharacteristicNotifications({
                deviceId: device.deviceId,
                service: SERVICE_UUID,
                characteristic: MESSAGE_UUID
            });
            setConnected(true);
            setStatus('Connected! Sending a Bluetooth test message…');
            await BluetoothLowEnergy.writeCharacteristic({
                deviceId: device.deviceId,
                service: SERVICE_UUID,
                characteristic: MESSAGE_UUID,
                value: toBytes('HELLO PROXI'),
                type: 'withResponse'
            });
            addMessage('This phone', 'HELLO PROXI');
        } catch (error) {
            setConnected(false);
            setStatus(error?.message || 'Could not connect. Keep both phones nearby and retry.');
            joiningRef.current = false;
        }
    };

    const startJoining = async () => {
        if (busy) return;
        setBusy(true);
        setStatus('Preparing Bluetooth scan…');
        try {
            await prepareBluetooth('central');
            try { await BluetoothLowEnergy.stopScan(); } catch { /* scan may not be active */ }
            await Promise.all(listenersRef.current.map((handle) => handle.remove().catch(() => {})));
            listenersRef.current = [];
            await addListener('characteristicChanged', (event) => {
                if (event.service?.toLowerCase() !== SERVICE_UUID || event.characteristic?.toLowerCase() !== MESSAGE_UUID) return;
                addMessage('Nearby phone', fromBytes(event.value));
                setStatus('Bluetooth message received successfully!');
            });
            await addListener('deviceScanned', ({ device }) => {
                if (device.serviceUuids?.some((uuid) => uuid.toLowerCase() === SERVICE_UUID)) {
                    void connectToDevice(device);
                }
            });
            await BluetoothLowEnergy.startScan({ services: [SERVICE_UUID], timeout: 30000 });
            setStatus('Searching for THE PROXI CHESS host nearby… Keep both phones close.');
        } catch (error) {
            setStatus(error?.message || 'Could not scan for nearby phones.');
        } finally {
            setBusy(false);
        }
    };

    const sendMessage = async () => {
        const text = message.trim();
        if (!text || !connected) return;
        try {
            if (role === 'peripheral') {
                await BluetoothLowEnergy.notifyGattCharacteristicChanged({
                    service: SERVICE_UUID,
                    characteristic: MESSAGE_UUID,
                    value: toBytes(text)
                });
            } else if (role === 'central' && peerIdRef.current) {
                await BluetoothLowEnergy.writeCharacteristic({
                    deviceId: peerIdRef.current,
                    service: SERVICE_UUID,
                    characteristic: MESSAGE_UUID,
                    value: toBytes(text),
                    type: 'withResponse'
                });
            }
            addMessage('This phone', text);
            setMessage('');
            setStatus('Message sent over Bluetooth.');
        } catch (error) {
            setStatus(error?.message || 'Message could not be sent.');
        }
    };

    const stopBluetooth = async () => {
        try { await BluetoothLowEnergy.stopScan(); } catch { /* scan may not be active */ }
        try { await BluetoothLowEnergy.stopAdvertising(); } catch { /* advertising may not be active */ }
        if (peerIdRef.current) {
            try { await BluetoothLowEnergy.disconnect({ deviceId: peerIdRef.current }); } catch { /* already disconnected */ }
            peerIdRef.current = null;
        }
        setConnected(false);
        setPeerName('');
        setStatus('Bluetooth test stopped. Close and reopen the app before choosing a different role.');
    };

    useEffect(() => {
        return () => {
            void BluetoothLowEnergy.stopScan().catch(() => {});
            void BluetoothLowEnergy.stopAdvertising().catch(() => {});
            if (peerIdRef.current) void BluetoothLowEnergy.disconnect({ deviceId: peerIdRef.current }).catch(() => {});
            listenersRef.current.forEach((handle) => { void handle.remove().catch(() => {}); });
            listenersRef.current = [];
        };
    }, []);

    if (!Capacitor.isNativePlatform()) {
        return (
            <div className="min-h-screen bg-[#111827] text-white p-6">
                <div className="max-w-xl mx-auto rounded-2xl bg-[#1F2937] border border-[#374151] p-6">
                    <h1 className="text-2xl font-black mb-2">Bluetooth Nearby</h1>
                    <p className="text-sm text-gray-300">This feature is available only in the installed mobile app. The website remains unchanged.</p>
                    <Link to="/" className="inline-block mt-6 text-sky-300 font-bold">← Back to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111827] text-white px-4 py-6">
            <div className="max-w-xl mx-auto">
                <Link to="/" className="text-sm text-sky-300 font-bold">← Back to Home</Link>
                <div className="mt-5 rounded-3xl bg-[#1F2937] border border-[#374151] p-5 shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                            {connected ? <BluetoothConnected className="w-7 h-7 text-sky-300" /> : <Bluetooth className="w-7 h-7 text-sky-300" />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black">Bluetooth Nearby</h1>
                            <p className="text-xs text-gray-400">Free offline phone-to-phone connection test</p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-[#111827] border border-[#374151] p-3 text-sm text-gray-200 mb-4">
                        <div className="flex items-center gap-2 font-bold mb-1">
                            {connected ? <BluetoothConnected className="w-4 h-4 text-emerald-400" /> : <BluetoothOff className="w-4 h-4 text-amber-300" />}
                            {connected ? `Connected to ${peerName || 'nearby phone'}` : 'Not connected'}
                        </div>
                        <p className="text-xs text-gray-400">{status}</p>
                    </div>

                    {!role && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button onClick={startHosting} disabled={busy} className="rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 px-4 py-4 font-extrabold">
                                Host on this phone
                                <span className="block text-xs font-normal text-sky-100 mt-1">Wait for the other phone</span>
                            </button>
                            <button onClick={startJoining} disabled={busy} className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-4 font-extrabold">
                                Join nearby phone
                                <span className="block text-xs font-normal text-emerald-100 mt-1">Find the host phone</span>
                            </button>
                        </div>
                    )}

                    {role && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>Mode: {role === 'peripheral' ? 'Host' : 'Join'}</span>
                                <span>Bluetooth test channel</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value.slice(0, 18))}
                                    onKeyDown={(event) => { if (event.key === 'Enter') void sendMessage(); }}
                                    placeholder="Type a short test message"
                                    maxLength={18}
                                    className="min-w-0 flex-1 rounded-xl bg-[#111827] border border-[#4B5563] px-3 py-3 text-sm text-white outline-none focus:border-sky-400"
                                />
                                <button onClick={sendMessage} disabled={!connected || !message.trim()} className="rounded-xl bg-sky-600 px-4 disabled:opacity-40">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            {role === 'central' && !connected && (
                                <button onClick={startJoining} disabled={busy} className="block text-xs font-bold text-sky-300 disabled:opacity-50">
                                    Scan again
                                </button>
                            )}
                            <button onClick={stopBluetooth} className="inline-flex items-center gap-2 text-xs font-bold text-rose-300">
                                <StopCircle className="w-4 h-4" /> Stop Bluetooth
                            </button>
                        </div>
                    )}

                    <div className="mt-5 border-t border-[#374151] pt-4">
                        <h2 className="text-sm font-extrabold mb-2">Message test log</h2>
                        {messages.length === 0 ? (
                            <p className="text-xs text-gray-500">Messages sent between the phones will appear here.</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {messages.map((item) => (
                                    <div key={item.id} className="rounded-lg bg-[#111827] px-3 py-2">
                                        <p className="text-[10px] text-sky-300 font-bold">{item.from}</p>
                                        <p className="text-sm break-words">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-[11px] leading-relaxed text-gray-500 mt-4">
                    Test both phones with Bluetooth turned on. Keep this screen open on both devices. This confirms the BLE connection and message path; live chess move sync will be connected after the two-phone test passes.
                </p>
            </div>
        </div>
    );
}
