document.addEventListener('DOMContentLoaded', () => {

    const keyMap = {
        a: 'key-1', z: 'key-2', e: 'key-3', r: 'key-4', t: 'key-5', y: 'key-6', u: 'key-7', i: 'key-8', o: 'key-9', p: 'key-10', q: 'key-11', s: 'key-12',
        d: 'key-13', f: 'key-14', g: 'key-15', h: 'key-16', j: 'key-17', k: 'key-18', l: 'key-19', m: 'key-20', w: 'key-21', x: 'key-22', c: 'key-23',
        v: 'key-24', b: 'key-25'
    };

    const midiMap = {
        21: 'a0', 22: 'bb0', 23: 'b0', 24: 'c1', 25: 'db1', 26: 'd1', 27: 'eb1', 28: 'e1', 29: 'f1', 30: 'gb1', 31: 'g1', 32: 'ab1',
        33: 'a1', 34: 'bb1', 35: 'b1', 36: 'c2', 37: 'db2', 38: 'd2', 39: 'eb2', 40: 'e2', 41: 'f2', 42: 'gb2', 43: 'g2', 44: 'ab2',
        45: 'a2', 46: 'bb2', 47: 'b2', 48: 'c3', 49: 'db3', 50: 'd3', 51: 'eb3', 52: 'e3', 53: 'f3', 54: 'gb3', 55: 'g3', 56: 'ab3',
        57: 'a3', 58: 'bb3', 59: 'b3', 60: 'c4', 61: 'db4', 62: 'd4', 63: 'eb4', 64: 'e4', 65: 'f4', 66: 'gb4', 67: 'g4', 68: 'ab4',
        69: 'a4', 70: 'bb4', 71: 'b4', 72: 'c5', 73: 'db5', 74: 'd5', 75: 'eb5', 76: 'e5', 77: 'f5', 78: 'gb5', 79: 'g5', 80: 'ab5',
        81: 'a5', 82: 'bb5', 83: 'b5', 84: 'c6', 85: 'db6', 86: 'd6', 87: 'eb6', 88: 'e6', 89: 'f6', 90: 'gb6', 91: 'g6', 92: 'ab6',
        93: 'a6', 94: 'bb6', 95: 'b6', 96: 'c7', 97: 'db7', 98: 'd7', 99: 'eb7', 100: 'e7', 101: 'f7', 102: 'gb7', 103: 'g7', 104: 'ab7',
        105: 'a7', 106: 'bb7', 107: 'b7', 108: 'c8'
    };

    const keys = ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'w', 'x', 'c', 'v', 'b'];

    const oscillator = new Oscillator();
    const synthesizer = new Synthesizer(oscillator);
    const midi = new MIDI();

    midi.initMIDIAccess();

    // Check for synthesizer keys.
    document.querySelectorAll('.key').forEach((key) => {
        key.addEventListener('mousedown', (e) => {
            synthesizer.setPressedKey(e.target.dataset.key + e.target.dataset.octave);
            synthesizer.press();
        });

        key.addEventListener('mouseup', (e) => {
            synthesizer.release();
        });
    });

    // Check for PC keyboard inputs.

    let keysCurrentlyPressed = [];

    document.addEventListener('keydown', (e) => {
        // Filter the pressed keys.
        if (keys.includes(e.key) && !keysCurrentlyPressed.includes(e.key)) {
            keysCurrentlyPressed.push(e.key);
            // Get the corresponding HTML key element.
            const keyElement = document.getElementById(keyMap[e.key]);
            // Get the key data from the key element.
            const key = keyElement.dataset.key + keyElement.dataset.octave;
            synthesizer.setPressedKey(key);
            // Play the note.
            synthesizer.press();

            keyElement.classList.add('pressed-' + keyElement.dataset.color);
        }
    });

    document.addEventListener('keyup', (e) => {
        // Filter the pressed keys.
        if (keys.includes(e.key)) {
            // Remove the released key from the array.
            keysCurrentlyPressed = keysCurrentlyPressed.filter(key => key !== e.key);

            // Release the corresponding note only when no more key is pressed.
            if (keysCurrentlyPressed.length == 0) {
                synthesizer.release();
            }

            // Get the corresponding HTML key element.
            let key = document.getElementById(keyMap[e.key]);
            key.classList.remove('pressed-' + key.dataset.color);

            // One key is still being pressed, meaning that a note is sustained.
            if (keysCurrentlyPressed.length == 1) {
                // Get the corresponding key element.
                const keyElement = document.getElementById(keyMap[keysCurrentlyPressed[0]]);
                // Get the corresponding note name.
                key = keyElement.dataset.key + keyElement.dataset.octave;
                synthesizer.setPressedKey(key);
                // Play the sustained note.
                synthesizer.press();
            }
        }
    });

    // Check for main volume.
    document.getElementById('volume').addEventListener('input', (e) => {
        synthesizer.setVolume(e.target.value);
    });

    // Check for range keyboard.
    document.querySelectorAll('[id^="range-"]').forEach((range) => {
        range.addEventListener('click', (e) => {
            setRange(e.target.dataset.lowestOctave);
        });
    });

    // Check for delay.
    document.querySelectorAll('[id^="delay-"]').forEach((delay) => {
        delay.addEventListener('input', (e) => {
            synthesizer.setDelay(e.target.dataset.parameter, e.target.value);
        });
    });

    // Check for portamento.
    document.getElementById('portamento').addEventListener('input', (e) => {
        synthesizer.setPortamento(e.target.value);
    });

    // Check for vco 1 delay.
    document.querySelectorAll('[id^="vco1-delay"]').forEach((vco1) => {
        vco1.addEventListener('click', (e) => {
            synthesizer.setVcoDelay('1', e.target.value);
        });
    });

    // Check for vco 2 delay.
    document.querySelectorAll('[id^="vco2-delay"]').forEach((vco2) => {
        vco2.addEventListener('click', (e) => {
            synthesizer.setVcoDelay('2', e.target.value);
        });
    });

    // Check for vibrato.
    document.querySelectorAll('[id^="vibrato-"]').forEach((vibrato) => {
        vibrato.addEventListener('input', (e) => {
            synthesizer.setVibrato(e.target.dataset.parameter, e.target.value);
        });
    });

    // Check for vco types.
    document.querySelectorAll('[id$="-type"]').forEach((type) => {
        type.addEventListener('change', (e) => {
            synthesizer.setVcoType('vco' + e.target.dataset.vcoId, e.target.value);
        });
    });

    // Check for vco volumes.
    document.querySelectorAll('[id$="-volume"]').forEach((volume) => {
        volume.addEventListener('input', (e) => {
            synthesizer.setVcoVolume('vco' + e.target.dataset.vcoId, e.target.value);
        });
    });

    // Check for vco attacks.
    document.querySelectorAll('[id$="-attack"]').forEach((attack) => {
        // Don't treat the vibrato attack.
        if (attack.id.startsWith('vibrato')) {
            return;
        }

        attack.addEventListener('input', (e) => {
            synthesizer.setVcoAttack('vco' + e.target.dataset.vcoId, e.target.value);
        });
    });

    // Check for vco decays.
    document.querySelectorAll('[id$="-decay"]').forEach((decay) => {
        decay.addEventListener('input', (e) => {
            synthesizer.setVcoDecay('vco' + e.target.dataset.vcoId, e.target.value);
        });
    });

    // Check for vco sustains.
    document.querySelectorAll('[id$="-sustain"]').forEach((sustain) => {
        sustain.addEventListener('input', (e) => {
            synthesizer.setVcoSustain('vco' + e.target.dataset.vcoId, e.target.value);
        });
    });

    // Check for vco releases.
    document.querySelectorAll('[id$="-release"]').forEach((release) => {
        release.addEventListener('input', (e) => {
            synthesizer.setVcoRelease('vco' + e.target.dataset.vcoId, e.target.value);
        });
    });

    // Check for vco detunes.
    document.querySelectorAll('[id$="-detune"]').forEach((detune) => {
        detune.addEventListener('input', (e) => {
            synthesizer.setVcoDetune('vco' + e.target.dataset.vcoId, e.target.value);
        });
    });

    // Get and dispatch MIDI messages sent from the MIDI class.
    document.addEventListener('midi', (e) => {
        const message = e.detail.data
        const command = message.data[0];
        const note = message.data[1]; // Note as number (0 - 127).
        // A velocity value might not be included with a noteOff command.
        const velocity = (message.data.length > 2) ? message.data[2] : 0; 

        switch (command) {
            case 144: // noteOn
                if (velocity > 0) {
                    //noteOn(note, velocity);
    console.log('note: ' + midiMap[note] + ' velocity: ' + velocity);
            synthesizer.setPressedKey(midiMap[note]);
            synthesizer.press();
                }
                else {
                    //noteOff(note);
                }

                break;

            case 128: // noteOff
                //noteOff(note);
    console.log('note: ' + note);
            synthesizer.release();
                break;
            // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
        }
    });
});


/*
 * Reset the octave values on the virtual keyboard.
 */
function setRange(octave) {
    let counter = 0;
    const nbNotesInOctave = 12;

    document.querySelectorAll('[id^="key-"]').forEach((key) => {
        // Check if the number of notes contained in an octave is exceeded.
        if (counter == nbNotesInOctave) {
            // Increase octave value.
            octave++;
            // Reset counter.
            counter = 0;
        }

        key.dataset.octave = octave;

        counter++;
    });
}


