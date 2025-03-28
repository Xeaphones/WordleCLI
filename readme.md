# 🟩 Wordle CLI Game

This is a command-line implementation of the popular word-guessing game "Wordle," built in JavaScript (Node.js). The project includes support for multiple game modes, detailed statistics tracking, and persistent scoring.

---

## 🚀 Features

- **Multiple Game Modes**:
  - **Normal Mode**: Classic Wordle gameplay.
  - **Timed Mode**: Score bonus points for quickly guessing the word.
  - **Practice Mode**: Play with unlimited attempts without affecting statistics.

- **Persistent Statistics**:
  - Total games played, total wins, streaks, average attempts, and more.
  - Statistics persist between sessions in a JSON file (`stats.json`).

- **Flexible Setup**:
  - Customizable word length, language, and maximum attempts.

- **Replayability**:
  - Easily replay games directly from the CLI.

---

## ⚙️ Project Structure

```
wordle-game/
├── src/
│   ├── game.js          # Manages game instances, scoring, and stats
│   ├── wordle.js        # Core Wordle game logic
│   └── wordlist/        # Word lists for different languages
│       └── fr.txt       # French wordlist (default)
|       └── en.txt       # English wordlist
├── test/
│   ├── game.test.js     # Tests for Game manager
│   └── wordle.test.js   # Tests for Wordle class
├── cli.js               # Command-line interface
├── stats.json           # Stored player statistics
├── package.json
└── README.md
```

---

## 💻 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14+)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Xeaphones/WordleCLI.git
cd wordle-game
npm install
```

---

## 🎮 How to Play

Run the Wordle game directly from your command line:

```bash
npm run play -- [mode] [language] [maxAttempts]
```

**Parameters:**

- `mode`: *(optional)* Game mode (`normal`, `timed`, `practice`; default is `normal`).
- `language`: *(optional)* Language of the word list (`fr` by default).
- `maxAttempts`: *(optional)* Maximum guesses allowed (default is `6`).

**Examples:**

```bash
# Start a default game (French, normal mode)
npm run play

# Play timed mode in English with 6 max attempts
npm run play -- timed en 6

# Start a practice session
npm run play -- practice
```

---

## 🧪 Running Tests

The project includes comprehensive Jest tests. Run the tests with:

```bash
npm run test
```

Ensure all tests pass to confirm everything is functioning correctly.

---

## 📈 Player Statistics

Player statistics (`stats.json`) include:

- Total games played
- Total wins
- Current win streak
- Best win streak
- Average attempts per game
- Total score

Statistics are automatically saved and loaded between games.

---