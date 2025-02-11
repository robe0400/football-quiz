class NFLQuizGame {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.yards = 20;
        this.currentDown = 1;
        this.yardsToGo = 10;
        this.fieldPosition = 20;
        this.possession = true;
        this.isReadingQuestion = false;
        
        // Remove sound manager initialization
        
        this.initializeElements();
        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        this.questionText = document.getElementById('question-text');
        this.answerButtons = document.querySelectorAll('.answer-btn');
        this.startButton = document.getElementById('start-game');
        this.readQuestionButton = document.getElementById('read-question');
        this.playersContainer = document.getElementById('players-container');
        this.offensiveTeam = document.getElementById('offensive-team');
        this.defensiveTeam = document.getElementById('defensive-team');
        this.ballSprite = document.getElementById('ball-sprite');
        this.scoreDisplay = document.getElementById('score');
        this.downDisplay = document.getElementById('current-down');
        this.yardsToGoDisplay = document.getElementById('yards-to-go');
        this.fieldPositionDisplay = document.getElementById('field-position');
        
        // Initial position
        this.updateTeamPositions();
    }

    updateTeamPositions() {
        // Convert yard line to percentage of field width
        const fieldPercentage = (this.yards / 100) * 80; // 80% is playing field width
        this.playersContainer.style.left = `${fieldPercentage}%`;
    }

    initializeEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.readQuestionButton.addEventListener('click', () => this.readCurrentQuestion());
        
        this.answerButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const answerIndex = parseInt(e.target.dataset.index);
                this.checkAnswer(answerIndex);
            });
        });
    }

    startGame() {
        this.currentQuestion = 0;
        this.score = 0;
        this.yards = 20;
        this.currentDown = 1;
        this.yardsToGo = 10;
        this.fieldPosition = 20;
        this.possession = true;
        
        this.updateDisplay();
        this.displayQuestion();
        
        this.startButton.style.display = 'none';
        this.readQuestionButton.style.display = 'block';
    }

    displayQuestion() {
        if (this.currentQuestion >= questions.length) {
            this.endGame();
            return;
        }

        const question = questions[this.currentQuestion];
        this.questionText.textContent = question.question;
        
        question.answers.forEach((answer, index) => {
            this.answerButtons[index].textContent = answer;
            this.answerButtons[index].disabled = false;
        });

        this.readCurrentQuestion();
    }

    readCurrentQuestion() {
        if (this.isReadingQuestion) return;
        
        const question = questions[this.currentQuestion];
        const text = question.question;
        
        // Removed text-to-speech functionality
        console.log("Reading question:", text);
    }

    checkAnswer(answerIndex) {
        const question = questions[this.currentQuestion];
        const isCorrect = answerIndex === question.correctAnswer;

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }

        this.currentQuestion++;
        setTimeout(() => this.displayQuestion(), 1500);
    }

    handleCorrectAnswer() {
        // Gain yards
        this.yards += 10;
        this.fieldPosition += 10;
        this.score += 7;
        
        if (this.fieldPosition >= 100) {
            // Touchdown!
            this.score += 7;
            this.resetDrive();
        } else {
            this.yardsToGo -= 10;
            if (this.yardsToGo <= 0) {
                this.currentDown = 1;
                this.yardsToGo = 10;
            } else {
                this.currentDown++;
            }
        }
        
        this.updateDisplay();
        this.updateTeamPositions();
    }

    handleIncorrectAnswer() {
        this.currentDown++;
        if (this.currentDown > 4) {
            this.resetDrive();
        }
        this.updateDisplay();
    }

    resetDrive() {
        this.yards = 20;
        this.fieldPosition = 20;
        this.currentDown = 1;
        this.yardsToGo = 10;
        this.updateTeamPositions();
    }

    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.downDisplay.textContent = this.currentDown;
        this.yardsToGoDisplay.textContent = this.yardsToGo;
        this.fieldPositionDisplay.textContent = `Own ${this.fieldPosition}`;
    }

    endGame() {
        this.questionText.textContent = `Game Over! Final Score: ${this.score}`;
        this.answerButtons.forEach(button => button.style.display = 'none');
        this.readQuestionButton.style.display = 'none';
        this.startButton.style.display = 'block';
        this.startButton.textContent = 'Play Again';
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new NFLQuizGame();
});