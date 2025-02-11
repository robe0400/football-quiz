class NFLQuizGame {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.yards = 20;
        this.currentDown = 1;
        this.yardsToGo = 10;
        this.fieldPosition = 20;
        this.possession = true;
        
        // Initialize speech synthesis
        this.synthesis = window.speechSynthesis;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        this.questionText = document.getElementById('question-text');
        this.answerButtons = document.querySelectorAll('.answer-btn');
        this.startButton = document.getElementById('start-game');
        this.readQuestionButton = document.getElementById('read-question');
        this.ballSprite = document.getElementById('ball-sprite');
        this.scoreDisplay = document.getElementById('score');
        this.downDisplay = document.getElementById('current-down');
        this.yardsToGoDisplay = document.getElementById('yards-to-go');
        this.fieldPositionDisplay = document.getElementById('field-position');
    }

    initializeEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.readQuestionButton.addEventListener('click', () => this.readCurrentQuestion());
        
        this.answerButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleAnswer(e));
            button.addEventListener('mouseover', (e) => this.readAnswer(e));
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
        this.announceGameStart();
    }

    announceGameStart() {
        const utterance = new SpeechSynthesisUtterance("Welcome to NFL Quiz! Let's play football!");
        this.synthesis.speak(utterance);
    }

    displayQuestion() {
        const question = questions[this.currentQuestion];
        this.questionText.textContent = question.question;
        
        this.answerButtons.forEach((button, index) => {
            button.textContent = question.answers[index];
        });
        
        this.readCurrentQuestion();
    }

    readCurrentQuestion() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        const question = questions[this.currentQuestion];
        const utterance = new SpeechSynthesisUtterance(question.question);
        utterance.rate = 0.9;
        this.synthesis.speak(utterance);
    }

    readAnswer(e) {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(e.target.textContent);
        utterance.rate = 1;
        this.synthesis.speak(utterance);
    }

    handleAnswer(e) {
        const selectedAnswer = parseInt(e.target.dataset.index);
        const question = questions[this.currentQuestion];
        
        if (selectedAnswer === question.correctAnswer) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
        
        this.currentQuestion++;
        if (this.currentQuestion < questions.length) {
            this.displayQuestion();
        } else {
            this.endGame();
        }
    }

    handleCorrectAnswer() {
        const yardsGained = Math.floor(Math.random() * 15) + 5; // 5-20 yards
        this.yards += yardsGained;
        this.score += 7;
        
        if (this.yards >= 100) {
            // Touchdown!
            const utterance = new SpeechSynthesisUtterance("Touchdown! Great job!");
            this.synthesis.speak(utterance);
            this.yards = 20;
        } else {
            const utterance = new SpeechSynthesisUtterance(`Correct! Gained ${yardsGained} yards!`);
            this.synthesis.speak(utterance);
        }
        
        this.updateDisplay();
    }

    handleIncorrectAnswer() {
        this.currentDown++;
        if (this.currentDown > 4) {
            // Turnover on downs
            this.currentDown = 1;
            this.yards = 20;
            const utterance = new SpeechSynthesisUtterance("Incorrect. Turnover on downs!");
            this.synthesis.speak(utterance);
        } else {
            const utterance = new SpeechSynthesisUtterance("Incorrect. Try again!");
            this.synthesis.speak(utterance);
        }
        this.updateDisplay();
    }

    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.downDisplay.textContent = this.currentDown;
        this.yardsToGoDisplay.textContent = this.yardsToGo;
        this.fieldPositionDisplay.textContent = `Own ${this.yards}`;
    }

    endGame() {
        this.questionText.textContent = `Game Over! Final Score: ${this.score}`;
        this.answerButtons.forEach(button => {
            button.style.display = 'none';
        });
        const utterance = new SpeechSynthesisUtterance(`Game Over! Final Score: ${this.score} points!`);
        this.synthesis.speak(utterance);
    }
}

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new NFLQuizGame();
});
