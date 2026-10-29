const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const { connectDB } = require('./config/db');
const initializeChessSocket = require('./socket/chessSocket');
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');

process.on('uncaughtException', (err) => {
    console.error('[Process Uncaught Exception]:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Process Unhandled Rejection]:', reason);
});

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Middlewares
app.use(cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Pramod Chess Multiplayer API',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);

// Serve client dist build if present
const path = require('path');
const fs = require('fs');
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
            return next();
        }
        res.sendFile(path.join(clientDist, 'index.html'));
    });
}

// 404 Handler for unhandled API requests
app.use((req, res) => {
    res.status(404).json({ message: 'Resource not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
});

// Initialize Socket.io chess logic
initializeChessSocket(io);

// Connect DB and Start Server
async function startServer() {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`===============================================`);
            console.log(` Chess Multiplayer Server running on port ${PORT}`);
            console.log(` Client URL: ${CLIENT_URL}`);
            console.log(`===============================================`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();

