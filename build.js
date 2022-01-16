const fs = require('fs');
const path = require('path');

const { JSDOM } = require('jsdom');
const beautify = require('js-beautify').html;
const puppeteer = require('puppeteer');

const OUT_DIR = './build';                     // output dir, relative to this file
const HTML_INFILE = './build/index.html';      // output of `yarn build`
const HTML_OUTFILE = './build/index.html';     // output html file, pretty-printed + cleaned
const STYLE_NODES = 'link[rel="stylesheet"]';  // replace with inline CSS

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR);
}
// fs.copyFileSync(`./public/favicon.ico`, `${OUT_DIR}/favicon.ico`);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = `file://${path.resolve('./build/index.html')}`;
  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 5000,
    });
  } catch (error) {
    console.dir(error);
    console.error(`Error: failed to snapshot url: ${url}`);
    await browser.close();
    return;
  }
  // get the html after rendering all JS templates
  let finalHtml = `<!DOCTYPE html><html>${await page.evaluate(() => document.documentElement.innerHTML)}</html>`;

  const dom = new JSDOM(finalHtml);

  // make all images visible on the page
  dom.window.document.
    querySelectorAll('img').
    forEach(async (imgNodeEl) => {
      imgNodeEl.style.display = 'block';
    });

  // replace local css links with inline css
  /*
  dom.window.document.
    querySelectorAll(STYLE_NODES).
    forEach(async (cssNodeEl) => {
      const cssSrc = cssNodeEl.attributes.href.value;
      let data;
      // external links not supported yet
      if (cssSrc.startsWith('https://')) {
        return;
      }
      data = fs.readFileSync(path.resolve(`./build/${cssSrc}`), {encoding: 'utf8', flag: 'r'});
      const styleNode = dom.window.document.createElement('style');
      styleNode.innerHTML = data;
      cssNodeEl.parentNode.appendChild(styleNode);
      cssNodeEl.parentNode.removeChild(cssNodeEl);
      return true;
    });
  */

  finalHtml = dom.serialize();
  finalHtml = beautify(finalHtml, { indent_size: 2 });

  // write the final html to a file
  fs.open(HTML_OUTFILE, 'w', (err) => {
    if (err) {
      throw `Couldn't open file: ${HTML_OUTFILE}`;
    }
    fs.writeFile(HTML_OUTFILE, finalHtml, async (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Saved static html to ${OUT_DIR}/index.html (size: ${finalHtml.length})`);
      }
      // exit now that we're done
      await browser.close();
    });
  });
})();
