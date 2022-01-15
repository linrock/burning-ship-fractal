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

function drawCanvas(canvasEl, xRange, yRange, colorFunc) {
  const canvasWidth = canvasEl.width;
  const canvasHeight = canvasEl.height;
  const context = canvasEl.getContext('2d');
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
  context.putImageData(canvasImageData, 0, 0);
}

/** Interactive canvas that draws burning ship fractals */
export function FractalCanvas({ width, height, xRange: xRangeInit, yRange: yRangeInit, colorFunc }) {
  const [xRange, setXrange] = useState(xRangeInit);
  const [yRange, setYrange] = useState(yRangeInit);

  const [actualWidth, setActualWidth] = useState();
  const [actualHeight, setActualHeight] = useState();

  const [mousePosX, setMousePosX] = useState();
  const [mousePosY, setMousePosY] = useState();

  const [isRendered, setIsRendered] = useState(false);
  const [previewImgData, setPreviewImgData] = useState();

  const canvasElRef = useRef();
  const imgPreviewElRef = useRef();

  // track the actual width and height of the canvas DOM element
  useEffect(() => {
    const canvasEl = canvasElRef.current;
    const actualWidth = canvasEl.offsetWidth;
    const actualHeight = canvasEl.offsetHeight;
    setActualWidth(actualWidth);
    setActualHeight(actualHeight);
    console.log(`canvas changed
  el size: (${actualWidth}, ${actualHeight})
  xRange: (${xRange})
  yRange: (${yRange})
    `);
    // render a low-quality preview early on
    const previewCanvasEl = document.createElement('canvas');
    previewCanvasEl.width = actualWidth / 10;
    previewCanvasEl.height = actualHeight / 10;
    requestAnimationFrame(() => {
      drawCanvas(previewCanvasEl, xRange, yRange, colorFunc);
      setPreviewImgData(previewCanvasEl.toDataURL('image/png'));
    });
  }, [canvasElRef, xRange, yRange]);

  // listen for a "render" event, unlisten, then render the canvas
  useEffect(() => {
    const canvasEl = canvasElRef.current;
    const renderListener = () => {
      canvasEl.removeEventListener('render', renderListener);
      if (!isRendered) {
        console.log('not rendered yet! rendering...');
        // render the full-quality canvas
        requestAnimationFrame(() => {
          drawCanvas(canvasEl, xRange, yRange, colorFunc);
          setIsRendered(true);
        });
      }
    };
    canvasEl.addEventListener('render', renderListener);
  }, [canvasElRef, isRendered, xRange, yRange, colorFunc]);


  // for calculating mouse (x, y) positions over the canvas relative to actual size
  const mouseXY = (event) => {
    // hack: parentNode for .image-container offsetLeft and offsetTop
    const X = (event.pageX - event.target.parentNode.offsetLeft);
    const Y = (event.pageY - event.target.parentNode.offsetTop);
    // console.log(`(${X}, ${Y})`);
    const Xscaled = X / actualWidth;
    const Yscaled = Y / actualHeight;
    const mouseX = xRange[0]*(1 - Xscaled) + xRange[1]*Xscaled;
    const mouseY = yRange[0]*(1 - Yscaled) + yRange[1]*Yscaled;
    return [mouseX, mouseY];
  }

  return <figure>
    <div className="image-container">
      {isRendered || <img src={previewImgData} style={{ width: '100%' }}/>}
      <canvas ref={canvasElRef}
        width={width}
        height={height}
        onMouseDown={(event) => {
          const [mouseX, mouseY] = mouseXY(event);
          setXrange([mouseX, xRange[1]]);
          setYrange([mouseY, yRange[1]]);
        }}
        onMouseUp={(event) => {
          const [mouseX, mouseY] = mouseXY(event);
          setXrange([xRange[0], mouseX]);
          setYrange([yRange[0], mouseY]);
          setIsRendered(false);
        }}
        onMouseMove={(event) => {
          const [mouseX, mouseY] = mouseXY(event);
          setMousePosX(mouseX.toPrecision(4));
          setMousePosY(mouseY.toPrecision(4));
        }}
        onMouseLeave={() => {
          setMousePosX(null);
          setMousePosY(null);
        }}>
      </canvas>
    </div>
    <figcaption>
      x [{xRange[0]}, {xRange[1]}] <br/>
      y [{yRange[0]}, {yRange[1]}] <br/>
      {(mousePosX && mousePosY) ? `(${mousePosX}, ${mousePosY})` : '.'}
    </figcaption>
  </figure>;
}
