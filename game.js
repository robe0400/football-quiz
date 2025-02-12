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

            // Add touch handlers for reading answers
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.isReadingQuestion && !this.announcer.isAnnouncing) {
                    const answerText = button.textContent;
                    this.announce(answerText);
                    button.classList.add('touch-active');
                }
            });

            button.addEventListener('touchend', () => {
                button.classList.remove('touch-active');
            });

            button.addEventListener('mouseover', () => {
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
            return;
        }

        // Initialize speech synthesis for iOS
        const initSpeechForIOS = () => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance('');
            utterance.volume = 0;
            window.speechSynthesis.speak(utterance);
        };

        // Set up voice with proper language settings
        const voicesChanged = () => {
            const voices = window.speechSynthesis.getVoices();
            
            // First try to find an English US voice
            this.announcer.voice = voices.find(voice => 
                voice.lang === 'en-US' || voice.lang === 'en-GB'
            );
            
            // Fallback to any available voice if no English voice found
            if (!this.announcer.voice) {
                this.announcer.voice = voices[0];
            }

            console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
            console.log('Selected voice:', this.announcer.voice);
        };

        // Handle iOS specific initialization
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            document.addEventListener('touchstart', initSpeechForIOS, { once: true });
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    initSpeechForIOS();
                }
            });
        }

        // Set up voices changed event handler
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = voicesChanged;
        }
        
        voicesChanged();
    }

    announce(text, callback = null) {
        if (!window.speechSynthesis) {
            if (callback) callback();
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create and configure utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.announcer.voice;
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Set up event handlers
        utterance.onend = () => {
            this.announcer.isAnnouncing = false;
            if (callback) callback();
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.announcer.isAnnouncing = false;
            if (callback) callback();
        };

        // For iOS, handle speech in chunks
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            let currentSentence = 0;

            const speakNextSentence = () => {
                if (currentSentence < sentences.length) {
                    const sentenceUtterance = new SpeechSynthesisUtterance(sentences[currentSentence]);
                    sentenceUtterance.voice = this.announcer.voice;
                    sentenceUtterance.lang = 'en-US';
                    sentenceUtterance.rate = 0.9;
                    sentenceUtterance.pitch = 1.0;
                    sentenceUtterance.volume = 1.0;

                    sentenceUtterance.onend = () => {
                        currentSentence++;
                        speakNextSentence();
                    };

                    sentenceUtterance.onerror = (event) => {
                        console.error('Speech synthesis error:', event);
                        currentSentence++;
                        speakNextSentence();
                    };

                    window.speechSynthesis.speak(sentenceUtterance);
                } else {
                    this.announcer.isAnnouncing = false;
                    if (callback) callback();
                }
            };

            speakNextSentence();
        } else {
            window.speechSynthesis.speak(utterance);
        }

        this.announcer.isAnnouncing = true;
    }

    getGameSituation() {
        let situation = '';
        
        const fieldPosition = this.fieldPosition;
        if (fieldPosition < 50) {
            situation += `at their own ${fieldPosition}`;
        } else if (fieldPosition === 50) {
            situation += `at midfield`;
        } else {
            situation += `at the opponent's ${100 - fieldPosition}`;
        }

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
        this.questionText.innerHTML = question.question;
        
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

        this.announce(this.announcePlayResult(isCorrect, yardsGained), () => {
            if (isCorrect) {
                this.handleCorrectAnswer();
            } else {
                this.handleIncorrectAnswer();
            }

            this.currentQuestion++;
            
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
        this.yards += 10;
        this.fieldPosition += 10;
        this.score += 7;
        
        if (this.fieldPosition >= 100) {
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
            let position = this.fieldPosition;
            position = (position / 100) * 80 + 10;
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