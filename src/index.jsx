import React from 'react';
import ReactDOM from 'react-dom';

import 'highlight.js/styles/shades-of-purple.css';
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
// katex is not included in pre-rendered production builds
if (window.katex) {
  [...document.querySelectorAll('.equation')].forEach((equationEl) => {
    console.log('rendering katex equation');
    window.katex.render(equationEl.innerHTML, equationEl);
  });
}
if (window.hljs) {
  // hljs is not included in pre-rendered production builds
  document.querySelectorAll('pre code').forEach((el) => {
    console.log('highlighting code block');
    window.hljs.highlightElement(el);
  });
}
