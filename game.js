class NFLQuizGame {
    // ... previous constructor and initialization methods remain the same ...

    initializeElements() {
        // ... previous element initializations ...
        
        // Add field position and first down markers
        this.fieldPositionMarker = document.createElement('div');
        this.fieldPositionMarker.id = 'field-position-marker';
        this.firstDownMarker = document.createElement('div');
        this.firstDownMarker.id = 'first-down-marker';
        
        document.getElementById('playing-field').appendChild(this.fieldPositionMarker);
        document.getElementById('playing-field').appendChild(this.firstDownMarker);
        
        this.offensiveTeam = document.getElementById('offensive-team');
        this.defensiveTeam = document.getElementById('defensive-team');
        this.playersContainer = document.getElementById('players-container');
        
        this.updateFieldMarkers();
    }

    updateFieldMarkers() {
        // Update field position marker
        const fieldPercentage = (this.yards / 100) * 80; // 80% is playing field width
        this.fieldPositionMarker.style.left = `${fieldPercentage}%`;
        
        // Update first down marker
        const firstDownYards = this.yards + this.yardsToGo;
        const firstDownPercentage = (firstDownYards / 100) * 80;
        this.firstDownMarker.style.left = `${firstDownPercentage}%`;
    }

    animatePlay(yardsGained, isSuccess) {
        return new Promise(resolve => {
            if (isSuccess) {
                // Successful play animation
                this.animateSuccessfulPlay(yardsGained, resolve);
            } else {
                // Failed play animation
                this.animateFailedPlay(resolve);
            }
        });
    }

    animateSuccessfulPlay(yardsGained, resolve) {
        // Ball snap animation
        this.ballSprite.classList.add('ball-snap');
        
        // Move offensive players forward
        const moveDistance = (yardsGained / 100) * 80; // 80% is playing field width
        this.offensiveTeam.style.left = `${moveDistance}%`;
        
        // Spread formation for passing play
        this.offensiveTeam.classList.add('formation-spread');
        
        // Move defensive players back
        this.defensiveTeam.style.right = `-${moveDistance/2}%`;
        
        setTimeout(() => {
            // Reset animations
            this.ballSprite.classList.remove('ball-snap');
            this.offensiveTeam.classList.remove('formation-spread');
            
            if (this.yards >= 100) {
                // Touchdown celebration
                this.animateTouchdown(resolve);
            } else if (yardsGained >= this.yardsToGo) {
                // First down celebration
                this.animateFirstDown(resolve);
            } else {
                resolve();
            }
        }, 1000);
    }

    animateFailedPlay(resolve) {
        // Ball snap animation
        this.ballSprite.classList.add('ball-snap');
        
        // Bunch formation for failed play
        this.offensiveTeam.classList.add('formation-bunch');
        
        // Move defensive players forward
        this.defensiveTeam.style.right = '10%';
        
        // Tackle animation
        setTimeout(() => {
            this.offensiveTeam.querySelectorAll('.player').forEach(player => {
                player.classList.add('player-tackled');
            });
        }, 500);
        
        setTimeout(() => {
            // Reset animations
            this.ballSprite.classList.remove('ball-snap');
            this.offensiveTeam.classList.remove('formation-bunch');
            this.offensiveTeam.querySelectorAll('.player').forEach(player => {
                player.classList.remove('player-tackled');
            });
            this.defensiveTeam.style.right = '0';
            resolve();
        }, 1500);
    }

    animateTouchdown(resolve) {
        this.offensiveTeam.querySelectorAll('.player').forEach(player => {
            player.classList.add('touchdown-celebration');
        });
        
        setTimeout(() => {
            this.offensiveTeam.querySelectorAll('.player').forEach(player => {
                player.classList.remove('touchdown-celebration');
            });
            // Reset field position
            this.resetFieldPosition();
            resolve();
        }, 1500);
    }

    animateFirstDown(resolve) {
        this.offensiveTeam.querySelectorAll('.player').forEach(player => {
            player.classList.add('first-down-celebration');
        });
        
        setTimeout(() => {
            this.offensiveTeam.querySelectorAll('.player').forEach(player => {
                player.classList.remove('first-down-celebration');
            });
            resolve();
        }, 1000);
    }

    resetFieldPosition() {
        this.offensiveTeam.style.left = '0';
        this.defensiveTeam.style.right = '0';
        this.updateFieldMarkers();
    }

    async handleCorrectAnswer() {
        const yardsGained = Math.floor(Math.random() * 15) + 5;
        const previousYards = this.yards;
        this.yards += yardsGained;
        
        // Animate the play before announcing result
        await this.animatePlay(yardsGained, true);
        
        // ... rest of handleCorrectAnswer remains the same ...
    }

    async handleIncorrectAnswer() {
        // Animate the failed play
        await this.animatePlay(0, false);
        
        // ... rest of handleIncorrectAnswer remains the same ...
    }

    // ... rest of the class methods remain the same ...
}
