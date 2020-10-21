/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;

function setupCanvas(canvasElement,analyserNodeRef){
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"black"},{percent:.25,color:"rgb(0,27,209)"},{percent:.5,color:"rgb(107,126,255)"},{percent:.75,color:"rgb(0,27,209)"},{percent:1,color:"black"}]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize/2);
}

function draw(params={}){
    // 1 - populate the audioData array with the frequency data from the analyserNode
    // notice these arrays are passed "by reference"
    analyserNode.getByteFrequencyData(audioData);
	// OR
	//analyserNode.getByteTimeDomainData(audioData); // waveform data
	
	// 2 - draw background
    ctx.save();
    ctx.fillStyle = "rgb(4, 39, 71)";
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.restore();

    // draw hills
    let rearSX, rearSY, rearCP1X, rearCP1Y, rearCP2X, rearCP2Y, rearEX, rearEY,
        frontSX, frontSY, frontCP1X, frontCP1Y, frontCP2X, frontCP2Y, frontEX, frontEY;

    // Bar variables
    let midpoint = audioData.length / 2;
    let barSpacing = 3;
    let margin = 0;
    let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
    let barWidth = screenWidthForBars / midpoint;
    let barHeight = 200;
    let topSpacing = canvasHeight/2 + 40;

    // Initializing points for bezier curve
    rearSX = canvasWidth/3 * 5;
    rearSY = rearEY = frontSY = frontEY = canvasHeight;
    rearCP1X = canvasWidth/3 * 4;
    rearCP1Y = rearCP2Y = frontCP1Y = frontCP2Y = canvasHeight/2;
    rearCP2X = frontEX = canvasWidth/3 * 2;
    rearEX = frontCP2X = canvasWidth/3;
    frontSX = canvasWidth/3 * -2;
    frontCP1X = canvasWidth/-3;
    
    // 4 - draw rear bars
    if(params.showBars) {
        ctx.save();
        ctx.fillStyle = 'rgba(147, 192, 163, 0.5)';
        // loop through lower frequencies and draw the data over rear hill
        for(let i = midpoint; i >= 0; i--) {
            let bezierX = utils.getBezierX(0.5 - i/audioData.length, rearSX, rearCP1X, rearCP2X, rearEX);
            let bezierY = utils.getBezierY(0.5 + i/audioData.length, rearSY, rearCP1Y, rearCP2Y, rearEY);
            ctx.fillRect(rearCP1X + rearCP2X - bezierX, bezierY + topSpacing - 256-audioData[i]*0.25, barWidth, barHeight);
        }
        // loop through higher frequencies and draw the data over front hill
        for(let i = midpoint-1; i < audioData.length; i++) {
            let bezierX = utils.getBezierX(i/audioData.length, frontSX, frontCP1X, frontCP2X, frontEX);
            let bezierY = utils.getBezierY(i/audioData.length, frontSY, frontCP1Y, frontCP2Y, frontEY);
            ctx.fillRect(bezierX, bezierY + topSpacing - 256-audioData[i]*0.25, barWidth, barHeight);
        }
        ctx.restore();
    }

    // draw rear hill
    ctx.save();
    ctx.fillStyle = 'rgb(32, 90, 69)';
    ctx.beginPath();
    ctx.moveTo(rearSX, rearSY);
    ctx.bezierCurveTo(rearCP1X, rearCP1Y, rearCP2X, rearCP2Y, rearEX, rearEY);
    ctx.fill();
    ctx.restore();

    // draw front bars
    if(params.showBars) {
        ctx.save();
        ctx.fillStyle = 'rgb(147, 192, 163)';
        // loop through higher frequencies and draw the data over front hill
        for(let i = midpoint-1; i < audioData.length; i++) {
            let bezierX = utils.getBezierX(i/audioData.length, frontSX, frontCP1X, frontCP2X, frontEX);
            let bezierY = utils.getBezierY(i/audioData.length, frontSY, frontCP1Y, frontCP2Y, frontEY);
            ctx.fillRect(bezierX, bezierY + topSpacing - 256-audioData[i]*0.25, barWidth, barHeight);
        }
        ctx.restore();
    }

    // draw front hill
    ctx.save();
    ctx.fillStyle = 'rgb(45, 126, 96)';
    ctx.beginPath();
    ctx.moveTo(frontSX, frontSY);
    ctx.bezierCurveTo(frontCP1X, frontCP1Y, frontCP2X, frontCP2Y, frontEX, frontEY);
    ctx.fill();
    ctx.restore();
	
    // 5 - draw circles
    let percent = 0;
    for(let i = 0; i < audioData.length; i++)
    {
        percent += audioData[i]/1000;
    }
    ctx.save();
    ctx.fillStyle = 'rgb(253, 254, 200)';
    ctx.beginPath();
    ctx.arc(600, 100, 60 + percent, 0, Math.PI*2, false);
    ctx.shadowBlur = 50;
    ctx.shadowColor = "rgb(253, 254, 200)";
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // 6 - bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
    // the variable `data` below is a reference to that array
    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width; // not using here
	
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for (let i = 0; i < length; i += 4) {
		// C) randomly change every 20th pixel to red
        if (params.showNoise && Math.random() < .05) {
			// data[i] is the red channel
			// data[i+1] is the green channel
			// data[i+2] is the blue channel
			// data[i+3] is the alpha channel
			data[i] = data[i+1] = data[i+2] = 0;// zero out the red and green and blue channels
			data[i] = 255; // make the red channel 100% red
        } // end if
        
        // D) Invert the values of the color channels
        if(params.showInvert) {
            let red = data[i], green = data[i+1], blue = data[i+2];
            data[i] = 255 - red; // invert red value
            data[i+1] = 255 - green; // invert green value
            data[i+2] = 255 - blue; // invert blue value
            // data[i+3] is the alpha but we're leaving that alone
        }
    } // end for

    // E) Create emboss effect
    // note we are stepping through each sub-pixel
    if(params.showEmboss) {
        for (let i = 0; i < length; i++) {
            if(i % 4 == 3) continue; // skip alpha channel
            data[i] = 127 + 2*data[i] - data[i+4] - data[i+width*4];
        }
    }
	
    // F) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);
}

export {setupCanvas,draw};