
class Oscillator {
    // The Web Audio Context.
    #audioContext = null;
    // Default sound duration.
    #noteLength = 5;
    // The general volume.
    #master;
    // Oscillator and gain elements needed to create the synthesizer sound.
    #VCOs = {vco1: null, vco2: null};  // Note: VCO => Voltage Controlled Oscillator
    #VCAs = {vca1: null, vca2: null};  // Note: VCA => Voltage Controlled Amplifier

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

    #setVCO(id, frequency, parameters) {
        // Shortcut.
        const vco = 'vco' + id;
        const vca = 'vca' + id;
        parameters = parameters[vco];

        this.#VCOs[vco] = this.#getOscillator(frequency);
        this.#VCOs[vco].type = parameters.type;
        this.#VCAs[vca] = this.#audioContext.createGain();

        if (id == '2') {
            // Transpose the value of the main VCO (ie: vco a) by x steps.
            this.#VCOs.vco2.frequency.value = frequency * Math.pow(2, parameters.detune / 12);
        }

        this.#VCOs[vco].connect(this.#VCAs[vca]);
      console.log(this.#VCOs);
      console.log(parameters);

        if (parameters.attack > 0) {
            // Start from volume zero.
            this.#VCAs[vca].gain.setValueAtTime(0, this.#audioContext.currentTime);
        }
        else {
            this.#VCAs[vca].gain.value = parseFloat(parameters.volume);
        }

        this.#VCAs[vca].connect(this.#master);

        // Attack
        this.#VCAs[vca].gain.linearRampToValueAtTime(parseFloat(parameters.volume), this.#audioContext.currentTime + parseFloat(parameters.attack));
        // Decay
        this.#VCAs[vca].gain.linearRampToValueAtTime(parseFloat(parameters.sustain), this.#audioContext.currentTime + parseFloat(parameters.attack) + parseFloat(parameters.decay));
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
        this.#VCAs.vca1.connect(delay);
        delay.connect(this.#master);
    }

    setAudioContext(audioContext) {
        this.#audioContext = audioContext;
    }

    play(frequency, parameters) {
        this.#setMaster(parameters.volume);
        this.#setVCO('1', frequency, parameters);

        // Check for VCO 2.
        if (parameters.vco2.volume > 0) {
            this.#setVCO('2', frequency, parameters);
        }

        this.#delay(parameters.delay, parameters.feedback);

        // Play VCO 1 sound.
        this.#VCOs.vco1.start();

        if (parameters.vco2.volume > 0) {
            // Play VCO 2 sound.
            this.#VCOs.vco2.start();
        }
    }

    stop(parameters) {
        // Release
        this.#VCOs.vco1.stop(this.#audioContext.currentTime + parseFloat(parameters.vco1.release));

        if (parameters.vco2.volume > 0) {
            this.#VCOs.vco2.stop(this.#audioContext.currentTime + parseFloat(parameters.vco2.release));
        }
    }
}
