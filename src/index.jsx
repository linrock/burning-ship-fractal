import React from 'react';
import ReactDOM from 'react-dom';

import './style.css';
import App from './App';

const VIZ_POLL_INTERVAL_MS = 200;
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

// entry point
ReactDOM.hydrate(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('react-mount')
);
renderVisibleFractalCanvasesForever();
[...document.querySelectorAll('.equation')].forEach((equationEl) => {
  window.katex.render(equationEl.innerHTML, equationEl);
});
