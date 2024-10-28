
class Oscillator {

    // The Web Audio Context.
    #audioContext = null;
    #oscillator;
    // Default sound duration.
    #noteLength = 5;
    #vca;
    #vca2;
    #vco2;
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
     * Create a second vco that is played with the main vco.
     * Its frequency is transpose from the main vco frequency.
     */
    #doubleNote(frequency, steps) {
        this.#vco2 = this.#getOscillator();
        this.#vca2 = this.#audioContext.createGain();

        // Transpose the value of the main vco by x steps.
        this.#vco2.frequency.value = frequency * Math.pow(2, steps / 12);
        this.#vco2.connect(this.#vca2);
        this.#vca2.connect(this.#vca);
    }

    #delay(time, feedbackValue) {
        const delay =  this.#audioContext.createDelay();
        this.#oscillator.connect(delay);
        delay.delayTime.value = time;
        const feedback = this.#audioContext.createGain();
        feedback.gain.value = feedbackValue;
        feedback.connect(delay);
        delay.connect(feedback);
        delay.connect(this.#vca);
    }

    setAudioContext(audioContext) {
        this.#audioContext = audioContext;
    }

    play(frequency, parameters) {
        this.#setMaster(parameters.volume);
        this.#oscillator = this.#getOscillator(frequency);
        this.#vca = this.#audioContext.createGain();
        this.#oscillator.connect(this.#vca);
        //this.#vca.gain.setValueAtTime(0.01, this.#audioContext.currentTime);
        this.#vca.connect(this.#master);

        if (parameters.doubled) {
            this.#doubleNote(frequency, parameters.steps);
        }

        this.#vca.gain.linearRampToValueAtTime(0.5, this.#audioContext.currentTime + 0.2);
        this.#vca.gain.linearRampToValueAtTime(0.0001, this.#audioContext.currentTime + 0.5);

        //this.#delay(parameters.delay, parameters.feedback);

        // Play sound.
        this.#oscillator.start();

        // Stop sound after note length.
        this.#oscillator.stop(this.#audioContext.currentTime + this.#noteLength);

        if (parameters.doubled) {
            this.#vco2.start();
            this.#vco2.stop(this.#audioContext.currentTime + this.#noteLength);
        }
    }

    stop(parameters) {
        this.#oscillator.stop(this.#audioContext.currentTime + this.#noteLength);

        if (parameters.doubled) {
            this.#vco2.stop(this.#audioContext.currentTime + this.#noteLength);
        }
    }
}
