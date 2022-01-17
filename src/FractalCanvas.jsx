import { useEffect, useRef, useState } from 'react';

const MAX_ITERATIONS = 255;
const ESCAPE_RADIUS = 2;

const ESCAPE_THRESHOLD = ESCAPE_RADIUS * ESCAPE_RADIUS;
const LOG_ESCAPE_RADIUS = Math.log(ESCAPE_RADIUS);

/** Iterate until escape (diverges) or exceeding the max # of iterations */
function iterateUntilEscape(x0, y0) {
  let x = 0, y = 0;
  let iteration = 0;
  while ((x*x + y*y < ESCAPE_THRESHOLD) && (iteration < MAX_ITERATIONS)) {
    const x_n = x*x - y*y + x0;
    const y_n = 2 * Math.abs(x*y) + y0;
    x = x_n;
    y = y_n;
    iteration++;
  }
  return [iteration, Math.sqrt(x*x + y*y)];
}

function getMu(numIterations, escapeDistance) {
  // https://mathr.co.uk/helm/AtTheHelmOfTheBurningShip-Paper.pdf
  return numIterations + 1 - Math.log2(Math.log(escapeDistance));
  // return numIterations + 1 - Math.log(Math.log(escapeDistance) / LOG_ESCAPE_RADIUS);
}

function drawBurningShipFractal(canvasEl, xRange, yRange, colorFunc) {
  const canvasWidth = canvasEl.width;
  const canvasHeight = canvasEl.height;
  const context = canvasEl.getContext('2d');
  const canvasImageData = context.createImageData(canvasWidth, canvasHeight);
  const image = canvasImageData.data;
  for (let i = 0; i < canvasHeight; i++) {
    for (let j = 0; j < canvasWidth; j++) {
      const x0 = xRange[0] + j * (xRange[1] - xRange[0]) / canvasWidth;
      const y0 = yRange[0] + i * (yRange[1] - yRange[0]) / canvasHeight;
      const [numIterations, escapeDistance] = iterateUntilEscape(x0, y0);
      const ind = i * canvasWidth * 4 + j * 4;
      if (numIterations !== MAX_ITERATIONS) {
        const mu = getMu(numIterations, escapeDistance);
        const pixels = colorFunc({ numIterations, mu });
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
  const [mouseDownPos, setMouseDownPos] = useState([null, null]);
  const [mouseClickPos, setMouseClickPos] = useState([null, null]);

  const [isRendered, setIsRendered] = useState(false);
  const [previewImgData, setPreviewImgData] = useState();

  const canvasElRef = useRef();

  // track the actual width and height of the canvas DOM element and render preview images
  useEffect(() => {
    const canvasEl = canvasElRef.current;
    const actualWidth = canvasEl.offsetWidth;
    const actualHeight = canvasEl.offsetHeight;
    setActualWidth(actualWidth);
    setActualHeight(actualHeight);
    /*
    console.log(`canvas changed
  el size: (${actualWidth}, ${actualHeight})
  xRange: (${xRange})
  yRange: (${yRange})
    `);
    */
    // render a low-quality preview early on
    const previewCanvasEl = document.createElement('canvas');
    previewCanvasEl.width = actualWidth / 8;
    previewCanvasEl.height = actualHeight / 8;
    requestAnimationFrame(() => {
      drawBurningShipFractal(previewCanvasEl, xRange, yRange, colorFunc);
      setPreviewImgData(previewCanvasEl.toDataURL('image/png'));

      previewCanvasEl.width = actualWidth / 4;
      previewCanvasEl.height = actualHeight / 4;
      requestAnimationFrame(() => {
        drawBurningShipFractal(previewCanvasEl, xRange, yRange, colorFunc);
        setPreviewImgData(previewCanvasEl.toDataURL('image/png'));

        previewCanvasEl.width = actualWidth / 2;
        previewCanvasEl.height = actualHeight / 2;
        requestAnimationFrame(() => {
          drawBurningShipFractal(previewCanvasEl, xRange, yRange, colorFunc);
          setPreviewImgData(previewCanvasEl.toDataURL('image/png'));
        });
      });
    });
  }, [canvasElRef, xRange, yRange, colorFunc]);

  useEffect(() => {
    if (!isRendered) {
      // clear the canvas so the previous drawing doesn't show through
      const canvasEl = canvasElRef.current;
      canvasEl.width = canvasEl.width;   // eslint-disable-line no-self-assign
      canvasEl.height = canvasEl.height; // eslint-disable-line no-self-assign
    }
  }, [canvasElRef, isRendered]);

  // listen for a "render" event, unlisten, then render the canvas
  useEffect(() => {
    const canvasEl = canvasElRef.current;
    const renderListener = () => {
      canvasEl.removeEventListener('render', renderListener);
      if (!isRendered) {
        console.log('not rendered yet! rendering...');
        // render the full-quality canvas
        requestAnimationFrame(() => {
          drawBurningShipFractal(canvasEl, xRange, yRange, colorFunc);
          setIsRendered(true);
        });
      }
    };
    canvasEl.addEventListener('render', renderListener);
  }, [canvasElRef, isRendered, xRange, yRange, colorFunc]);

  // listen for an event with coordinates to render
  useEffect(() => {
    const canvasEl = canvasElRef.current;
    canvasEl.addEventListener('force-render', (event) => {
      console.dir(event);
      requestAnimationFrame(() => {
        // drawBurningShipFractal(canvasEl, xRange, yRange, colorFunc);
      });
    });
  }, [canvasElRef, colorFunc]);

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
      <img src={previewImgData} alt="burning ship fractal"
           style={{ display: (!isRendered && previewImgData) ? 'block': 'none' }}/>
      <canvas ref={canvasElRef}
        width={width}
        height={height}
        onMouseDown={(event) => {
          const [mouseDownX, mouseDownY] = mouseXY(event);
          setMouseDownPos([mouseDownX, mouseDownY]);
        }}
        onMouseUp={(event) => {
          const [mouseUpX, mouseUpY] = mouseXY(event);
          const [mouseDownX, mouseDownY] = mouseDownPos;
          if (mouseUpX === mouseDownX && mouseUpY === mouseDownY) {
            const [mouseClickX, mouseClickY] = mouseClickPos;
            if (mouseClickX == null && mouseClickY === null) {
              // if no previous click, register the mouse click
              setMouseClickPos([mouseUpX, mouseUpY]);
            } else {
              // zoom in to the selected area
              setMouseClickPos([null, null]);
              if (mouseUpX < mouseClickX) {
                setXrange([mouseUpX, mouseClickX]);
              } else {
                setXrange([mouseClickX, mouseUpX]);
              }
              if (mouseUpY < mouseClickY) {
                setYrange([mouseUpY, mouseClickY]);
              } else {
                setYrange([mouseClickY, mouseUpY]);
              }
              setIsRendered(false);
            }
            return;
          }
          // pan the camera view
          const xPan = mouseDownX - mouseUpX;
          const yPan = mouseDownY - mouseUpY;
          setXrange([xRange[0] + xPan, xRange[1] + xPan]);
          setYrange([yRange[0] + yPan, yRange[1] + yPan]);
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
        }}
        onWheel={(event) => {
          // console.log(`wheel! ${event.deltaY}`);
          event.preventDefault();
          const wheelDirection = event.deltaY > 0 ? 1 : -1;
          const xRangeStep = (xRange[1] - xRange[0]) / 10 * wheelDirection;
          const yRangeStep = (yRange[1] - yRange[0]) / 10 * wheelDirection;
          setXrange([xRange[0] - xRangeStep, xRange[1] + xRangeStep]);
          setYrange([yRange[0] - yRangeStep, yRange[1] + yRangeStep]);
          setIsRendered(false);
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
