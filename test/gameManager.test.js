const { GameManager, Mode } = require('../src/gameManager');
const Wordle = require('../src/wordle');
const fs = require('fs');
const path = require('path');

jest.mock('fs');
jest.mock('../src/wordle');

describe('Game Manager', () => {
    let gameManager;
    const mockStatsPath = path.join(__dirname, '../stats.json');
    const wordleMockInstance = {
        guess: jest.fn(),
        maxAttempts: 6,
        attempts: 3,
        targetWord: 'hello'
    };

    beforeEach(() => {
        fs.existsSync.mockClear();
        fs.readFileSync.mockClear();
        fs.writeFileSync.mockClear();
    
        Wordle.mockImplementation(() => wordleMockInstance);
    
        fs.existsSync.mockReturnValue(false);
        gameManager = new GameManager('en');
    });

    test('initializes with default stats if no stats file exists', () => {
        expect(gameManager.stats).toEqual({
            totalGames: 0,
            totalWins: 0,
            totalScore: 0,
            totalAttempts: 0,
            averageAttempts: 0,
            currentStreak: 0,
            bestStreak: 0
        });
    });


    test('loads existing stats if stats file exists', () => {
        const existingStats = {
            totalGames: 5,
            totalWins: 3,
            totalScore: 450,
            totalAttempts: 20,
            averageAttempts: 4,
            currentStreak: 2,
            bestStreak: 4
        };
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(JSON.stringify(existingStats));

        gameManager = new GameManager('en');

        expect(gameManager.stats).toEqual(existingStats);
    });

    test('starts a new game correctly in NORMAL mode', () => {
        const game = gameManager.startNewGame(Mode.NORMAL, 6, 'hello');
        expect(game.instance).toBeDefined();
        expect(game.mode).toBe(Mode.NORMAL);
        expect(game.completed).toBe(false);
        expect(game.score).toBe(0);
        expect(Wordle).toHaveBeenCalledWith('hello', 6, 'en');
    });

    test('handles PRACTICE mode with unlimited attempts', () => {
        const game = gameManager.startNewGame(Mode.PRACTICE);
        expect(Wordle).toHaveBeenCalledWith(null, 999, 'en');
        expect(game.mode).toBe(Mode.PRACTICE);
    });

    test('calculates score correctly for winning NORMAL mode game', () => {
        const game = gameManager.startNewGame(Mode.NORMAL, 6);
        game.instance.attempts = 2; // Player won on 2nd attempt
        const score = gameManager.finishGame(game, true);

        expect(score).toBe(500); // (6 - 2 + 1) * 100
        expect(game.completed).toBe(true);
        expect(gameManager.stats.totalWins).toBe(1);
        expect(gameManager.stats.currentStreak).toBe(1);
        expect(gameManager.stats.bestStreak).toBe(1);
    });

    test('calculates score correctly for losing NORMAL mode game', () => {
        const game = gameManager.startNewGame(Mode.NORMAL, 6);
        game.instance.attempts = 6;
        const score = gameManager.finishGame(game, false);

        expect(score).toBe(0);
        expect(gameManager.stats.currentStreak).toBe(0);
    });

    test('calculates score correctly in TIMED mode with quick finish', () => {
        const game = gameManager.startNewGame(Mode.TIMED, 6);
        game.startTime -= 15000; // simulate 15 seconds elapsed
        game.instance.attempts = 3;

        const score = gameManager.finishGame(game, true);
        
        const baseScore = (6 - 3 + 1) * 100; // 400
        const timedBonus = Math.max(0, 500 - 15 * 10); // 350
        expect(score).toBe(baseScore + timedBonus); // 750
    });

    test('updates average attempts correctly after multiple games', () => {
        let game = gameManager.startNewGame(Mode.NORMAL, 6);
        game.instance.attempts = 3;
        gameManager.finishGame(game, true);

        game = gameManager.startNewGame(Mode.NORMAL, 6);
        game.instance.attempts = 5;
        gameManager.finishGame(game, true);

        expect(gameManager.stats.totalGames).toBe(2);
        expect(gameManager.stats.totalAttempts).toBe(8);
        expect(gameManager.stats.averageAttempts).toBe(4);
    });


    test('does not count practice mode towards statistics', () => {
        const game = gameManager.startNewGame(Mode.PRACTICE);
        game.instance.attempts = 10;
        const score = gameManager.finishGame(game, true);

        expect(score).toBe(-1);
        expect(gameManager.stats.totalGames).toBe(0);
    });
    String
    test('saves stats to file after finishing game', () => {
        const game = gameManager.startNewGame(Mode.NORMAL, 6);
        game.instance.attempts = 4;
        gameManager.finishGame(game, true);

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            mockStatsPath,
            JSON.stringify({
                totalGames: 1,
                totalWins: 1,
                totalScore: 300,
                totalAttempts: 4,
                averageAttempts: 4,
                currentStreak: 1,
                bestStreak: 1
            }, null, 2),
            'utf8'
        );
    });

    test('no negative timed bonus for slow game completion', () => {
        const game = gameManager.startNewGame(Mode.TIMED, 6);
        game.startTime -= 100000; // Simulate a long duration (e.g., 100 seconds)
        game.instance.attempts = 2;
    
        const score = gameManager.finishGame(game, true);
    
        const baseScore = (6 - 2 + 1) * 100; // 500
        const timedBonus = Math.max(0, 500 - 100 * 10); // Should be 0
        expect(score).toBe(baseScore); // Expect only baseScore
    });
    
    test('handles streak resets correctly', () => {
        // First game won
        let game = gameManager.startNewGame(Mode.NORMAL, 6);
        game.instance.attempts = 2;
        gameManager.finishGame(game, true);
    
        expect(gameManager.stats.currentStreak).toBe(1);
        expect(gameManager.stats.bestStreak).toBe(1);
    
        // Second game lost
        game = gameManager.startNewGame(Mode.NORMAL, 6);
        game.instance.attempts = 6;
        gameManager.finishGame(game, false);
    
        expect(gameManager.stats.currentStreak).toBe(0);
        expect(gameManager.stats.bestStreak).toBe(1);
    
        // Third game won again
        game = gameManager.startNewGame(Mode.NORMAL, 6);
        game.instance.attempts = 3;
        gameManager.finishGame(game, true);
    
        expect(gameManager.stats.currentStreak).toBe(1);
        expect(gameManager.stats.bestStreak).toBe(1); // Should not change
    });

    test('handles corrupted stats file gracefully', () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue('invalid json');
    
        expect(() => new Game('en')).toThrow();
    });    
});
