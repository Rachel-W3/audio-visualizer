// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, gainNode, reverb, oscillator, distortion, distortionFilter;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
   gain : 0.5,
   numSamples : 256
});

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array(DEFAULTS.numSamples/2);

// **Next are "public" methods - we are going to export all of these at the bottom of this file**
function setupWebAudio(filePath){
    // 1 - The || is because WebAudio has not been standardized across browsers yet
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // 2 - this creates an <audio> element
    element = new Audio(); //document.querySelector("audio");

    // 3 - have it point at a sound file
    loadSoundFile(filePath);

    distortion = false;

    // 4 - create an a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

    // 5 - create an analyser node
    // note the UK spelling of "Analyser"
    analyserNode = audioCtx.createAnalyser();

    /*
    // 6
    We will request DEFAULTS.numSamples number of samples or "bins" spaced equally 
    across the sound spectrum.

    If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
    the third is 344Hz, and so on. Each bin contains a number between 0-255 representing 
    the amplitude of that frequency.
    */ 

    // fft stands for Fast Fourier Transform
    analyserNode.fftSize = DEFAULTS.numSamples;

    // 7 - create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    // Create reverb with convolver node - abandoned
    // reverb = createReverb(element.src);

    // Create oscillator node for square wave effect - abandoned
    // oscillator = audioCtx.createOscillator();
    // oscillator.type = "square";

    let biquadFilter = audioCtx.createBiquadFilter();
	biquadFilter.type = "highshelf";

	distortionFilter = audioCtx.createWaveShaper();

    // 8 - connect the nodes - we now have an audio graph
    sourceNode.connect(distortionFilter);
    distortionFilter.connect(analyserNode);
    analyserNode.connect(gainNode);
    // oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // gainNode.connect(reverb);
    // reverb.connect(audioCtx.destination);
}

// This function was originally for reverb, but I couldn't get it to work in the limited time
// Source code: https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode
function createReverb(filePath) {
    let convolver = audioCtx.createConvolver();

    // load impulse response from file\
    const request = async function() {
        let response = await fetch(filePath);
        //const json = await response.json();
        let arraybuffer  = await response.arrayBuffer();
        return arraybuffer;
    }

    request().then(function(arraybuffer) {
        // console.log(arraybuffer);
        audioCtx.decodeAudioData(arraybuffer,
                                function(buffer) {
                                convolver.buffer = buffer;
                                },
                                function(e) {
                                alert("Error when decoding audio data" + e.err);
        });
    });

    return convolver;
}

function loadSoundFile(filePath) {
    element.src = filePath;
}

function playCurrentSound(){
    element.play();
}

function pauseCurrentSound(){
    element.pause();
}

function setVolume(value){
    value = Number(value); // make sure that it's a Number rather than a String
    gainNode.gain.value = value;
}

function toggleDistortion(checked){
    distortion = checked;
    if(distortion){
        distortionFilter.curve = null; // being paranoid and trying to trigger garbage collection
        distortionFilter.curve = makeDistortionCurve();
    }else{
        distortionFilter.curve = null;
    }
}

function makeDistortionCurve() {
    let n_samples = 256, curve = new Float32Array(n_samples);
    let k = 20;
    let deg = Math.PI / 180;
    for (let i =0 ; i < n_samples; ++i ) {
        let x = i * 2 / n_samples - 1;
        //curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
        //curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
        //curve[i] =(Math.PI + 100 * x/2) / (Math.PI + 100 * Math.abs(x)); // nice distortion
        //curve[i] = -(Math.PI + 100 * x/2) / (Math.PI + 50 * Math.abs(x));

        //curve[i] = Math.random() * 2 - 1;	// static!	
        //curve[i] = x * 5 + Math.random() * 2 - 1; // adds a less intrusive static to the audio
        //curve[i] = x * Math.sin(x) * amount/5; // sounds like a cross between Donlad Duck and Cartman from South Park
        //curve[i] = x * x - Math.tan(x) - .5 * x * 2 * Math.cos(x * 5);

        curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
}

export {audioCtx, setupWebAudio, playCurrentSound, pauseCurrentSound, loadSoundFile, setVolume, element, analyserNode, distortion, toggleDistortion};