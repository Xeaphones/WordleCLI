const Wordle = require('../src/wordle');
const fs = require('fs');
const path = require('path');

jest.mock('fs');

const wordList = ['hello', 'world', 'test', 'jest', 'raftv', 'node', 'wordle', 'lleoh', 'heoll'];

beforeAll(() => {
    fs.readFileSync.mockReturnValue(wordList.join('\n'));
});

describe('Wordle', () => {
   let wordle;
   
    beforeEach(() => {
        wordle = new Wordle('hello', 3, 'en');
    });

    test('should throw an error if the target word is invalid', () => {
        expect(() => new Wordle('')).toThrow('Target word should be a non-empty string');
        expect(() => new Wordle(123)).toThrow('Target word should be a non-empty string');
    })

    test('should throw an error if the target word is not in the word list', () => {
        expect(() => new Wordle('invalid')).toThrow('Target word is not in the word list');
    });

    test('should throw an error if the guessed word is invalid', () => {
        expect(() => wordle.guess()).toThrow('Guess must be a non-empty string');
        expect(() => wordle.guess(12345)).toThrow('Guess must be a non-empty string');
        expect(() => wordle.guess('')).toThrow('Guess must be a non-empty string');
    });

    test('should throw an error if the guessed word is of invalid length', () => {
        expect(() => wordle.guess('hi')).toThrow();
        expect(() => wordle.guess('helloo')).toThrow();
    });

    test('should throw an error if the guessed word is not a valid word', () => {
        expect(() => wordle.guess('inval')).toThrow('Guess is not a valid word');
    });

    test('correct guess', () => {
        const result = wordle.guess('hello');
        expect(result.result).toEqual([1, 1, 1, 1, 1]);
        expect(result.completed).toBe(true);
        expect(result.success).toBe(true);
    });

    test('guess with all letters present but in wrong order', () => {
        const result = wordle.guess('lleoh');
        expect(result.result).toEqual([0, 0, 0, 0, 0]);
        expect(result.completed).toBe(false);
        expect(result.success).toBe(false);
    });

    test('guess with only bad letters', () => {
        const result = wordle.guess('raftv');
        expect(result.result).toEqual([-1, -1, -1, -1, -1]);
        expect(result.completed).toBe(false);
        expect(result.success).toBe(false);
    });

    test('mixed guess', () => {
        const result = wordle.guess('world');
        expect(result.result).toEqual([-1, 0, -1, 1, -1]);
        expect(result.completed).toBe(false);
        expect(result.success).toBe(false);
    });

    test('handle duplicate letters', () => {
        const result = wordle.guess('heoll');
        expect(result.result).toEqual([1, 1, 0, 1, 0]);
        expect(result.completed).toBe(false);
        expect(result.success).toBe(false);
    });

    test('should complete after max attempts', () => {
        wordle.guess('world');
        wordle.guess('world');
        const result = wordle.guess('world');
        expect(result.completed).toBe(true);
        expect(result.success).toBe(false);
        expect(() => wordle.guess('world')).toThrow('Game already completed.');
    });

    test('should throw an error if language is not supported', () => {
        fs.readFileSync.mockImplementationOnce(() => {
            throw new Error('File not found');
        });
        const language = 'es';
        expect(() => new Wordle('hello', 3, 'es')).toThrow(`Could not load word list for language: ${language}`);
    });

    test('should load a random word from the word list', () => {
        const chosenWords = new Set();
        for (let i = 0; i < 10; i++) {
            const wordle = new Wordle();
            expect(wordList).toContain(wordle.targetWord);
            chosenWords.add(wordle.targetWord);
        }
        expect(chosenWords.size).toBeGreaterThan(1);
    });

    test('should correctly use default parameters', () => {
        const wordle = new Wordle();
        expect(wordle.maxAttempts).toBe(6);
        expect(wordle.wordList).toEqual(expect.arrayContaining(wordList));
        expect(wordList).toContain(wordle.targetWord);
    });
});
