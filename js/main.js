document.addEventListener('DOMContentLoaded', () => {

    const keyMaps = {
        a: 'key-1', z: 'key-2', e: 'key-3', r: 'key-4', t: 'key-5', y: 'key-6', u: 'key-7', i: 'key-8', o: 'key-9', p: 'key-10', q: 'key-11', s: 'key-12',
        d: 'key-13', f: 'key-14', g: 'key-15', h: 'key-16', j: 'key-17', k: 'key-18', l: 'key-19', m: 'key-20', w: 'key-21', x: 'key-22', c: 'key-23',
        v: 'key-24', b: 'key-25'
    };

    const keys = ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'w', 'x', 'c', 'v', 'b'];

    const oscillator = new Oscillator();
    const synthesizer = new Synthesizer(oscillator);

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

    let released = true;
    let keysCurrentlyPressed = [];

    document.addEventListener('keydown', (e) => {
        // Filter the pressed keys.
        //if (keys.includes(e.key) && released) {
        if (keys.includes(e.key) && !keysCurrentlyPressed.includes(e.key)) {
            keysCurrentlyPressed.push(e.key);
            // Get the corresponding HTML key element.
            const keyElement = document.getElementById(keyMaps[e.key]);
            // Get the key data from the key element.
            const key = keyElement.dataset.key + keyElement.dataset.octave;
            synthesizer.setPressedKey(key);
            // Play the note.
            synthesizer.press();

            keyElement.classList.add('pressed-' + keyElement.dataset.color);
            released = false;
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
            let key = document.getElementById(keyMaps[e.key]);
            key.classList.remove('pressed-' + key.dataset.color);
            released = true;

            // One key is still being pressed, meaning that a note is sustained.
            if (keysCurrentlyPressed.length == 1) {
                // Get the corresponding key element.
                const keyElement = document.getElementById(keyMaps[keysCurrentlyPressed[0]]);
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


