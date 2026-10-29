const fs = require('fs');
const potrace = require('potrace');

const sourceImg = 'C:/Users/Carlo/.gemini/antigravity/brain/a79822ae-8da8-4250-a02c-225661418509/.user_uploaded/media_1793208485617.png';

potrace.trace(sourceImg, {
  threshold: 135,
  optTolerance: 0.2,
  turdSize: 10
}, (err, svg) => {
  if (err) {
    console.error('Error tracing:', err);
    process.exit(1);
  }

  const dMatch = svg.match(/d="([^"]+)"/);
  const rawD = dMatch[1];
  const subpaths = rawD.trim().split(/(?=M\s*[\d\.]+)/);

  const monogramPaths = [];
  const isotipoPaths = [];
  const wordmarkPaths = [];

  for (const p of subpaths) {
    const m = p.match(/M\s*([\d\.]+)\s+([\d\.]+)/);
    if (!m) continue;
    const x = parseFloat(m[1]);
    const y = parseFloat(m[2]);

    // ignore frame border lines
    if (x < 3 || x > 658 || y < 3 || y > 615) continue;
    // vertical dividing line in media_1793208485617.png is around x ~ 170-176
    if (Math.abs(x - 173) < 4 && p.length < 250) continue;
    // bottom caption text (y > 550)
    if (y > 550) continue;

    if (x < 170) {
      monogramPaths.push(p);
    } else if (y < 425) {
      isotipoPaths.push(p);
    } else {
      wordmarkPaths.push(p);
    }
  }

  function getBounds(pathStr, pad = 6) {
    const nums = pathStr.match(/-?[\d\.]+/g).map(Number);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < nums.length; i += 2) {
      const x = nums[i];
      const y = nums[i+1];
      if (!isNaN(x) && !isNaN(y)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    const vb = `${Math.floor(minX - pad)} ${Math.floor(minY - pad)} ${Math.ceil(maxX - minX + pad * 2)} ${Math.ceil(maxY - minY + pad * 2)}`;
    return { vb };
  }

  // 1. Isotipo SVG
  const isoD = isotipoPaths.join(' ');
  const isoBounds = getBounds(isoD, 8);
  const isoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${isoBounds.vb}" fill="currentColor">
  <!-- NutriMesh Isotipo Oficial — Calcado exacto del PNG de manos entrelazadas y hoja central -->
  <path d="${isoD}" fill-rule="evenodd" />
</svg>`;
  fs.writeFileSync('src/assets/brand/isotipo.svg', isoSvg);

  // 2. Monograma SVG
  const monoD = monogramPaths.join(' ');
  const monoBounds = getBounds(monoD, 6);
  const monoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${monoBounds.vb}" fill="currentColor">
  <!-- NutriMesh Monograma NM Oficial — Calcado exacto del PNG -->
  <path d="${monoD}" fill-rule="evenodd" />
</svg>`;
  fs.writeFileSync('src/assets/brand/monograma.svg', monoSvg);

  // 3. Wordmark SVG
  const wordD = wordmarkPaths.join(' ');
  const wordBounds = getBounds(wordD, 6);
  const wordSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${wordBounds.vb}" fill="currentColor">
  <!-- NutriMesh Wordmark Oficial — Calcado exacto del PNG -->
  <path d="${wordD}" fill-rule="evenodd" />
</svg>`;
  fs.writeFileSync('src/assets/brand/wordmark.svg', wordSvg);

  // 4. Lockup SVG (Isotipo + Wordmark)
  const lockD = isotipoPaths.concat(wordmarkPaths).join(' ');
  const lockBounds = getBounds(lockD, 10);
  const lockSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${lockBounds.vb}" fill="currentColor">
  <!-- NutriMesh Lockup Oficial (Isotipo + Wordmark) — Calcado exacto del PNG -->
  <path d="${lockD}" fill-rule="evenodd" />
</svg>`;
  fs.writeFileSync('src/assets/brand/lockup.svg', lockSvg);

  console.log('CLEAN RE-TRACE COMPLETED:');
  console.log('  - src/assets/brand/isotipo.svg (viewBox:', isoBounds.vb, ')');
  console.log('  - src/assets/brand/monograma.svg (viewBox:', monoBounds.vb, ')');
  console.log('  - src/assets/brand/wordmark.svg (viewBox:', wordBounds.vb, ')');
  console.log('  - src/assets/brand/lockup.svg (viewBox:', lockBounds.vb, ')');
});
