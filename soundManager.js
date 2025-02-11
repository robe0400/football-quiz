class SoundManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.isPlaying = false;
    }

    speak(text, callback = null) {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;

        if (callback) {
            utterance.onend = () => {
                this.isPlaying = false;
                callback();
            };
        }

        this.isPlaying = true;
        this.synthesis.speak(utterance);
    }

    cancel() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        this.isPlaying = false;
    }
}