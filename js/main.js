const max_iterations = 255;

class BurningShipFractalCanvas {
  canvas;
  canvasWidth;
  canvasHeight;
  xRange;
  yRange;
  colorFunc;

  constructor(canvasId, xRange, yRange, colorFunc) {
    this.canvas = document.getElementById(canvasId);
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    this.xRange = xRange;
    this.yRange = yRange;
    this.colorFunc = colorFunc;
    this.canvas.addEventListener('mousedown', (event) => {
      // console.log(`canvas mousedown - ${event.offsetX}, ${event.offsetY}`);
      // console.dir(event);
      const x0 =
        this.xRange[0] * (1 - event.offsetX / this.canvasWidth) +
        this.xRange[1] * (event.offsetX / this.canvasWidth);
      const y0 =
        this.yRange[0] * (1 - event.offsetY / this.canvasHeight) +
        this.yRange[1] * (event.offsetY / this.canvasHeight);
      console.log(`(${x0}, ${y0})`);
      this.xRange[0] = x0;
      this.yRange[0] = y0;
    });
    this.canvas.addEventListener('mouseup', (event) => {
      // console.log(`canvas mouseup - ${event.offsetX}, ${event.offsetY}`);
      // console.dir(event);
      const x1 =
        this.xRange[0] * (1 - event.offsetX / this.canvasWidth) +
        this.xRange[1] * (event.offsetX / this.canvasWidth);
      const y1 =
        this.yRange[0] * (1 - event.offsetY / this.canvasHeight) +
        this.yRange[1] * (event.offsetY / this.canvasHeight);
      this.xRange[1] = x1;
      this.yRange[1] = y1;
      this.render();
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
        let x = 0;
        let y = 0;
        let iteration = 0;
        while ((x * x + y * y < 4) && (iteration < max_iterations)) {
          const x_n = x * x - y * y + x0;
          const y_n = 2 * Math.abs(x * y) + y0;
          x = x_n;
          y = y_n;
          iteration++;
        }
        const ind = i * this.canvasWidth * 4 + j * 4;
        const pixels = this.colorFunc(iteration);
        for (let p = 0; p < 4; p++) {
          image[ind + p] = pixels[p];
        }
      }
    }
    context.putImageData(canvasImageData, 0, 0);
  }
}

// let x_range = [-1.88, -1.7];
// const midpoint = [0.45, 0.5];
// const range = 1.7;
// x_range = [midpoint[0] - 2 * range, midpoint[0] +  range];
// y_range = [midpoint[1] - 2 * range, midpoint[1] +  range];


function drawCanvases() {
  // console.log(`${JSON.stringify(x_range)} ${JSON.stringify(y_range)}`);

  new BurningShipFractalCanvas(
    'bsf-1', 
    [-1.8, -1.7],
    [-0.08, 0.01],
    (iteration) => [
      25 + iteration * 30,
      25 + iteration * 10,
      85 - iteration * 5,
      255,
    ]
  ).render();

  new BurningShipFractalCanvas(
    'bsf-2',
    [-1.8, -1.7],
    [-0.08, 0.01],
    (iteration) => [
      Math.sin(0.016 * iteration + 4) * 230 + 25,
      Math.sin(0.013 * iteration + 2) * 230 + 25,
      Math.sin(0.01 * iteration + 1) * 230 + 25,
      255,
    ]
  ).render();

  new BurningShipFractalCanvas(
    'bsf-3',
    [-1.8, -1.7],
    [-0.08, 0.01],
    (iteration) => [0, 0, 0, iteration],
  ).render();

  new BurningShipFractalCanvas(
    'bsf-large',
    [-2.5, 1.5],
    [-2, 1],
    (iteration) => [0, 0, 0, iteration],
  ).render();

  new BurningShipFractalCanvas(
    'bsf-wide',
    [-2.0, -1.5],
    [-0.09, 0.02],
    (iteration) => [
      Math.sin(0.016 * iteration + 4) * 230 + 25,
      Math.sin(0.013 * iteration + 2) * 230 + 25,
      Math.sin(0.01 * iteration + 1) * 230 + 25,
      255,
    ]
  ).render();
}

{
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
