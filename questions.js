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
        
        // Initialize sound manager
        this.soundManager = new SoundManager();
        
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
            button.addEventListener('click', (e) => this.handleAnswer(e));
            button.addEventListener('mouseover', (e) => this.handleAnswerHover(e));
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
        this.updateTeamPositions();
        
        this.soundManager.speak("Welcome to NFL Quiz! Let's play some football!", () => {
            this.displayQuestion();
        });
    }

    displayQuestion() {
        const question = questions[this.currentQuestion];
        this.questionText.textContent = question.question;
        
        this.answerButtons.forEach((button, index) => {
            button.textContent = question.answers[index];
            button.style.display = 'block';
        });
        
        this.readCurrentQuestion();
    }

    readCurrentQuestion() {
        this.isReadingQuestion = true;
        const downAnnouncement = `${this.getDownAnnouncement()}. ${this.getFieldPositionAnnouncement()}`;
        const question = questions[this.currentQuestion];
        
        this.soundManager.speak(downAnnouncement + ' ' + question.question, () => {
            this.isReadingQuestion = false;
        });
    }

    handleAnswerHover(e) {
        if (!this.isReadingQuestion && !this.soundManager.isPlaying) {
            this.soundManager.speak(e.target.textContent);
        }
    }

    getDownAnnouncement() {
        const downs = ['First', 'Second', 'Third', 'Fourth'];
        return `${downs[this.currentDown - 1]} down and ${this.yardsToGo}`;
    }

    getFieldPositionAnnouncement() {
        if (this.yards >= 50) {
            return `Ball on the opponent's ${100 - this.yards} yard line`;
        } else {
            return `Ball on their own ${this.yards} yard line`;
        }
    }

    async handleAnswer(e) {
        if (this.isReadingQuestion || this.soundManager.isPlaying) {
            return;
        }

        const selectedAnswer = parseInt(e.target.dataset.index);
        const question = questions[this.currentQuestion];
        
        if (selectedAnswer === question.correctAnswer) {
            await this.handleCorrectAnswer();
        } else {
            await this.handleIncorrectAnswer();
        }
    }

    async handleCorrectAnswer() {
        const yardsGained = Math.floor(Math.random() * 15) + 5;
        this.yards += yardsGained;
        
        // Animate the play
        await this.animatePlay(yardsGained);
        
        if (this.yards >= 100) {
            this.score += 7;
            this.soundManager.speak("TOUCHDOWN! What a play! That's 7 points on the board!", () => {
                this.yards = 20;
                this.currentDown = 1;
                this.yardsToGo = 10;
                this.nextQuestion();
            });
        } else {
            if (yardsGained >= this.yardsToGo) {
                this.currentDown = 1;
                this.yardsToGo = 10;
                this.soundManager.speak(`Gain of ${yardsGained} yards! That's a FIRST DOWN!`, () => {
                    this.nextQuestion();
                });
            } else {
                this.yardsToGo -= yardsGained;
                this.soundManager.speak(`Gain of ${yardsGained} yards! ${this.getDownAnnouncement()} coming up.`, () => {
                    this.nextQuestion();
                });
            }
        }
        
        this.updateDisplay();
        this.updateTeamPositions();
    }

    async animatePlay(yardsGained) {
        return new Promise(resolve => {
            // Add animation classes
            this.offensiveTeam.classList.add('play-action');
            this.defensiveTeam.classList.add('play-action');
            this.ballSprite.classList.add('ball-snap');
            
            setTimeout(() => {
                // Remove animation classes
                this.offensiveTeam.classList.remove('play-action');
                this.defensiveTeam.classList.remove('play-action');
                this.ballSprite.classList.remove('ball-snap');
                resolve();
            }, 1000);
        });
    }

    async handleIncorrectAnswer() {
        this.currentDown++;
        
        await this.animatePlay(0);
        
        if (this.currentDown > 4) {
            this.soundManager.speak("Incorrect. Turnover on downs!", () => {
                this.currentDown = 1;
                this.yards = 20;
                this.yardsToGo = 10;
                this.nextQuestion();
            });
        } else {
            this.soundManager.speak(`Incorrect. No gain on the play. ${this.getDownAnnouncement()} coming up.`, () => {
                this.nextQuestion();
            });
        }
        
        this.updateDisplay();
        this.updateTeamPositions();
    }

    nextQuestion() {
        this.currentQuestion++;
        if (this.currentQuestion < questions.length) {
            this.displayQuestion();
        } else {
            this.endGame();
        }
    }

    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.downDisplay.textContent = this.currentDown;
        this.yardsToGoDisplay.textContent = this.yardsToGo;
        this.fieldPositionDisplay.textContent = this.yards >= 50 ? 
            `Opponent ${100 - this.yards}` : `Own ${this.yards}`;
    }

    endGame() {
        this.questionText.textContent = `Game Over! Final Score: ${this.score}`;
        this.answerButtons.forEach(button => {
            button.style.display = 'none';
        });
        
        let endGameMessage = `Final whistle! `;
        if (this.score > 28) {
            endGameMessage += `Outstanding performance! You put up ${this.score} points!`;
        } else if (this.score > 14) {
            endGameMessage += `Solid game! You finished with ${this.score} points!`;
        } else {
            endGameMessage += `Tough game today. You finished with ${this.score} points.`;
        }
        
        this.soundManager.speak(endGameMessage);
    }
}

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new NFLQuizGame();
});
