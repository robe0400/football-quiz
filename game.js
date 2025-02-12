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
            // Click handler for answer selection
            button.addEventListener('click', () => {
                if (!this.isReadingQuestion) {
                    const index = parseInt(button.dataset.index);
                    this.checkAnswer(index);
                }
            });

            // Touch handlers for reading answers
            button.addEventListener('touchstart', (e) => {
                // Prevent the default touch behavior
                e.preventDefault();
                
                // Only read if we're not already reading something
                if (!this.isReadingQuestion && !this.announcer.isAnnouncing) {
                    const answerText = button.textContent;
                    this.announce(answerText);
                    
                    // Add visual feedback
                    button.classList.add('touch-active');
                }
            });

            button.addEventListener('touchend', () => {
                button.classList.remove('touch-active');
            });

            // Keep existing mouseover handler for desktop users
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
            // Fallback to no audio
            this.announce = (text, callback) => {
                console.log('Would speak:', text);
                if (callback) callback();
            };
            return;
        }
    
        // Set up voice with proper language settings
        const voicesChanged = () => {
            const voices = speechSynthesis.getVoices();
            // First try to find an English US male voice
            this.announcer.voice = voices.find(voice => 
                voice.name.includes('Male') && 
                (voice.lang === 'en-US' || voice.lang === 'en-GB')
            );
            
            // If no male voice found, try any English voice
            if (!this.announcer.voice) {
                this.announcer.voice = voices.find(voice => 
                    voice.lang === 'en-US' || voice.lang === 'en-GB'
                );
            }
            
            // Fallback to any available voice if no English voice found
            if (!this.announcer.voice) {
                this.announcer.voice = voices[0];
            }
        };
    
        speechSynthesis.onvoiceschanged = voicesChanged;
        voicesChanged();
    
        // iOS requires user interaction before playing audio
        document.addEventListener('touchstart', () => {
            // Create and play a silent audio context to enable audio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const silentBuffer = audioContext.createBuffer(1, 1, 22050);
            const source = audioContext.createBufferSource();
            source.buffer = silentBuffer;
            source.connect(audioContext.destination);
            source.start();
        }, { once: true });
    
        // Handle iOS speech synthesis quirks
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            this.announce = (text, callback = null) => {
                if (!window.speechSynthesis) {
                    if (callback) callback();
                    return;
                }
    
                if (this.announcer.isAnnouncing) {
                    speechSynthesis.cancel();
                }
    
                // Force speech synthesis to work on iOS
                speechSynthesis.cancel();
                
                this.announcer.isAnnouncing = true;
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = this.announcer.voice;
                utterance.lang = 'en-US'; // Force English language
                utterance.rate = 0.8;
                utterance.pitch = 0.8;
    
                // iOS specific handling
                utterance.onstart = () => {
                    // Keep alive for iOS
                    const keepAlive = setInterval(() => {
                        speechSynthesis.pause();
                        speechSynthesis.resume();
                    }, 14000);
    
                    utterance.onend = () => {
                        clearInterval(keepAlive);
                        this.announcer.isAnnouncing = false;
                        if (callback) callback();
                    };
    
                    utterance.onerror = () => {
                        clearInterval(keepAlive);
                        this.announcer.isAnnouncing = false;
                        if (callback) callback();
                    };
                };
    
                try {
                    speechSynthesis.speak(utterance);
                } catch (e) {
                    console.warn('Speech synthesis failed:', e);
                    if (callback) callback();
                }
            };
        }
    }

    announce(text, callback = null) {
        if (!window.speechSynthesis) {
            if (callback) callback();
            return;
        }

        if (this.announcer.isAnnouncing) {
            speechSynthesis.cancel();
        }

        // Split text into words and wrap each in a span
        const words = text.split(' ');
        const wrappedText = words.map((word, index) => 
            `<span class="highlighted-word" data-word-index="${index}">${word}</span>`
        ).join(' ');

        // If this is a question, update the display with highlighted words
        if (this.isReadingQuestion) {
            this.questionText.innerHTML = wrappedText;
        }

        this.announcer.isAnnouncing = true;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.announcer.voice;
        utterance.lang = 'en-US'; // Force English language
        utterance.rate = 0.8;
        utterance.pitch = 0.8;

        // Add word boundary event handling
        let currentWordIndex = -1;
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                // Remove highlight from previous word
                if (currentWordIndex >= 0) {
                    const prevWord = document.querySelector(`[data-word-index="${currentWordIndex}"]`);
                    if (prevWord) prevWord.classList.remove('current-word');
                }
                
                // Add highlight to current word
                currentWordIndex++;
                const currentWord = document.querySelector(`[data-word-index="${currentWordIndex}"]`);
                if (currentWord) currentWord.classList.add('current-word');
            }
        };

        utterance.onend = () => {
            this.announcer.isAnnouncing = false;
            // Remove all current-word highlights
            document.querySelectorAll('.current-word').forEach(el => {
                el.classList.remove('current-word');
            });
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