/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!
import * as canvas from './canvas.js';
import * as audio from './audio.js';
import * as utils from './utils.js';

const drawParams = {
  showGradient : true,
  showBars : true,
  showCircles : true,
  showNoise : false,
  showInvert : false,
  showEmboss : false,
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1  :  "media/Pokémon Sun and Moon_ Hau'oli City Remix (192 kbps).mp3"
});

function init(){
  audio.setupWebAudio(DEFAULTS.sound1);
	console.log("init called");
	console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  setupUI(canvasElement);
  canvas.setupCanvas(canvasElement,audio.analyserNode);
  loop();
}

function setupUI(canvasElement){
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#fsButton");

  fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
  };

  // B - add .onclick event to button
  playButton.onclick = e => {
    console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

    // check if context is in suspended state (autoplay policy)
    if (audio.audioCtx.state == "suspended") {
      audio.audioCtx.resume();
    }
    console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
    if (e.target.dataset.playing == "no"){
      // if track is currently paused, play it
      audio.playCurrentSound();
      e.target.dataset.playing ="yes"; // our CSS will set the text to "Pause"
    }
    else {
      // if track is playing, pause it
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no"; // our CSS will set the text to "Play"
    }
  };

  // C - hookup volume slider and label
  let volumeSlider = document.querySelector("#volumeSlider");
  let volumeLabel = document.querySelector("#volumeLabel");

  // add .oninput event to slider
  volumeSlider.oninput = e => {
    //set the gain
    audio.setVolume(e.target.value);
    //update the value of label to match value of slider
    volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
  };

  // set value ofo label to match initial value of slider
  volumeSlider.dispatchEvent(new Event("input"));

  // D - hookup track <select>
  let trackSelect = document.querySelector("#trackSelect");
  // add .onchange event to <select>
  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    // pause the current track if it is playing
    if(playButton.dataset.playing = "yes"){
      playbutton.dispatchEvent(new MouseEvent("click"));
    }
  };

  // E - Checkboxes
  document.querySelector("#gradientCB").checked = drawParams.showGradient;
  document.querySelector("#barsCB").checked = drawParams.showBars;
  document.querySelector("#circlesCB").checked = drawParams.showCircles;
  document.querySelector("#noiseCB").checked = drawParams.showNoise;
  document.querySelector("#invertCB").checked = drawParams.showInvert;
  document.querySelector("#embossCB").checked = drawParams.showEmboss;

  document.querySelector("#gradientCB").onchange = e => {
    drawParams.showGradient = e.target.checked;
  }

  document.querySelector("#barsCB").onchange = e => {
    drawParams.showBars = e.target.checked;
  }

  document.querySelector("#circlesCB").onchange = e => {
    drawParams.showCircles = e.target.checked;
  }

  document.querySelector("#noiseCB").onchange = e => {
    drawParams.showNoise = e.target.checked;
  }

  document.querySelector("#invertCB").onchange = e => {
    drawParams.showInvert = e.target.checked;
  }

  document.querySelector("#embossCB").onchange = e => {
    drawParams.showEmboss = e.target.checked;
  }
	
} // end setupUI

function loop(){
  /* NOTE: This is temporary testing code that we will delete in Part II */
    requestAnimationFrame(loop);

    canvas.draw(drawParams);
    // 1) create a byte array (values of 0-255) to hold the audio data
    // normally, we do this once when the program starts up, NOT every frame
    // let audioData = new Uint8Array(audio.analyserNode.fftSize/2);
    
    // 2) populate the array of audio data *by reference* (i.e. by its address)
    // audio.analyserNode.getByteFrequencyData(audioData);
    //audio.analyserNode.getByteTimeDomainData(data); // waveform data
    
    // 3) log out the array and the average loudness (amplitude) of all of the frequency bins
      // console.log(audioData);
      
      // console.log("-----Audio Stats-----");
      // let totalLoudness =  audioData.reduce((total,num) => total + num);
      // let averageLoudness =  totalLoudness/(audio.analyserNode.fftSize/2);
      // let minLoudness =  Math.min(...audioData); // ooh - the ES6 spread operator is handy!
      // let maxLoudness =  Math.max(...audioData); // ditto!
      // // Now look at loudness in a specific bin
      // // 22050 kHz divided by 128 bins = 172.23 kHz per bin
      // // the 12th element in array represents loudness at 2.067 kHz
      // let loudnessAt2K = audioData[11]; 
      // console.log(`averageLoudness = ${averageLoudness}`);
      // console.log(`minLoudness = ${minLoudness}`);
      // console.log(`maxLoudness = ${maxLoudness}`);
      // console.log(`loudnessAt2K = ${loudnessAt2K}`);
      // console.log("---------------------");
  }

export {init};