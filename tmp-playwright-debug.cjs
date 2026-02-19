const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });

  page.on('console', (msg) => {
    console.log('BROWSER-CONSOLE:', msg.type(), msg.text());
  });

  page.on('pageerror', (err) => {
    console.log('BROWSER-PAGEERROR:', err.message);
  });

  await page.goto('http://127.0.0.1:4173/projects/bioinformatic-toolbox', { waitUntil: 'networkidle' });

  await page.fill('#pdb-id', '1a7f');
  await page.click('button:has-text("Search PDB")');
  await page.waitForTimeout(5000);

  await page.fill('#predict-seq', 'GIVEQCCTSICSLYQLENYCN');
  await page.click('button:has-text("Predict Structure")');
  await page.waitForTimeout(8000);

  const stats = await page.evaluate(() => {
    const wrappers = Array.from(document.querySelectorAll('[aria-label="Interactive protein 3D viewer"]'));
    return wrappers.map((node, idx) => {
      const el = node;
      const rect = el.getBoundingClientRect();
      const canvas = el.querySelector('canvas');
      return {
        idx,
        width: rect.width,
        height: rect.height,
        hasCanvas: !!canvas,
        canvasWidth: canvas ? canvas.getAttribute('width') : null,
        canvasHeight: canvas ? canvas.getAttribute('height') : null,
        childCount: el.childElementCount,
        childTags: Array.from(el.children).map((c) => c.tagName)
      };
    });
  });

  console.log('VIEWER-STATS:', JSON.stringify(stats, null, 2));

  await page.screenshot({ path: 'tmp-toolbox-debug.png', fullPage: true });
  await browser.close();
})();
