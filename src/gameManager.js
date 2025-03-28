const Wordle = require('./wordle');
const fs = require('fs');
const path = require('path');

const Mode = {
    NORMAL: 'normal',
    TIMED: 'timed',
    PRACTICE: 'practice',
};

class GameManager {
    constructor(language = 'fr') {
        this.language = language;

        let stats = this.loadStats();
        if (!stats) {
            stats = {
                totalGames: 0,
                totalWins: 0,
                totalScore: 0,
                totalAttempts: 0,
                averageAttempts: 0,
                currentStreak: 0,
                bestStreak: 0
            };
        }

        this.stats = stats;
        this.games = [];
    }

    startNewGame(mode = Mode.NORMAL, maxAttempts = 6, targetWord = null) {
        if (mode === Mode.PRACTICE) {
            maxAttempts = 999;
        }

        const gameInstance = new Wordle(targetWord, maxAttempts, this.language);
        const newGame = {
            instance: gameInstance,
            mode,
            startTime: Date.now(),
            endTime: null,
            completed: false,
            score: 0
        };
        this.games.push(newGame);
        return newGame;
    }

    finishGame(game, won) {
        game.completed = true;
        game.endTime = Date.now();
        const duration = (game.endTime - game.startTime) / 1000;

        if (game.mode === Mode.PRACTICE) {
            return -1;
        }

        let score = 0;
        if (won) {
            const attemptFactor = (game.instance.maxAttempts - game.instance.attempts + 1);
            score = attemptFactor * 100;

            if (game.mode === Mode.TIMED) {
                score += Math.max(0, 500 - duration * 10);
            }

            this.stats.totalWins++;
            this.stats.currentStreak++;
            if (this.stats.currentStreak > this.stats.bestStreak) {
                this.stats.bestStreak = this.stats.currentStreak;
            }
        } else {
            this.stats.currentStreak = 0;
        }

        game.score = Math.round(score);

        this.stats.totalScore += game.score;
        this.stats.totalGames++;
        this.stats.totalAttempts += game.instance.attempts;
        this.stats.averageAttempts = +(this.stats.totalAttempts / this.stats.totalGames).toFixed(2);

        this.saveStats();

        return game.score;
    }

    getStats() {
        return { ...this.stats };
    }

    loadStats() {
        const statsPath = path.join(__dirname, '../stats.json');
        if (fs.existsSync(statsPath)) {
            const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
            return stats;
        }
        return null;
    }

    saveStats() {
        const statsPath = path.join(__dirname, '../stats.json');
        try {
            fs.writeFileSync(statsPath, JSON.stringify(this.stats, null, 2), 'utf8');
        } catch (err) {
            console.error('Failed to save stats:', err);
        }
    }
}

module.exports = {
    GameManager,
    Mode
}