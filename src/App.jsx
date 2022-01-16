import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { shadesOfPurple } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { FractalCanvas } from './FractalCanvas';

SyntaxHighlighter.registerLanguage('javascript', js);

const App = () => <>
  <header className="App-header">
    <h1>Burning ship fractal</h1>
    <FractalCanvas id="bsf-wide"
      width={4000}
      height={1000}
      xRange={[-1.95, -1.45]}
      yRange={[-0.09, 0.02]}
      colorFunc={(iteration, mu) => [ 255, mu * 7, 0, mu * 15 ]}
    />
  </header>

  <div className="container">
    <p>
      We can visualize the behavior of points on the complex plane in this series:
    </p>
    <div className="equation">
      <span className="series-num series-num-wide">z<sub>n+1</sub></span>
      <span className="series-eq">=</span>
      (|Re(
        <span className="series-num">z<sub>n</sub></span>
      )
      + i|Im(
        <span className="series-num">z<sub>n</sub></span>
      )|)
      <span className="series-super">
        <super style={{ left: '0.1rem' }}>2</super>
      </span> + c
    </div>

    <p>By looking at it the same way as Mandelbrot sets:</p>
    <div className="equation">
      <span className="series-num series-num-wide">z<sub>n+1</sub></span>
      <span className="series-eq">=</span>
      <span className="series-num">z<sub>n</sub><super>2</super></span>
       + c
    </div>
    <section>
      <p>
        We can explore fractals by putting different starting (x0, y0) numbers
        into the equation and making note of whether the series:
      </p>
      <ul>
        <li>diverges to infinity or stays within a limit</li>
        <li>if the series diverges, we make note of:
          <ul>
            <li>the number of iterations until reaching the escape radius</li>
            <li>the distance from zero (0, 0) during the escape</li>
          </ul>
        </li>
      </ul>
    </section>

    <p>
      The largest ship is located on the real axis at -1.75.
    </p>
    <FractalCanvas id="bsf-wide-2"
      width={1600}
      height={1600}
      xRange={[-1.8, -1.7]}
      yRange={[-0.08, 0.01]}
      colorFunc={(iteration, mu) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <h3>World overview</h3>
    <p>
      If we consider an escape radius of 2, the world also has a radius
      of 2, since any points starting outside of the world diverge right away.
    </p>
    <FractalCanvas id="bsf-world-overview"
      width={800}
      height={800}
      xRange={[-2.2, 2.2]}
      yRange={[-2.2, 2.2]}
      colorFunc={(iteration, mu) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>
      The ships are located near the real axis (y = 0) among negative
      real numbers.
    </p>
    <FractalCanvas id="bsf-world-overview"
      width={800}
      height={400}
      xRange={[-2.5, 0.5]}
      yRange={[-1, 0.5]}
      colorFunc={(iteration, mu) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>Zooming in closer to the ships in the bottom left</p>
    <FractalCanvas id="bsf-world-ships"
      width={800}
      height={600}
      xRange={[-1.81, -1.39]}
      yRange={[-0.32, 0.03]}
      colorFunc={(iteration, mu) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>The ship near -1.6 between the largest ship and the dark expanse.</p>
    <FractalCanvas id="bsf-world-16"
      width={800}
      height={800}
      xRange={[-1.65, -1.58]}
      yRange={[-0.074, 0.018]}
      colorFunc={(iteration, mu) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>Small ships near the edge</p>
    <FractalCanvas
      width={800}
      height={400}
      xRange={[-1.59, -1.49]}
      yRange={[-0.052, 0.014]}
      colorFunc={(iteration, mu) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>Zoomed in to the small ship near -1.57</p>
    <FractalCanvas
      width={1600}
      height={1600}
      xRange={[-1.5805, -1.55]}
      yRange={[-0.04, 0.006]}
      colorFunc={(iteration, mu) => [ 255, mu * 6, 0, mu * 15 ]}
    />

    <p>Small ship and disorder near the expanse.</p>
    <FractalCanvas
      width={1600}
      height={1600}
      xRange={[-1.529, -1.499]}
      yRange={[-0.06, 0.005]}
      colorFunc={(iteration, mu) => [ 255, mu * 8, 0, mu * 15 ]}
    />

    <p>
      Behind the largest ship are some very small ships. The light ends
      at (-2, 0)
    </p>
    <FractalCanvas id="bsf-world-back"
      width={800}
      height={600}
      xRange={[-2.04, -1.66]}
      yRange={[-0.142, 0.072]}
      colorFunc={(iteration, mu) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>Zoomed in to a small ship near -1.94</p>
    <FractalCanvas
      width={1600}
      height={1200}
      xRange={[-1.948, -1.925]}
      yRange={[-0.0095,  0.002]}
      colorFunc={(iteration, mu) => [ 255, mu * 8, 0, mu * 20 ]}
    />
  </div>

  <div className="container">
    <h3>Fractal coloring</h3>

    <p>
      Given a starting point (x0, y0), we can calculate the number of
      iterations it takes for the series to diverge, and the distance
      from zero when escaping.
    </p>
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

  <div className="container">
    <p>
      Here's the largest ship in the fractal, colored based on
      iteration count alone.
    </p>
    <FractalCanvas id="bsf-wide"
      width={1600}
      height={1600}
      xRange={[-1.8, -1.7]}
      yRange={[-0.08, 0.01]}
      colorFunc={(iteration) => [ 255, iteration * 7, 0, iteration * 15 ]}
    />
    <p>
      If we consider the escape distance, the resulting
      image will appear smoother. Here's the same image as above colored
      with renormalized iteration counts.
    </p>
    <FractalCanvas id="bsf-wide-2"
      width={1600}
      height={1600}
      xRange={[-1.8, -1.7]}
      yRange={[-0.08, 0.01]}
      colorFunc={(iteration, mu) => [ 255, mu * 7, 0, mu * 15 ]}
    />
  </div>

  <div className="container">
    <h3>Sub-structures</h3>

    <FractalCanvas
      width={1600}
      height={1600}
      xRange={[-1.7825, -1.765]}
      yRange={[-0.0671, -0.0494]}
      colorFunc={(iteration, mu) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <FractalCanvas
      width={1600}
      height={800}
      xRange={[-1.510987, -1.5090825]}
      yRange={[-0.00296972, 0.00066197]}
      colorFunc={(iteration, mu) => [ 255, mu * 5, 0, 255 ]}
    />

    <FractalCanvas
      width={1600}
      height={800}
      xRange={[-2.01, -1.9469]}
      yRange={[-0.02, 0.02]}
      colorFunc={(iteration, mu) => [ 255, mu * 12, 0, mu * 30 ]}
    />
  </div>
</>;

export default App;
