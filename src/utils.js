// Why are the all of these ES6 Arrow functions instead of regular JS functions?
// No particular reason, actually, just that it's good for you to get used to this syntax
// For Project 2 - any code added here MUST also use arrow function syntax

const makeColor = (red, green, blue, alpha = 1) => {
  return `rgba(${red},${green},${blue},${alpha})`;
};

const getRandom = (min, max) => {
  return Math.random() * (max - min) + min;
};

const getRandomUnitVector = () => {
  let x = getRandom(-1, 1);
  let y = getRandom(-1, 1);
  let length = Math.sqrt(x * x + y * y);
  if (length == 0) { // very unlikely
    x = -1; // point left
    y = 0;
    length = 1;
  } 
  else {
    x /= length;
    y /= length;
  }
  return { x: x, y: y };
}

const getRandomColor = () => {
  const floor = 35; // so that colors are not too bright or too dark 
  const getByte = () => getRandom(floor, 255 - floor);
  return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};

const getLinearGradient = (ctx, startX, startY, endX, endY, colorStops) => {
  let lg = ctx.createLinearGradient(startX, startY, endX, endY);
  for (let stop of colorStops) {
    lg.addColorStop(stop.percent, stop.color);
  }
  return lg;
};

const goFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullscreen) {
    element.mozRequestFullscreen();
  } else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
  // .. and do nothing if the method is not supported
};

// Code taken from http://www.independent-software.com/determining-coordinates-on-a-html-canvas-bezier-curve.html
// Needs to be separated
const getBezierX = (t, sx, cp1x, cp2x, ex) => {
  return Math.pow(1 - t, 3) * sx + 3 * t * Math.pow(1 - t, 2) * cp1x + 3 * t * t * (1 - t) * cp2x + t * t * t * ex;
}

const getBezierY = (t, sy, cp1y, cp2y, ey) => {
  return Math.pow(1 - t, 3) * sy + 3 * t * Math.pow(1 - t, 2) * cp1y + 3 * t * t * (1 - t) * cp2y + t * t * t * ey;
}

export { makeColor, getRandomColor, getRandom, getLinearGradient, goFullscreen, getBezierX, getBezierY, getRandomUnitVector };