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
        this.announcer = {
            voice: null,
            isAnnouncing: false
        };
        
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeAnnouncer();
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
        
        this.updateTeamPositions();
    }

    initializeEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.readQuestionButton.addEventListener('click', () => this.readCurrentQuestion());
        this.answerButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (!this.isReadingQuestion) {
                    const index = parseInt(button.dataset.index);
                    this.checkAnswer(index);
                }
            });
        });
        // Add these lines in the initializeEventListeners method, right after the existing event listeners
// Around line 49, after the existing button click listeners:

        // Add mouseover event listeners for answer buttons
        this.answerButtons.forEach(button => {
            button.addEventListener('mouseover', () => {
                // Only read the answer if we're not currently reading the question
                if (!this.isReadingQuestion && !this.announcer.isAnnouncing) {
                    const answerText = button.textContent;
                    this.announce(answerText);
                }
            });
        });
    }

    initializeAnnouncer() {
        if (!window.speechSynthesis) {
            console.warn('Speech synthesis not supported in this browser');
            // Fallback to no audio
            this.announce = (text, callback) => {
                console.log('Would speak:', text);
                if (callback) callback();
            };
            return;
        }

        // Set up a deeper voice for the announcer if available
        const voicesChanged = () => {
            const voices = speechSynthesis.getVoices();
            this.announcer.voice = voices.find(voice => voice.name.includes('Male')) || voices[0];
        };

        speechSynthesis.onvoiceschanged = voicesChanged;
        
        // Initial voice load
        voicesChanged();
    }

    announce(text, callback = null) {
        if (!window.speechSynthesis) {
            if (callback) callback();
            return;
        }

        if (this.announcer.isAnnouncing) {
            speechSynthesis.cancel();
        }

        this.announcer.isAnnouncing = true;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.announcer.voice;
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 0.8; // Deeper voice

        utterance.onend = () => {
            this.announcer.isAnnouncing = false;
            if (callback) callback();
        };

        utterance.onerror = () => {
            this.announcer.isAnnouncing = false;
            if (callback) callback();
        };

        try {
            speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('Speech synthesis failed:', e);
            if (callback) callback();
        }
    }

    getGameSituation() {
        let situation = '';
        
        // Field position description
        const fieldPosition = this.fieldPosition;
        if (fieldPosition < 50) {
            situation += `at their own ${fieldPosition}`;
        } else if (fieldPosition === 50) {
            situation += `at midfield`;
        } else {
            situation += `at the opponent's ${100 - fieldPosition}`;
        }

        // Down and distance
        situation = `${this.getDownString()}, and ${this.yardsToGo} ${this.yardsToGo === 1 ? 'yard' : 'yards'} to go, ${situation}.`;
        
        return situation;
    }

    getDownString() {
        const downs = ['First', 'Second', 'Third', 'Fourth'];
        return `${downs[this.currentDown - 1]} down`;
    }

    announceGameSituation(callback = null) {
        const situation = this.getGameSituation();
        this.announce(situation, callback);
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
        this.announce("Welcome to NFL Quiz Football! Let's get this game started!", () => {
            setTimeout(() => {
                this.announceGameSituation(() => {
                    this.displayQuestion();
                });
            }, 500);
        });
        
        this.startButton.style.display = 'none';
        this.readQuestionButton.style.display = 'block';
        this.answerButtons.forEach(button => button.style.display = 'block');
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

        // Read the question after announcing the game situation
        this.readCurrentQuestion();
    }

    readCurrentQuestion() {
        if (this.isReadingQuestion) return;
        
        const question = questions[this.currentQuestion];
        const text = question.question;
        
        this.isReadingQuestion = true;
        this.announce(text, () => {
            this.isReadingQuestion = false;
        });
    }

    announcePlayResult(isCorrect, yards) {
        let announcement = '';
        
        if (isCorrect) {
            const phrases = [
                `Great play! Gains ${yards} yards!`,
                `What a move! Picks up ${yards} yards!`,
                `Excellent execution! ${yards} yard gain!`,
                `Threading the needle for a ${yards} yard gain!`
            ];
            announcement = phrases[Math.floor(Math.random() * phrases.length)];
            
            if (this.fieldPosition >= 100) {
                announcement += " TOUCHDOWN! What an incredible drive!";
            }
        } else {
            const phrases = [
                "The defense holds them for no gain!",
                "Nowhere to go on that play!",
                "The defense saw that one coming!",
                "They'll have to try again after that stop!"
            ];
            announcement = phrases[Math.floor(Math.random() * phrases.length)];
        }
        
        return announcement;
    }

    checkAnswer(answerIndex) {
        const question = questions[this.currentQuestion];
        const isCorrect = answerIndex === question.correctAnswer;
        const yardsGained = isCorrect ? 10 : 0;

        // Announce the result of the play
        this.announce(this.announcePlayResult(isCorrect, yardsGained), () => {
            if (isCorrect) {
                this.handleCorrectAnswer();
            } else {
                this.handleIncorrectAnswer();
            }

            this.currentQuestion++;
            
            // After a short delay, announce the new game situation and display the next question
            setTimeout(() => {
                if (this.currentQuestion < questions.length) {
                    this.announceGameSituation(() => {
                        this.displayQuestion();
                    });
                }
            }, 1500);
        });
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
            this.announce("Turnover on downs! The defense takes over!", () => {
                this.resetDrive();
            });
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

    updateTeamPositions() {
        if (this.playersContainer) {
            // Convert field position to percentage
            let position = this.fieldPosition;
            // Adjust for the endzones (10% each)
            position = (position / 100) * 80 + 10;
            // Set the new position with a smooth transition
            this.playersContainer.style.left = `${position}%`;
        }
    }

    endGame() {
        const finalScore = this.score;
        this.announce(`Game Over! Final Score: ${finalScore} points! Thanks for playing NFL Quiz Football!`, () => {
            this.questionText.textContent = `Game Over! Final Score: ${finalScore}`;
            this.answerButtons.forEach(button => button.style.display = 'none');
            this.readQuestionButton.style.display = 'none';
            this.startButton.style.display = 'block';
            this.startButton.textContent = 'Play Again';
        });
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new NFLQuizGame();
});