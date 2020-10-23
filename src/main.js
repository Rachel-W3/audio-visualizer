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
  showParticles: true,
  showBars: true,
  dayTime: false,
  showNoise: false,
  showInvert: false,
  showEmboss: false,
  particleMultiplier: 1
};

let startTime;
let elapsedTime;

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  sound1: "media/Cave Story - Moonsong (Curly's Deep House Remix) - GameChops (192 kbps).mp3"
});

function init() {
  audio.setupWebAudio(DEFAULTS.sound1);
  console.log("init called");
  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  setupUI(canvasElement);
  canvas.setupCanvas(canvasElement, audio.analyserNode);
  loop();
  // // Generate some more particles after every second
  // let min = 5 * drawParams.particleMultiplier;
  // let max = 15 * drawParams.particleMultiplier;
  // setInterval(canvas.generateParticles, 1000, utils.getRandom(min,max));
}

function setupUI(canvasElement) {
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
    if (e.target.dataset.playing == "no") {
      // if track is currently paused, play it
      audio.playCurrentSound();
      e.target.dataset.playing = "yes"; // our CSS will set the text to "Pause"
    }
    else {
      // if track is playing, pause it
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no"; // our CSS will set the text to "Play"
    }
  };

  // C - hookup sliders and labels
  let volumeSlider = document.querySelector("#volumeSlider");
  let volumeLabel = document.querySelector("#volumeLabel");
  let pmSlider = document.querySelector("#pmSlider");
  let pmLabel = document.querySelector("#pmLabel");

  // add .oninput event to slider
  volumeSlider.oninput = e => {
    //set the gain
    audio.setVolume(e.target.value);
    //update the value of label to match value of slider
    volumeLabel.innerHTML = Math.round((e.target.value / 2 * 100));
  };

  pmSlider.oninput = e => {
    drawParams.particleMultiplier = e.target.value;
    pmLabel.innerHTML = e.target.value;
  }

  // set value of label to match initial value of slider
  volumeSlider.dispatchEvent(new Event("input"));
  pmSlider.dispatchEvent(new Event("input"));

  // D - hookup track <select>
  let trackSelect = document.querySelector("#trackSelect");
  // add .onchange event to <select>
  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value);
    // pause the current track if it is playing
    if (playButton.dataset.playing = "yes") {
      playbutton.dispatchEvent(new MouseEvent("click"));
    }
  };

  // E - Checkboxes
  document.querySelector("#particlesCB").checked = drawParams.showParticles;
  document.querySelector("#barsCB").checked = drawParams.showBars;
  document.querySelector("#dayCB").checked = drawParams.dayTime;
  document.querySelector("#noiseCB").checked = drawParams.showNoise;
  document.querySelector("#invertCB").checked = drawParams.showInvert;
  document.querySelector("#embossCB").checked = drawParams.showEmboss;

  document.querySelector("#particlesCB").onchange = e => {
    drawParams.showParticles = e.target.checked;
  }

  document.querySelector("#barsCB").onchange = e => {
    drawParams.showBars = e.target.checked;
  }

  document.querySelector("#dayCB").onchange = e => {
    drawParams.dayTime = e.target.checked;
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



function loop(timeStamp) {
  requestAnimationFrame(loop);

  if(startTime == undefined) startTime = timeStamp;
  elapsedTime = timeStamp - startTime;

  canvas.draw(drawParams);
  
  if(elapsedTime > 1000) {
    // Generate some more particles after every second
    let min = 5 * drawParams.particleMultiplier;
    let max = 15 * drawParams.particleMultiplier;
    canvas.generateParticles(utils.getRandom(min,max));
    startTime = timeStamp;
    elapsedTime = timeStamp - startTime;
  }
}

export { init };