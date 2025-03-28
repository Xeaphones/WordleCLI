const readline = require('readline');
const { GameManager, Mode } = require('./src/gameManager');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const mode = process.argv[2] || 'normal';
const language = process.argv[3] || 'fr';
const maxAttempts = parseInt(process.argv[4], 10) || 6;

const gameManager = new GameManager(language);

function startGame() {
  const currentGame = gameManager.startNewGame(mode, maxAttempts);
  const word = currentGame.instance.targetWord;

  console.debug(`\nWord: ${word}`);
  if (currentGame.mode !== Mode.PRACTICE) {
    console.log(`\nNew game started! Word length: ${word.length}, Language: ${language}, Mode: ${mode}, Max attempts: ${maxAttempts}`);
  } else {
    console.log(`\nNew game started! Word length: ${word.length}, Language: ${language}, Mode: ${mode}`);
  }

  function promptGuess() {
    let question = ""
    if (currentGame.mode !== Mode.PRACTICE) {
        question = `Attempt ${currentGame.instance.attempts + 1}/${maxAttempts} - Enter your guess: `;
    } else {
        question = `Attempt ${currentGame.instance.attempts + 1} - Enter your guess: `;
    }
    rl.question(question, (guess) => {
      try {
        const { result, success, completed } = currentGame.instance.guess(guess);
        console.log(`Result: ${result.map(r => r === 1 ? '🟩' : r === 0 ? '🟨' : '⬛').join('')}`);

        if (completed) {
          const score = gameManager.finishGame(currentGame, success);
          if (success) {
            console.log(`🎉 Congratulations! You found the word '${word}' in ${currentGame.instance.attempts} attempts.`);
          } else {
            console.log(`💥 Game over! The correct word was '${word}'.`);
          }
          if (currentGame.mode === Mode.TIMED) {
            console.log(`Time taken: ${(currentGame.endTime - currentGame.startTime) / 1000} seconds`);
          }
          if (currentGame.mode !== Mode.PRACTICE) {
            console.log(`Your score: ${score}`);
          }

          rl.question('\nWould you like to play again? (y/n): ', (answer) => {
            if (answer.trim().toLowerCase() === 'y') {
              startGame();
            } else {
              console.log('Thanks for playing!');
              rl.close();
            }
          });
        } else {
          promptGuess();
        }
      } catch (error) {
        console.log(`Error: ${error.message}`);
        promptGuess();
      }
    });
  }

  promptGuess();
}

startGame();
