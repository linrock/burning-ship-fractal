import { useEffect, useRef, useState } from 'react';
import { drawBurningShipFractal } from './fractal_math';

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

    // render a low-quality preview early while the full-res canvas is being rendered
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

  // when re-rendering, clear the canvas so the previous render doesn't show through
  useEffect(() => {
    if (!isRendered) {
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
