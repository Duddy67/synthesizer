
class MIDI {
    #midiAccess = null;
    #inputs = null;
    #outputs = null;

    /*
     * In case of success, a MIDIAccess object is passed as parameter.
     * NOTE: An arrow function has to be used here or 'this' won't be available.
     */
    #onMIDISuccess = (midiAccess) => {
        // Set the MIDIAccess object.
        this.#midiAccess = midiAccess;

        console.log(midiAccess);

        this.#inputs = this.#midiAccess.inputs;
        this.#outputs = this.#midiAccess.outputs;
        
        this.#listInputsAndOutputs();


        for (var input of this.#midiAccess.inputs.values()) {
            input.onmidimessage = this.getMIDIMessage;
        }

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

    getMIDIMessage(message) {
        console.log(message);
        var command = message.data[0];
        var note = message.data[1];
        // A velocity value might not be included with a noteOff command.
        var velocity = (message.data.length > 2) ? message.data[2] : 0; 
    }
}
