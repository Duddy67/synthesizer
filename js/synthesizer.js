
class Synthesizer {

    #noteFrequencies = {
        c4: 261.63,
        db4: 277.18,
        d4: 293.66,
        eb4: 311.13,
        e4: 329.63,
        f4: 349.23,
        gb4: 369.99,
        g4: 392.0,
        ab4: 415.30,
        a4: 440.0,
        bb4: 466.16,
        b4: 493.88,
        c5: 523.25,
        db5: 554.37,
        d5: 587.33,
        eb5: 622.25,
        e5: 659.26,
        f5: 698.46,
        gb5: 739.99,
        g5: 783.99,
        ab5: 830.61,
        a5: 880.0,
        bb5: 932.33,
        b5: 987.77,
        c6: 1046.50
    };

    // The Web Audio Context.
    #audioContext = null;
    #oscillator;
    // Used by iOS devices.
    #unlocked = false;
    #playedNote;
    // The sound parameters.
    #parameters = {volume: 0.1, delay: 0, feedback: 0};
    
    constructor(oscillator) {
        this.#oscillator = oscillator;
    }



    press() {
        // Create an audio context if it doesn't exist.
        if (!this.#audioContext) {
            this.#audioContext = new AudioContext();
            this.#oscillator.setAudioContext(this.#audioContext);
        }

        // iOS devices lock the audio context for sake of security.
        // It has to be unlocked first in order to use it.
        if (!this.#unlocked) {
            // Play silent buffer to unlock the audio
            let buffer = this.#audioContext.createBuffer(1, 1, 22050);
            let node = this.#audioContext.createBufferSource();
            node.buffer = buffer;
            node.start(0);
            this.#unlocked = true;
        }

        const frequency = this.#noteFrequencies[this.#playedNote];
        this.#oscillator.play(frequency, this.#parameters);
    }

    release() {
        this.#oscillator.stop();
    }

    setPlayedNote(note) {
        this.#playedNote = note;
    }
}
