// Function to handle iOS audio initialization
function initializeIOSAudio() {
    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const audioContext = new AudioContext();
        
        // Function to resume audio context
        const resumeAudioContext = () => {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            document.removeEventListener('touchstart', resumeAudioContext);
            document.removeEventListener('click', resumeAudioContext);
        };

        // Add event listeners for user interaction
        document.addEventListener('touchstart', resumeAudioContext);
        document.addEventListener('click', resumeAudioContext);
    }

    // Initialize speech synthesis
    const initializeSpeech = () => {
        if (typeof speechSynthesis !== 'undefined') {
            speechSynthesis.getVoices();
        }
        document.removeEventListener('touchstart', initializeSpeech);
        document.removeEventListener('click', initializeSpeech);
    };

    document.addEventListener('touchstart', initializeSpeech);
    document.addEventListener('click', initializeSpeech);
}