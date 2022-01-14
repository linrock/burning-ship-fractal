import { useEffect, useRef, useState } from 'react';

export function FractalCanvas({ width, height, xRange, yRange, colorFunc }) {
  const canvasElRef = useRef();
  const [actualWidth, setActualWidth] = useState();
  const [actualHeight, setActualHeight] = useState();

  const [mousePosX, setMousePosX] = useState();
  const [mousePosY, setMousePosY] = useState();

  useEffect(() => {
    console.log(`canvas width is ${canvasElRef.current.offsetWidth}`);
    setActualWidth(canvasElRef.current.offsetWidth);
    setActualHeight(canvasElRef.current.offsetHeight);
  }, [canvasElRef.current]);

  return <figure>
    <canvas width={width} height={height}
      ref={canvasElRef}
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
    <figcaption>({mousePosX}, {mousePosY})</figcaption>
  </figure>;
}
