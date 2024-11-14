
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

    #portamento(frequency, parameters) {
        const now = this.#audioContext.currentTime;

        this.#VCOs.vco1.frequency.cancelScheduledValues(now);
        this.#VCOs.vco1.frequency.linearRampToValueAtTime(frequency, now + parseFloat(parameters.portamento)); 

        if (parameters.vco2.volume > 0) {
            this.#VCOs.vco2.frequency.cancelScheduledValues(now);
            this.#VCOs.vco2.frequency.linearRampToValueAtTime(frequency, now + parseFloat(parameters.portamento)); 
        }
    }

    /*
     * Create a VCO with the given parameters.
     */
    #setVCO(id, frequency, parameters) {
        // Shortcuts.
        const vco = 'vco' + id;
        const vca = 'vca' + id;
        const vcoParams = parameters[vco];
        const now = this.#audioContext.currentTime;

        // Another note is still playing.
        if (this.#VCOs[vco]) {
            // Stop the note short (ie: ignore the release parameter) to make the synthesizer monophonic. 
            this.#VCOs[vco].stop(0);
            this.#VCOs[vco] = null;
        }

        this.#VCOs[vco] = this.#getOscillator(frequency);
        this.#VCOs[vco].type = vcoParams.type;
        this.#VCAs[vca] = this.#audioContext.createGain();

        if (id == '2') {
            // Transpose the value of the main VCO (ie: vco a) by x steps.
            this.#VCOs.vco2.frequency.value = frequency * Math.pow(2, vcoParams.detune / 12);
        }

        this.#VCOs[vco].connect(this.#VCAs[vca]);

        if (vcoParams.attack > 0) {
            // Start from volume zero.
            this.#VCAs[vca].gain.setValueAtTime(0, now);
        }
        else {
            this.#VCAs[vca].gain.value = parseFloat(vcoParams.volume);
        }

        this.#VCAs[vca].connect(this.#master);

        // Attack
        this.#VCAs[vca].gain.linearRampToValueAtTime(parseFloat(vcoParams.volume), now + parseFloat(vcoParams.attack));
        // Decay
        this.#VCAs[vca].gain.linearRampToValueAtTime(parseFloat(vcoParams.sustain), now + parseFloat(vcoParams.attack) + parseFloat(vcoParams.decay));
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

        // Check for portamento.
        if (this.#VCOs.vco1 && parameters.portamento > 0) {
            this.#portamento(frequency, parameters);
            // Use the current oscillator, don't create a new one.
            return;
        }

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
        const now = this.#audioContext.currentTime;

        if (this.#VCOs.vco1) {
            // Release
            this.#VCAs.vca1.gain.linearRampToValueAtTime(0, now + parseFloat(parameters.vco1.release));

            this.#VCOs.vco1.stop(now + parseFloat(parameters.vco1.release));
            this.#VCOs.vco1 = null;
        }

        if (parameters.vco2.volume > 0) {
            // Release
            this.#VCAs.vca2.gain.linearRampToValueAtTime(0, now + parseFloat(parameters.vco2.release));

            this.#VCOs.vco2.stop(now + parseFloat(parameters.vco2.release));
            this.#VCOs.vco2 = null;
        }
    }
}
