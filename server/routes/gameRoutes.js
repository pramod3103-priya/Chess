const express = require('express');
const router = express.Router();
const {
    createGameREST,
    joinGameREST,
    getGameHistory,
    getGameById,
    getActiveLobbyGames,
    getLeaderboard
} = require('../controllers/gameController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, createGameREST);
router.post('/:roomId/join', optionalAuth, joinGameREST);
router.get('/history', optionalAuth, getGameHistory);
router.get('/lobby', getActiveLobbyGames);
router.get('/leaderboard', getLeaderboard);
router.get('/:roomId', getGameById);

module.exports = router;

