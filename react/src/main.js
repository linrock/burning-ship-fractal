const MAX_ITERATIONS = 255;
const ESCAPE_THRESHOLD = 4;

/** Until escape or exceeding the max # of iterations */
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

class BurningShipFractalCanvas {
  canvas;
  canvasWidth;
  canvasHeight;
  actualWidth;
  actualHeight;
  xRange;
  yRange;
  colorFunc;

  constructor(canvasId, xRange, yRange, colorFunc) {
    this.canvas = document.getElementById(canvasId);
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    this.actualWidth = this.canvas.offsetWidth;
    this.actualHeight = this.canvas.offsetHeight;
    this.hasRendered = false;
    this.xRange = xRange;
    this.yRange = yRange;
    this.colorFunc = colorFunc;
    this.canvas.addEventListener('mousedown', (event) => {
      // console.log(`canvas mousedown - ${event.offsetX}, ${event.offsetY}`);
      // console.dir(event);
      const x0 =
        this.xRange[0] * (1 - event.offsetX / this.actualWidth) +
        this.xRange[1] * (event.offsetX / this.actualWidth);
      const y0 =
        this.yRange[0] * (1 - event.offsetY / this.actualHeight) +
        this.yRange[1] * (event.offsetY / this.actualHeight);
      // console.log(`(${x0}, ${y0})`);
      this.xRange[0] = x0;
      this.yRange[0] = y0;
    });
    this.canvas.addEventListener('mouseup', (event) => {
      // console.log(`actual mouseup - ${event.offsetX}, ${event.offsetY}`);
      // console.dir(event);
      const x1 =
        this.xRange[0] * (1 - event.offsetX / this.actualWidth) +
        this.xRange[1] * (event.offsetX / this.actualWidth);
      const y1 =
        this.yRange[0] * (1 - event.offsetY / this.actualHeight) +
        this.yRange[1] * (event.offsetY / this.actualHeight);
      this.xRange[1] = x1;
      this.yRange[1] = y1;
      this.render();
    });
    this.canvas.addEventListener('mousemove', (event) => {
      const x =
        this.xRange[0] * (1 - event.offsetX / this.actualWidth) +
        this.xRange[1] * (event.offsetX / this.actualWidth);
      const y =
        this.yRange[0] * (1 - event.offsetY / this.actualHeight) +
        this.yRange[1] * (event.offsetY / this.actualHeight);
      console.log(`(${x.toPrecision(4)}, ${y.toPrecision(4)})`);
    });
    this.canvas.addEventListener('render', () => {
      if (!this.hasRendered) {
        console.log(`rendering ${canvasId}`);
        this.hasRendered = true;
        this.render();
      }
    });
  }

  render() {
    const context = this.canvas.getContext('2d');
    const canvasImageData = context.createImageData(this.canvasWidth, this.canvasHeight);
    const image = canvasImageData.data;
    for (let i = 0; i < this.canvasHeight; i++) {
      for (let j = 0; j < this.canvasWidth; j++) {
        const x0 = this.xRange[0] + j * (this.xRange[1] - this.xRange[0]) / this.canvasWidth;
        const y0 = this.yRange[0] + i * (this.yRange[1] - this.yRange[0]) / this.canvasHeight;
        const [numIterations, escapeDistSq] = iterateUntilEscape(x0, y0);
        const ind = i * this.canvasWidth * 4 + j * 4;
        if (numIterations !== MAX_ITERATIONS) {
          const pixels = this.colorFunc(numIterations, escapeDistSq);
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
}

function getMu(iteration, modulusSq) {
  // https://mathr.co.uk/helm/AtTheHelmOfTheBurningShip-Paper.pdf
  return iteration + 1 - Math.log2(Math.log(Math.sqrt(modulusSq)));
}

function renderBsfCanvas(canvasId, xRange, yRange, drawFunc) {
  new BurningShipFractalCanvas(canvasId, xRange, yRange, drawFunc);
}

function drawCanvases() {
  // thin and wide at the top of the page
  renderBsfCanvas('bsf-wide',
    [-2.0, -1.5], [-0.09, 0.02],
    (iteration, modulusSq) => {
      const mu = getMu(iteration, modulusSq);
      return [ 255, ~~(mu * 7), 0, ~~(mu * 15) ];
    }
  );

  // large ship - iteration count alone
  renderBsfCanvas('bsf-large-ship-1',
    [-1.8, -1.7], [-0.08, 0.01],
    (iteration, modulusSq) => {
      return [ 255, ~~(iteration * 7), 0, ~~(iteration * 15) ];
    }
  );

  // large ship - re-normalized
  renderBsfCanvas('bsf-large-ship-2',
    [-1.8, -1.7], [-0.08, 0.01],
    (iteration, modulusSq) => {
      const mu = getMu(iteration, modulusSq);
      return [ 255, ~~(mu * 7), 0, ~~(mu * 15) ];
    }
  );

  // zoomed-out view
  renderBsfCanvas('bsf-world-overview',
    [-2.5, 1.5], [-2, 1],
    (iteration, modulusSq) => {
      const mu = getMu(iteration, modulusSq);
      return [ 25 + mu * 30, 25 + mu * 10, 85 - mu * 5, 255 ];
    }
  );

  // zoomed into one of the smaller ships
  renderBsfCanvas('bsf-small-ship-1',
    [-1.5805, -1.563], [-0.0405, 0.0057],
    (iteration, modulusSq) => {
      const mu = getMu(iteration, modulusSq);
      return [ 255, ~~(mu * 5), 0, ~~(mu * 12) ];
    },
  );

  // another one of the smaller ships
  renderBsfCanvas('bsf-small-ship-2',
    [-1.948, -1.925], [-0.0095,  0.002],
    (iteration, modulusSq) => {
      const mu = getMu(iteration, modulusSq);
      return [ 255, ~~(mu * 8), 0, ~~(mu * 20) ];
    },
  );
}

{
 // frequency of polling to decide whether to render a canvas
  const VIZ_POLL_INTERVAL_MS = 200;

  // centralize all fractal canvases in one place
  const fractalCanvases = [];

  const RENDER_EVENT = new CustomEvent('render');

  function renderVisibleFractalCanvases() {
    const viewportHeight = window.innerHeight;
    const canvases = document.getElementsByTagName('canvas');
    [...canvases].forEach((canvas) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportHeight) {
        // canvas is not visible
      } else {
        // canvas is visible
        canvas.dispatchEvent(RENDER_EVENT);
      }
    });
  }

  function renderVisibleFractalCanvasesForever() {
    renderVisibleFractalCanvases();
    setTimeout(() => {
      renderVisibleFractalCanvasesForever();
    }, VIZ_POLL_INTERVAL_MS);
  }

  renderVisibleFractalCanvasesForever();

  document.querySelector("#update").onclick = () => {
    console.log('clicked button');
    x_range[0] = Number(document.querySelector('#x_range_0').value);
    x_range[1] = Number(document.querySelector('#x_range_1').value);
    y_range[0] = Number(document.querySelector('#y_range_0').value);
    y_range[1] = Number(document.querySelector('#y_range_1').value);
    drawCanvases();
  };

  drawCanvases();
}
