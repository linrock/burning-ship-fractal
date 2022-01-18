import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { shadesOfPurple } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { FractalCanvas } from './FractalCanvas';

SyntaxHighlighter.registerLanguage('javascript', js);

// hack to prevent react hydrate from overwriting pre-rendered katex equations
const Equation = ({ tex }) => <div className="equation" dangerouslySetInnerHTML={
  {__html: tex }
}></div>

const App = () => <>
  <header>
    <h1>Burning ship fractal</h1>
    <FractalCanvas
      width={4000}
      height={1000}
      xRange={[-1.95, -1.45]}
      yRange={[-0.09, 0.02]}
      colorFunc={({ mu }) => [ 255, mu * 7, 0, mu * 15 ]}
    />
  </header>

  <div className="container">
    <p>
      If we plot the escape times for points in this complex plane series,
      we end up in a world of burning ships.
    </p>
    <Equation tex="z_{n+1} = (|Re(z_n)| + |Im(z_n)|)^2 + c" />

    <p>
      The largest ship is located on the real axis at -1.75.
    </p>
    <FractalCanvas
      width={1600}
      height={1600}
      xRange={[-1.8, -1.7]}
      yRange={[-0.08, 0.01]}
      colorFunc={({ mu }) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <h3>World overview</h3>
    <p>
      If we consider an escape radius of 2, the world also has a radius
      of 2, since any points starting outside of the world diverge right away.
    </p>
    <FractalCanvas
      width={800}
      height={800}
      xRange={[-2.2, 2.2]}
      yRange={[-2.2, 2.2]}
      colorFunc={({ mu }) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>
      The ships are located near the real axis (y = 0) among negative
      real numbers.
    </p>
    <FractalCanvas
      width={800}
      height={400}
      xRange={[-2.5, 0.5]}
      yRange={[-1, 0.5]}
      colorFunc={({ mu }) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>Zooming in closer to the ships in the bottom left</p>
    <FractalCanvas
      width={800}
      height={600}
      xRange={[-1.81, -1.39]}
      yRange={[-0.32, 0.03]}
      colorFunc={({ mu }) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>The ship near -1.6 between the largest ship and the dark expanse.</p>
    <FractalCanvas
      width={800}
      height={800}
      xRange={[-1.65, -1.58]}
      yRange={[-0.074, 0.018]}
      colorFunc={({ mu }) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>Small ships near the edge</p>
    <FractalCanvas
      width={800}
      height={400}
      xRange={[-1.59, -1.49]}
      yRange={[-0.052, 0.014]}
      colorFunc={({ mu }) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>Zoomed in to the small ship near -1.57</p>
    <FractalCanvas
      width={1600}
      height={1600}
      xRange={[-1.5805, -1.55]}
      yRange={[-0.04, 0.006]}
      colorFunc={({ mu }) => [ 255, mu * 6, 0, mu * 15 ]}
    />

    <p>Small ship and disorder near the expanse.</p>
    <FractalCanvas
      width={1600}
      height={1600}
      xRange={[-1.529, -1.499]}
      yRange={[-0.06, 0.005]}
      colorFunc={({ mu }) => [ 255, mu * 8, 0, mu * 15 ]}
    />

    <p>
      Behind the largest ship are some very small ships. The light ends
      at (-2, 0)
    </p>
    <FractalCanvas
      width={800}
      height={600}
      xRange={[-2.04, -1.66]}
      yRange={[-0.142, 0.072]}
      colorFunc={({ mu }) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <p>Zoomed in to a small ship near -1.94</p>
    <FractalCanvas
      width={1600}
      height={1200}
      xRange={[-1.948, -1.925]}
      yRange={[-0.0095,  0.002]}
      colorFunc={({ mu }) => [ 255, mu * 8, 0, mu * 20 ]}
    />
  </div>

  <div className="container">
    <h3>Burning ship fractal equation</h3>

    <p>The equation using complex numbers is this:</p>
    <Equation tex="z_{n+1} = (|Re(z_n)| + i|Im(z_n)|)^2 + c" />

    <p>It's similar to the Mandelbrot equation:</p>
    <Equation tex="z_{n+1} = z_n^2 + c" />
    <p>
      Except instead of squaring each number, we add the absolute values of the
      real and imaginary components together, and square the sum instead.
    </p>

    <p>z is a complex number composed of real and imaginary numbers:</p>
    <Equation tex="z = x + iy, \quad{i = \sqrt{-1}}" />

    <p>If we convert to using x and y, the burning ship fractal equation reduces to::</p>
    <Equation tex="x_{n+1} = x_n^2 - y_n^2 + x_0" />
    <Equation tex="y_{n+1} = 2|x_ny_n| + y_0" />

    <section>
      <p>
        One way of exploring fractals is by putting different starting (x0, y0)
        numbers into the equation and making note of whether the series:
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
  </div>

  <div className="container">
    <h3>Fractal coloring</h3>

    <p>
      Escape time: given a starting point (x0, y0), we can give each
      point a color by calculating the number of iterations it takes
      for the series to diverge, and the distance from zero when escaping.
    </p>
    <SyntaxHighlighter language="javascript" style={shadesOfPurple}>{`
const ESCAPE_THRESHOLD = 4;
const MAX_ITERATIONS = 255;

function iterateUntilEscape(x0, y0) {
  let x = 0, y = 0;
  let numIterations = 0;
  while ((x*x + y*y < ESCAPE_THRESHOLD) &&
         (numIterations < MAX_numIterationsS)) {
    const x_next = x*x - y*y + x0;
    const y_next = 2*Math.abs(x*y) + y0;
    x = x_next;
    y = y_next;
    numIterations++;
  }
  return [numIterations, x*x + y*y];
}
`.trim()}</SyntaxHighlighter>
  </div>

  <div className="container">
    <p>
      We'll set the RGBA colors of every pixel in the image based
      on the number of iterations. Here's an example of a fiery yellow/red
      color palette by scaling just the green and alpha values.
    </p>
    <SyntaxHighlighter language="javascript" style={shadesOfPurple}>{`
function getColor(numIterations) {
  return [
    255,                // red
    numIterations * 7,  // green
    0,                  // blue
    numIterations * 15  // alpha
  ];
}
`.trim()}</SyntaxHighlighter>
    <p>
      Here's the largest ship colored based on
      number of iterations alone.
    </p>
    <FractalCanvas
      width={1600}
      height={1600}
      xRange={[-1.8, -1.7]}
      yRange={[-0.08, 0.01]}
      colorFunc={({ numIterations }) => [ 255, numIterations * 7, 0, numIterations * 15 ]}
    />
    <p>
      By considering escape distances on a logarithmic scale, we
      can use this extra information to smooth the color transitions.
    </p>
    <SyntaxHighlighter language="javascript" style={shadesOfPurple}>{`
const ESCAPE_RADIUS = 2;

function getMu(numIterations, escapeDistance) {
  return numIterations + 1 -
    Math.log(escapeDistance) / Math.log(ESCAPE_RADIUS);
}

function getColor(mu) {
  return [ 255, mu * 7, 0, mu * 15 ];
}
`.trim()}</SyntaxHighlighter>
    <p>
      Here's the same image as above colored with renormalized iteration counts.
    </p>
    <FractalCanvas
      width={1600}
      height={1600}
      xRange={[-1.8, -1.7]}
      yRange={[-0.08, 0.01]}
      colorFunc={({ mu }) => [ 255, mu * 7, 0, mu * 15 ]}
    />
  </div>

  <div className="container">
    <h3>Sub-structures</h3>
    <p>
      Zoomed-in to various parts of the fractal world.
    </p>

    <FractalCanvas
      width={1600}
      height={1600}
      xRange={[-1.7825, -1.765]}
      yRange={[-0.0671, -0.0494]}
      colorFunc={({ mu }) => [ 255, mu * 7, 0, mu * 15 ]}
    />

    <FractalCanvas
      width={1600}
      height={800}
      xRange={[-1.510987, -1.5090825]}
      yRange={[-0.00296972, 0.00066197]}
      colorFunc={({ mu }) => [ 255, mu * 5, 0, 255 ]}
    />

    <FractalCanvas
      width={1600}
      height={800}
      xRange={[-2.01, -1.9469]}
      yRange={[-0.02, 0.02]}
      colorFunc={({ mu }) => [ 255, mu * 12, 0, mu * 30 ]}
    />
  </div>
</>;

export default App;
