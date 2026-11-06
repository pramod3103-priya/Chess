# ♟️ Pramod Chess — Real-Time Online Multiplayer Arena (MERN Stack)

A production-ready real-time multiplayer chess platform built with MongoDB, Express.js, React (Vite + Tailwind CSS), Node.js, Socket.IO, and authoritative server-side `chess.js` validation.

---

## 🚀 Quick Start

### Option 1: Run Both (Single Server)
The backend automatically serves the compiled React app directly on **Port 5000**:
```bash
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

---

### Option 2: Development Mode (Hot Reloading)

1. **Start Backend Server (Port 5000)**:
   ```bash
   npm run server
   # or
   cd server && npm start
   ```

2. **Start Frontend Dev Server (Port 5173)**:
   ```bash
   npm run client
   # or
   cd client && npm run dev
   ```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🎮 How to Play Multiplayer

1. **Player 1 (White)**:
   - Click **"Create Room (White)"** on the Home screen or Lobby.
   - A unique 6-character room code (e.g., `BENP3M`) is instantly generated on the server.
   - Click **"Copy Direct Invite Link"** or share the 6-character room code.
   - The screen will display: *"Waiting for opponent to join..."*.

2. **Player 2 (Black)**:
   - Open the invite link or enter the 6-character room code in the **"Join with Room Code"** box.
   - Click **"Enter Room (Play as Black)"**.

3. **Game Begins**:
   - Both players automatically synchronize in real-time.
   - Authoritative FIDE chess rules with `chess.js` on the server prevent illegal moves and cheating.
   - Server clocks tick down on the active player's turn.
   - Check, checkmate, stalemate, pawn promotion modal, draw offers, and resignations are broadcast instantly.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - React 18 + Vite
  - Tailwind CSS (custom dark theme, responsive board, piece highlight & check animations)
  - React Router v6
  - Socket.IO Client
  - Procedural Web Audio API sound synthesizer (move, capture, check, castle, promote, gameover)
  - Inline SVG vector pieces for crisp visuals

- **Backend**:
  - Node.js & Express.js
  - Socket.IO with authoritative room state management
  - MongoDB & Mongoose (with automatic embedded `MongoMemoryServer` zero-setup fallback)
  - JWT Authentication & bcryptjs password hashing
  - Server-authoritative `chess.js` move validation & clock timers
  - FIDE Elo Rating calculation service



---

## 📱 THE PROXI CHESS — Android & iOS App

The React/Vite client is being prepared for native Android and iOS packaging with Capacitor.

### First-time setup

1. Install dependencies:
   ```bash
   cd client
   npm install
   ```
2. Copy `.env.mobile.example` to `.env` and set the deployed backend URLs:
   - `VITE_API_URL`: Render backend base URL (without trailing slash)
   - `VITE_SOCKET_URL`: Socket.IO server URL
3. Add native projects:
   ```bash
   npm run mobile:add:android
   npm run mobile:add:ios
   ```
4. Build and sync the web app into native projects:
   ```bash
   npm run mobile:sync
   ```
5. Open the projects in Android Studio / Xcode:
   ```bash
   npm run mobile:open:android
   npm run mobile:open:ios
   ```

Android builds require Android Studio and the Android SDK. iOS builds/signing require macOS with Xcode.

### Multiplayer rollout

- Online multiplayer reuses the existing Express + Socket.IO backend and room system.
- Offline phone-to-phone Bluetooth play requires a native transport on both Android and iOS; it is a separate implementation phase and is not enabled by this Capacitor shell yet.
