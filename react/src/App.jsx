import SyntaxHighlighter from 'react-syntax-highlighter';
import { shadesOfPurple } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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
        xRange={[-1.95, -1.45]}
        yRange={[-0.09, 0.02]}
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

      <p>
        Here's the largest ship in the fractal, colored based on
        iteration count alone.
      </p>
      <FractalCanvas id="bsf-wide"
        width={1600}
        height={1600}
        xRange={[-1.8, -1.7]}
        yRange={[-0.08, 0.01]}
        colorFunc={(iteration, modulusSq) => {
          return [ 255, ~~(iteration * 7), 0, ~~(iteration * 15) ];
        }}
      />

      <p>
        If we consider the magnitude of the escape, the resulting
        image will appear smoother with the same color palette.
        Here's the largest ship colored with renormalized
        iteration counts.
      </p>
      <FractalCanvas id="bsf-wide-2"
        width={1600}
        height={1600}
        xRange={[-1.8, -1.7]}
        yRange={[-0.08, 0.01]}
        colorFunc={(iteration, modulusSq) => {
          const mu = getMu(iteration, modulusSq);
          return [ 255, ~~(mu * 7), 0, ~~(mu * 15) ];
        }}
      />

      <p>A zoomed-out view of the fractal space</p>
      <FractalCanvas id="bsf-world-overview"
        width={800}
        height={600}
        xRange={[-2.5, 1.5]}
        yRange={[-2, 1.0]}
        colorFunc={(iteration, modulusSq) => {
          const mu = getMu(iteration, modulusSq);
          return [ 255, ~~(mu * 7), 0, ~~(mu * 15) ];
        }}
      />

      <p>Zoomed in to one of the smaller ships</p>
      <FractalCanvas
        width={1600}
        height={2400}
        xRange={[-1.5805, -1.563]}
        yRange={[-0.0405, 0.0057]}
        colorFunc={(iteration, modulusSq) => {
          const mu = getMu(iteration, modulusSq);
          return [ 255, ~~(mu * 6), 0, ~~(mu * 15) ];
        }}
      />

      <p>Another one of the smaller ships</p>
      <FractalCanvas
        width={1600}
        height={1200}
        xRange={[-1.948, -1.925]}
        yRange={[-0.0095,  0.002]}
        colorFunc={(iteration, modulusSq) => {
          const mu = getMu(iteration, modulusSq);
          return [ 255, ~~(mu * 10), 0, ~~(mu * 15) ];
        }}
      />
    </div>

    <div className="container">
      <p>The number of iterations is determined by this equation:</p>
      <SyntaxHighlighter language="javascript" style={shadesOfPurple}>{`
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
`.trim()}</SyntaxHighlighter>
    </div>
  </>
);

export default App;
