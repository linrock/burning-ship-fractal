import { FractalCanvas } from './FractalCanvas';

function getMu(iteration, modulusSq) {
  // https://mathr.co.uk/helm/AtTheHelmOfTheBurningShip-Paper.pdf
  return iteration + 1 - Math.log2(Math.log(Math.sqrt(modulusSq)));
}

const App = () => (
  <>
    <header className="App-header">
      <h1>Burning ship fractal</h1>
      <FractalCanvas id="bsf-wide"
        width={4000}
        height={1000}
        xRange={[-2.0, -1.5]}
        yRange={[-0.09, 0.01]}
        colorFunc={(iteration, modulusSq) => {
          const mu = getMu(iteration, modulusSq);
          return [ 255, ~~(mu * 7), 0, ~~(mu * 15) ];
        }}
      />
    </header>

    <div className="container">
      <p>Images are generated by analyzing points on the complex plane:</p>
      <pre>Z_n+1 = (|Z_re| + i|Z_im|)^2 + (x0, y0)</pre>
      <section>
        <p>
          We can explore fractals by putting different starting (x0, y0) numbers
          into the equation and making note of whether the series:
          <ul>
            <li>diverges to infinity or stays within a limit</li>
            <li>if the series diverges, we can look at:
              <ul>
                <li>the number of iterations until reaching the escape radius</li>
                <li>the magnitude of the escape</li>
              </ul>
            </li>
          </ul>
        </p>
      </section>
    </div>

    <div className="container">
      <pre>{`
const ESCAPE_THRESHOLD = 4;
const MAX_ITERATIONS = 255;

function iterateUntilEscape(x0, y0) {
  let x = 0;
  let y = 0;
  let iteration = 0;
  while ((x*x + y*y < ESCAPE_THRESHOLD) &&
         (iteration &lt; MAX_ITERATIONS)) {
    const x_next = x*x - y*y + x0;
    const y_next = 2*Math.abs(x*y) + y0;
    x = x_next;
    y = y_next;
    iteration++;
  }
  return [iteration, x*x + y*y];
}
`.trim()}</pre>
    </div>
  </>
);

export default App;
