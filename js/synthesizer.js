
class Synthesizer {

    #noteFrequencies = {
        c2: 65.41, db2: 69.30, d2: 73.42, eb2: 77.78, e2: 82.41, f2: 87.31, gb2: 92.50, g2: 98.0, ab2: 103.83, a2: 110.0, bb2: 116.54, b2: 123.47, c3: 130.81, db3: 138.59,
        d3: 146.83, eb3: 155.56, e3: 164.81, f3: 174.61, gb3: 185.0, g3: 196.0, ab3: 207.65, a3: 220.0, bb3: 233.08, b3: 246.94, c4: 261.63, db4: 277.18, d4: 293.66,
        eb4: 311.13, e4: 329.63, f4: 349.23, gb4: 369.99, g4: 392.0, ab4: 415.30, a4: 440.0, bb4: 466.16, b4: 493.88, c5: 523.25, db5: 554.37, d5: 587.33, eb5: 622.25,
        e5: 659.26, f5: 698.46, gb5: 739.99, g5: 783.99, ab5: 830.61, a5: 880.0, bb5: 932.33, b5: 987.77, c6: 1046.50
    };

    // The Web Audio Context.
    #audioContext = null;
    // The Oscillator object.
    #oscillator;
    // Used by iOS devices.
    #unlocked = false;
    #pressedKey;
    // The sound parameters.
    #parameters = {
        volume: 0.2, delay: 0, feedback: 0, portamento: 0,
            vco1: {
                type: 'sine', volume: 0.5, attack: 0.0, decay: 0.0, sustain: 0.25, sustainStep: 0.5, release: 0.0
            }, 
            vco2: {
                type: 'sine', volume: 0.0, attack: 0.0, decay: 0.0, sustain: 0.0, sustainStep: 0.5, release: 0.0, detune: 7
            } 
    };

    #maxSustainVolume = 1;
    
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

        // Get the the frequency (the note) corresponding to the pressed key.
        const frequency = this.#noteFrequencies[this.#pressedKey];
        // Play the note.
        this.#oscillator.play(frequency, this.#parameters);
    }

    release() {
        this.#oscillator.stop(this.#parameters);
    }

    setPressedKey(key) {
        this.#pressedKey = key;
    }

    setVolume(volume) {
        this.#parameters.volume = volume;
    }

    setDelay(delay) {
        this.#parameters.delay= delay;
    }

    setFeedback(feedback) {
        this.#parameters.feedback = feedback;
    }

    setPortamento(portamento) {
        this.#parameters.portamento = portamento;
    }

    setVcoType(vco, type) {
        this.#parameters[vco].type = type;
    }

    setVcoVolume(vco, volume) {
        // Adjust the sustain value according to the current vco volume.
        this.#parameters[vco].sustain = volume / (this.#maxSustainVolume / this.#parameters[vco].sustainStep);
        // Set the new volume value.
        this.#parameters[vco].volume = volume;
    }

    setVcoAttack(vco, attack) {
        this.#parameters[vco].attack = attack;
    }

    setVcoDecay(vco, decay) {
        this.#parameters[vco].decay = decay;
    }

    setVcoSustain(vco, sustain) {
        // Store the actual value coming from the input HTML tag. 
        this.#parameters[vco].sustainStep = sustain;
        // Adjust the sustain value according to the current vco volume.
        sustain = this.#parameters[vco].volume / (this.#maxSustainVolume / sustain);
        // Set the new sustain value.
        this.#parameters[vco].sustain = sustain;
    }

    setVcoRelease(vco, release) {
        this.#parameters[vco].release = release;
    }

    setVcoDetune(vco, detune) {
        this.#parameters[vco].detune = detune;
    }
}
