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
  showNoise: false,
  showEmboss: false,
  particleMultiplier: 1,
  spawnRate: 1,
  barSpacing: 5,
  mode: "nightTime",
};

let startTime;
let elapsedTime;

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  sound1: "media/Cave-Story_Moonsong.mp3"
});

function init() {
  audio.setupWebAudio(DEFAULTS.sound1);
  console.log("init called");
  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  setupUI(canvasElement);
  canvas.setupCanvas(canvasElement, audio.analyserNode);
  loop();
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
  let rateSlider = document.querySelector("#rateSlider");
  let rateLabel = document.querySelector("#rateLabel");
  let spacingSlider = document.querySelector("#spacingSlider");
  let spacingLabel = document.querySelector("#spacingLabel");

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

  rateSlider.oninput = e => {
    drawParams.spawnRate = e.target.value;
    rateLabel.innerHTML = e.target.value;
  }

  spacingSlider.oninput = e => {
    drawParams.barSpacing = e.target.value;
    spacingLabel.innerHTML = e.target.value;
  }

  // set value of label to match initial value of slider
  volumeSlider.dispatchEvent(new Event("input"));
  pmSlider.dispatchEvent(new Event("input"));
  rateSlider.dispatchEvent(new Event("input"));
  spacingSlider.dispatchEvent(new Event("input"));

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
  document.querySelector("#noiseCB").checked = drawParams.showNoise;
  document.querySelector("#embossCB").checked = drawParams.showEmboss;
  document.querySelector('#distortionCB').checked = audio.distortion;

  document.querySelector("#particlesCB").onchange = e => {
    drawParams.showParticles = e.target.checked;
  }

  document.querySelector("#barsCB").onchange = e => {
    drawParams.showBars = e.target.checked;
  }

  document.querySelector("#noiseCB").onchange = e => {
    drawParams.showNoise = e.target.checked;
  }

  document.querySelector("#embossCB").onchange = e => {
    drawParams.showEmboss = e.target.checked;
  }

  document.querySelector('#distortionCB').onchange = e => {
    audio.toggleDistortion(e.target.checked);
  }

  // Radio boxes
  let radios = document.querySelectorAll("input[type=radio][name=mode]");
  for(let i = 0; i < radios.length; i++) {
    radios[i].onchange = () => {
      if(radios[i].checked) {
        drawParams.mode = radios[i].value;
      }
    }
  }
} // end setupUI

function updateProgressBar() {
  let currentTime = audio.element.currentTime;
  let duration = audio.element.duration;
  document.querySelector("#bar").style.width = (currentTime/duration * 100) + "%";
  document.querySelector("#progressLabel").innerHTML = `${toMMSS(currentTime)}/${toMMSS(duration)}`;
}

function toMMSS(value) {
  let minutes = Math.floor(value / 60);
  let seconds = value % 60;

  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  
  return minutes+':'+String(seconds).substring(0, 2); // Make sure the seconds are truncated
}

function loop(timeStamp) {
  requestAnimationFrame(loop);

  if(startTime == undefined) startTime = timeStamp;
  elapsedTime = timeStamp - startTime;

  canvas.draw(drawParams);
  updateProgressBar();
  
  if(elapsedTime > 1000 * drawParams.spawnRate) {
    // Generate some more particles after every second
    let min = 5 * drawParams.particleMultiplier;
    let max = 15 * drawParams.particleMultiplier;
    canvas.generateParticles(utils.getRandom(min,max));
    startTime = timeStamp;
    elapsedTime = timeStamp - startTime;
  }
}

export { init };