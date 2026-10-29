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

