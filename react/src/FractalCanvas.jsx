import { useEffect, useRef, useState } from 'react';

const MAX_ITERATIONS = 255;
const ESCAPE_THRESHOLD = 16;

/** Iterate until escape (diverges) or exceeding the max # of iterations */
function iterateUntilEscape(x0, y0) {
  let x = 0, y = 0;
  let iteration = 0;
  while ((x * x + y * y < ESCAPE_THRESHOLD) && (iteration < MAX_ITERATIONS)) {
    const x_n = x * x - y * y + x0;
    const y_n = 2 * Math.abs(x * y) + y0;
    x = x_n;
    y = y_n;
    iteration++;
  }
  return [iteration, x * x + y * y];
}

function drawCanvas(canvas, xRange, yRange, colorFunc) {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const context = canvas.getContext('2d');
  const canvasImageData = context.createImageData(canvasWidth, canvasHeight);
  const image = canvasImageData.data;
  for (let i = 0; i < canvasHeight; i++) {
    for (let j = 0; j < canvasWidth; j++) {
      const x0 = xRange[0] + j * (xRange[1] - xRange[0]) / canvasWidth;
      const y0 = yRange[0] + i * (yRange[1] - yRange[0]) / canvasHeight;
      const [numIterations, escapeDistSq] = iterateUntilEscape(x0, y0);
      const ind = i * canvasWidth * 4 + j * 4;
      if (numIterations !== MAX_ITERATIONS) {
        const pixels = colorFunc(numIterations, escapeDistSq);
        for (let p = 0; p < 4; p++) {
          image[ind + p] = pixels[p];
        }
      }
    }
  }
  requestAnimationFrame(() => {
    context.putImageData(canvasImageData, 0, 0);
  });
}

/** Interactive canvas that draws burning ship fractals */
export function FractalCanvas({ width, height, xRange: xRangeInit, yRange: yRangeInit, colorFunc }) {
  const [xRange, setXrange] = useState(xRangeInit);
  const [yRange, setYrange] = useState(yRangeInit);

  const [actualWidth, setActualWidth] = useState();
  const [actualHeight, setActualHeight] = useState();

  const [mousePosX, setMousePosX] = useState();
  const [mousePosY, setMousePosY] = useState();

  const canvasElRef = useRef();
  useEffect(() => {
    const canvas = canvasElRef.current;
    console.log(`canvas width is ${canvasElRef.current.offsetWidth}`);
    setActualWidth(canvas.offsetWidth);
    setActualHeight(canvas.offsetHeight);
    drawCanvas(canvas, xRange, yRange, colorFunc);
  }, [canvasElRef.current, xRange, yRange, colorFunc]);

  return <figure>
    <canvas width={width} height={height}
      ref={canvasElRef}
      onMouseDown={(event) => {
        const x0 =
          xRange[0] * (1 - event.clientX / actualWidth) +
          xRange[1] * (event.clientX / actualWidth);
        const y0 =
          yRange[0] * (1 - event.clientY / actualHeight) +
          yRange[1] * (event.clientY / actualHeight);
        setXrange([x0, xRange[1]]);
        setYrange([y0, yRange[1]]);
      }}
      onMouseMove={(event) => {
        const x =
          xRange[0] * (1 - event.clientX / actualWidth) +
          xRange[1] * (event.clientX / actualWidth);
        const y =
          yRange[0] * (1 - event.clientY / actualHeight) +
          yRange[1] * (event.clientY / actualHeight);
        // console.log(`(${x.toPrecision(4)}, ${y.toPrecision(4)})`);
        setMousePosX(x.toPrecision(4));
        setMousePosY(y.toPrecision(4));
      }}
      onMouseLeave={() => {
        console.log('the mouse left');
      }}></canvas>
    <figcaption>
      x [{xRange[0]}, {xRange[1]}] <br/>
      y [{yRange[0]}, {yRange[1]}] <br/>
      {(mousePosX && mousePosY) ? `(${mousePosX}, ${mousePosY})` : '.'}
    </figcaption>
  </figure>;
}
