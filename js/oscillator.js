
class Oscillator {

    // The Web Audio Context.
    #audioContext = null;
    // Default sound duration.
    #noteLength = 5;
    // Oscillator and gain elements needed to create the synthesizer sound.
    #vco1; // Note: vco => Voltage Controlled Oscillator
    #vco2;
    #vca1; // Note: vca => Voltage Controlled Amplifier
    #vca2;
    // The general volume.
    #master;

    #setMaster(volume) {
        this.#master = this.#audioContext.createGain();
        // Set volume (default 0.5).
        volume = volume !== undefined ? volume : 0.5;
        this.#master.gain.value = volume;
        this.#master.connect(this.#audioContext.destination);
    }

    #getOscillator(frequency) {
        // Set frequency (default 440 hz).
        frequency = frequency !== undefined ? frequency : 440.0;
        // Create an oscillator.
        const oscillator = this.#audioContext.createOscillator();
        oscillator.frequency.value = frequency;

        return oscillator;
    }

    /*
     * Create a second oscillator that is played with the main oscillator.
     * Its frequency is transposed from the main oscillator frequency.
     */
    #setVCO2(frequency, steps) {
        this.#vco2 = this.#getOscillator();
        this.#vca2 = this.#audioContext.createGain();

        // Transpose the value of the main vco by x steps.
        this.#vco2.frequency.value = frequency * Math.pow(2, steps / 12);
        this.#vco2.connect(this.#vca2);
        this.#vca2.connect(this.#vca1);
    }

    /*
     * Add a delay effect to the sound.
     */
    #delay(time, feedbackValue) {
        const delay =  this.#audioContext.createDelay();
        delay.delayTime.value = time;

        const feedback = this.#audioContext.createGain();
        feedback.gain.value = feedbackValue;
        feedback.connect(delay);

        delay.connect(feedback);
        this.#vca1.connect(delay);
        delay.connect(this.#master);
    }

    setAudioContext(audioContext) {
        this.#audioContext = audioContext;
    }

    play(frequency, parameters) {
        this.#setMaster(parameters.volume);
        this.#vco1 = this.#getOscillator(frequency);
        this.#vca1 = this.#audioContext.createGain();
        this.#vco1.connect(this.#vca1);
        // TODO: Some examples use the setValueAtTime method. Figure out why.
        //this.#vca1.gain.setValueAtTime(0.01, this.#audioContext.currentTime);
        this.#vca1.connect(this.#master);

        // Check for VCO 2.
        if (parameters.vco2) {
            this.#setVCO2(frequency, parameters.steps);
        }

        this.#vca1.gain.linearRampToValueAtTime(0.5, this.#audioContext.currentTime + 0.2);
        this.#vca1.gain.linearRampToValueAtTime(0.0001, this.#audioContext.currentTime + 0.5);

        this.#delay(parameters.delay, parameters.feedback);

        // Play sound.
        this.#vco1.start();

        // Stop sound after note length.
        this.#vco1.stop(this.#audioContext.currentTime + this.#noteLength);

        if (parameters.vco2) {
            this.#vco2.start();
            this.#vco2.stop(this.#audioContext.currentTime + this.#noteLength);
        }
    }

    stop(parameters) {
        this.#vco1.stop(this.#audioContext.currentTime + this.#noteLength);

        if (parameters.vco2) {
            this.#vco2.stop(this.#audioContext.currentTime + this.#noteLength);
        }
    }
}
