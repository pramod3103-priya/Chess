const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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

// Dynamic CORS configuration allowing localhost, 127.0.0.1, LAN IPs, and CLIENT_URL
const allowedOrigins = [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin.startsWith('http://192.168.')) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
};

// Setup Socket.IO
const io = new Server(server, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000
});

// Middlewares
app.use(cors(corsOptions));
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

