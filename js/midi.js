
class MIDI {
    #midiAccess = null;

    /*
     * In case of success, a MIDIAccess object is passed as parameter.
     * NOTE: An arrow function has to be used here or 'this' won't be available.
     */
    #onMIDISuccess = (midiAccess) => {
        // Set the MIDIAccess object.
        this.#midiAccess = midiAccess;

        console.log(midiAccess);
        
        this.#listInputsAndOutputs();

        // Loop through the inputs and assign the onmidimessage listener.
        for (var input of this.#midiAccess.inputs.values()) {
            // Add an onmidimessage listener to each input.
            // The sendMIDIMessage callback will be triggered whenever a message 
            // is sent by the input device.
            input.onmidimessage = this.#sendMIDIMessage;
        }

        //this.sendMiddleC(); // Test output sendings.

        return true;
    }

    #onMIDIFailure = () => {
        console.log('Could not access your MIDI devices.');
        return false;
    }

    #listInputsAndOutputs() {
        // Loop through the available inputs.
        for (const entry of this.#midiAccess.inputs) {
            const input = entry[1];
            console.log(
                `Input port [type:'${input.type}']` +
                ` id:'${input.id}'` +
                ` manufacturer:'${input.manufacturer}'` +
                ` name:'${input.name}'` +
                ` version:'${input.version}'`,
            );
        }

        // Loop through the available outputs.
        for (const entry of this.#midiAccess.outputs) {
            const output = entry[1];
            console.log(
                `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
            );
        }
    }

    /*
     * Sends the MIDI messages coming from the inputs through a 'midi' custom event.
     */
    #sendMIDIMessage(message) {
        const event = new CustomEvent('midi', {
            detail: {
                data: message
            }
        });

        document.dispatchEvent(event);
    }

    initMIDIAccess() {
        // Check first if the browser supports WebMIDI.
        if (navigator.requestMIDIAccess) {
            console.log('This browser supports WebMIDI!');
        }
        else {
            console.log('WebMIDI is not supported in this browser.');
            return false;
        }

        // Get a MIDIAccess object. 
        // The requestMIDIAccess method returns a promise. So, 2 callback functions are passed 
        // as arguments in case or succes or failure. 
        navigator.requestMIDIAccess().then(this.#onMIDISuccess, this.#onMIDIFailure);
    }

    sendMiddleC() {
        const noteOnMessage = [0x90, 60, 0x7f]; // note on middle C, full velocity
        const output = this.#midiAccess.outputs.get('034951173EF44B9386743FE31859A74610CCC6AC0BBB2378FB3715F4C79DE3D1');
        output.send(noteOnMessage); //omitting the timestamp means send immediately.
        output.send([0x80, 60, 0x40], window.performance.now() + 1000.0); // timestamp = now + 1000ms.
    }
}
