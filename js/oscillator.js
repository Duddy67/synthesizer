
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
    // The LFO used to create a vibrato effect.
    #LFO;

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
        oscillator.frequency.value = parseFloat(frequency);

        return oscillator;
    }

    /*
     * Smoothly transitions the current note frequency to the given new note frequency. 
     */
    #portamento(frequency, parameters) {
        const now = this.#audioContext.currentTime;

        this.#VCOs.vco1.frequency.cancelScheduledValues(now);
        // Transition the frequency according to the glide duration (ie: portamento parameter).
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
     * Creates a vibrato effect through a LFO oscillator.
     */
    #vibrato(parameters) {
        this.#LFO =  this.#audioContext.createOscillator();
        const LFOGain = this.#audioContext.createGain();

        this.#LFO.frequency.setValueAtTime(parameters.vibrato.speed, 0);
        this.#LFO.connect(LFOGain);
        LFOGain.gain.value = parameters.vibrato.amount;
        // Needed for the attack parameter.
        LFOGain.gain.setValueAtTime(0, this.#audioContext.currentTime);

        if (parameters.vibrato.vco1 && parameters.vco1.volume > 0) {
            LFOGain.connect(this.#VCOs.vco1.frequency);
        }

        if (parameters.vibrato.vco2 && parameters.vco2.volume > 0) {
            LFOGain.connect(this.#VCOs.vco2.frequency);
        }

        // LFO attack
        LFOGain.gain.linearRampToValueAtTime(parameters.vibrato.amount, this.#audioContext.currentTime + parseFloat(parameters.vibrato.attack));
    }

    /*
     * Adds a delay effect to the sound.
     */
    #delay(parameters) {
        const delay =  this.#audioContext.createDelay();
        delay.delayTime.value = parseFloat(parameters.delay.time);

        const feedback = this.#audioContext.createGain();
        feedback.gain.value = parseFloat(parameters.delay.feedback);
        feedback.connect(delay);

        delay.connect(feedback);

        if (parameters.delay.vco1 && parameters.vco1.volume > 0) {
            this.#VCAs.vca1.connect(delay);
        }

        if (parameters.delay.vco2 && parameters.vco2.volume > 0) {
            this.#VCAs.vca2.connect(delay);
        }

        delay.connect(this.#master);
    }

    setAudioContext(audioContext, parameters) {
        this.#audioContext = audioContext;

        // Now the audio context is available.

        this.#setMaster(parameters.volume);
    }

    play(frequency, parameters) {

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

        this.#vibrato(parameters);

        this.#delay(parameters);

        // Play VCO 1 sound.
        this.#VCOs.vco1.start();
        // Starts also the LFO oscillator (vibrato) and add the delay value if any.
        this.#LFO.start(this.#audioContext.currentTime + parseFloat(parameters.vibrato.delay));

        // Check for VCO 2
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
            this.#LFO.stop(now + parseFloat(parameters.vco1.release));
        }

        if (parameters.vco2.volume > 0) {
            // Release
            this.#VCAs.vca2.gain.linearRampToValueAtTime(0, now + parseFloat(parameters.vco2.release));

            this.#VCOs.vco2.stop(now + parseFloat(parameters.vco2.release));
            this.#VCOs.vco2 = null;
        }
    }

    setVolume(volume) {
        this.#master.gain.value = volume;
    }

    setVcoVolume(id, volume) {
        this.#VCAs['vca' + id].gain.value = parseFloat(volume);
    }
}
