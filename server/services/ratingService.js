/**
 * Elo Rating Service
 * Computes standard FIDE-style Elo rating updates.
 */

const DEFAULT_K = 32;

/**
 * Calculate expected score of player A against player B
 * Ea = 1 / (1 + 10^((Rb - Ra) / 400))
 */
function getExpectedScore(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ratings after a match
 * @param {number} ratingA - Current rating of player A
 * @param {number} ratingB - Current rating of player B
 * @param {number} scoreA - 1 for A wins, 0.5 for draw, 0 for A loses
 * @param {number} kFactor - K-factor (default 32)
 * @returns {{ newRatingA: number, newRatingB: number, deltaA: number, deltaB: number }}
 */
function calculateElo(ratingA, ratingB, scoreA, kFactor = DEFAULT_K) {
    const expectedA = getExpectedScore(ratingA, ratingB);
    const expectedB = 1 - expectedA;

    const scoreB = 1 - scoreA;

    const deltaA = Math.round(kFactor * (scoreA - expectedA));
    const deltaB = Math.round(kFactor * (scoreB - expectedB));

    return {
        newRatingA: Math.max(100, ratingA + deltaA),
        newRatingB: Math.max(100, ratingB + deltaB),
        deltaA,
        deltaB
    };
}

module.exports = {
    getExpectedScore,
    calculateElo
};

