const MAX_ITERATIONS = 255;
const ESCAPE_RADIUS = 2;

const ESCAPE_THRESHOLD = ESCAPE_RADIUS * ESCAPE_RADIUS;
// const LOG_ESCAPE_RADIUS = Math.log(ESCAPE_RADIUS);

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

/** re-normalized iteration count for smoother images */
function getMu(numIterations, escapeDistance) {
  // https://mathr.co.uk/helm/AtTheHelmOfTheBurningShip-Paper.pdf
  // log base 2 assumes an escape radius of 2
  return numIterations + 1 - Math.log2(Math.log(escapeDistance));
  // return numIterations + 1 - Math.log(Math.log(escapeDistance) / LOG_ESCAPE_RADIUS);
}

/** Given a canvas element, draw a fractal using the escape time method */
export function drawBurningShipFractal(canvasEl, xRange, yRange, colorFunc) {
  const canvasWidth = canvasEl.width;
  const canvasHeight = canvasEl.height;
  const context = canvasEl.getContext('2d');
  const canvasImageData = context.createImageData(canvasWidth, canvasHeight);
  const image = canvasImageData.data;
  for (let i = 0; i < canvasHeight; i++) {
    for (let j = 0; j < canvasWidth; j++) {
      const x0 = xRange[0] + j*(xRange[1] - xRange[0]) / canvasWidth;
      const y0 = yRange[0] + i*(yRange[1] - yRange[0]) / canvasHeight;
      const [numIterations, escapeDistance] = iterateUntilEscape(x0, y0);
      const pixelIndex = 4*i*canvasWidth + 4*j;
      if (numIterations !== MAX_ITERATIONS) {
        const mu = getMu(numIterations, escapeDistance);
        const pixels = colorFunc({ numIterations, mu });
        for (let p = 0; p < 4; p++) {
          image[pixelIndex + p] = pixels[p];
        }
      }
    }
  }
  context.putImageData(canvasImageData, 0, 0);
}

