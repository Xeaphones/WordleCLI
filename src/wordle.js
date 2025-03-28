const fs = require('fs');
const path = require('path');

class Wordle {
    constructor(targetWord = null, maxAttempts = 6, language = 'fr') {
        if (targetWord !== null && (typeof targetWord !== 'string' || targetWord.length === 0)) {
            throw new Error('Target word should be a non-empty string');
        }

        this.wordList = this.loadWordList(language);
        if (targetWord !== null && !this.wordList.includes(targetWord.toLowerCase())) {
            throw new Error('Target word is not in the word list');
        }

        if (targetWord === null) {
            targetWord = this.getRandomWord()
        }

        this.targetWord = targetWord.toLowerCase();
        this.maxAttempts = maxAttempts;
        this.attempts = 0;
        this.completed = false;
    }

    
    guess(word) {
        if (this.completed) {
            throw new Error('Game already completed.');
        }

        if (!word || typeof word !== 'string' || word.length === 0) {
            throw new Error('Guess must be a non-empty string');
        }

        if (word.length !== this.targetWord.length) {
            throw new Error(`Guess must be exactly ${this.targetWord.length} letters.`);
        }

        word = word.toLowerCase();
        if (!this.wordList.includes(word)) {
            throw new Error('Guess is not a valid word');
        }
        
        this.attempts++;

        // result: 1 = correct, 0 = present but misplaced, -1 = absent
        const result = Array(this.targetWord.length).fill(-1);
        const targetLetters = this.targetWord.split('');

        for (let i = 0; i < word.length; i++) {
            if (word[i] === targetLetters[i]) {
                result[i] = 1;
                targetLetters[i] = null;
            }
        }

        for (let i = 0; i < word.length; i++) {
            if (result[i] === 1) continue;

            const index = targetLetters.indexOf(word[i]);
            if (index !== -1) {
                result[i] = 0;
                targetLetters[index] = null;
            }
        }

        if (word === this.targetWord || this.attempts >= this.maxAttempts) {
            this.completed = true;
        }

        return {
            result,
            attempts: this.attempts,
            completed: this.completed,
            success: word === this.targetWord
        }
    }

    loadWordList(language) {
        const filePath = path.join(__dirname, `wordlist/${language}.txt`);
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return data.split(/\r?\n/).map(word => word.toLowerCase());
        } catch (err) {
            throw new Error(`Could not load word list for language: ${language}`);
        }
    }

    getRandomWord() {
        return this.wordList[Math.floor(Math.random() * this.wordList.length)];
    }
}

module.exports = Wordle;