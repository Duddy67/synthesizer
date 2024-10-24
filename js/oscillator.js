
class Oscillator {

    // The Web Audio Context.
    #audioContext = null;
    #oscillator;
    // Default sound duration.
    #noteLength = 5;
    #vca;



    #getMaster(volume) {
        const master = this.#audioContext.createGain();

        // Set volume (default 0.5).
        volume = volume !== undefined ? volume : 0.5;
        master.gain.value = volume;
        master.connect(this.#audioContext.destination);

        return master;
    }

    #getOscillator(frequency) {
        // Set frequency (default 440 hz).
        frequency = frequency !== undefined ? frequency : 440.0;
        // Create an oscillator.
        const oscillator = this.#audioContext.createOscillator();
        oscillator.frequency.value = frequency;

        return oscillator;
    }

    setAudioContext(audioContext) {
        this.#audioContext = audioContext;
    }

    play(frequency, parameters) {
        const master = this.#getMaster(parameters.volume);
//console.log(parameters.volume);
        this.#oscillator = this.#getOscillator(frequency);
        this.#vca = this.#audioContext.createGain();
        this.#oscillator.connect(this.#vca);
        //this.#vca.gain.setValueAtTime(0.01, this.#audioContext.currentTime);
        this.#vca.connect(master);
        this.#vca.gain.linearRampToValueAtTime(0.5, this.#audioContext.currentTime + 0.2);
        this.#vca.gain.linearRampToValueAtTime(0.0001, this.#audioContext.currentTime + 0.5);

        // Play sound.
        this.#oscillator.start();

        // Stop sound after note length.
        this.#oscillator.stop(this.#audioContext.currentTime + this.#noteLength);
    }

    stop() {
        this.#oscillator.stop(this.#audioContext.currentTime + this.#noteLength);
    }
}
