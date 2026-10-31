const fs = require('fs');
const potrace = require('potrace');

const imgPath = 'C:/Users/Carlo/.gemini/antigravity/brain/a79822ae-8da8-4250-a02c-225661418509/.user_uploaded/media_1793482494338_dee8c26e.jpg';

// Trace whole image with high fidelity
potrace.trace(imgPath, {
  threshold: 128,
  optTolerance: 0.1,
  turdSize: 10,
  turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY
}, (err, svg) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  // The output is an SVG. Let's inspect its viewBox and path
  console.log('SVG length:', svg.length);
  
  // Replace fill with #059669
  const greenSvg = svg.replace(/fill="[^"]*"/g, 'fill="#059669"');
  fs.writeFileSync('C:/Users/Carlo/OneDrive/Desktop/nutrimesh-tmp/public/logo-full.svg', greenSvg);
  console.log('Saved logo-full.svg');

  // Also extract only the circular icon (paths where y < wordmark threshold)
  // Let's parse subpaths:
  const dMatch = svg.match(/d="([^"]+)"/);
  if (!dMatch) {
    console.log('No single d attribute found');
    return;
  }

  const rawD = dMatch[1];
  const subpaths = rawD.trim().split(/(?=M\s*[\d\.]+)/);
  console.log('Found subpaths count:', subpaths.length);

  // Filter out any border edge (near 0 or 1024)
  const iconSubpaths = [];
  const wordmarkSubpaths = [];

  for (const p of subpaths) {
    const m = p.match(/M\s*([\d\.]+)\s+([\d\.]+)/);
    if (!m) continue;
    const x = parseFloat(m[1]);
    const y = parseFloat(m[2]);

    // Dimensions of the jpg: 1024x1024
    // Ignore outer image border frames if any
    if (x < 5 || x > 1019 || y < 5 || y > 1019) continue;

    // Wordmark is located at the bottom (y > ~750)
    if (y > 750) {
      wordmarkSubpaths.push(p);
    } else {
      iconSubpaths.push(p);
    }
  }

  console.log('Icon subpaths:', iconSubpaths.length, 'Wordmark subpaths:', wordmarkSubpaths.length);

  function getBounds(paths, pad = 10) {
    const combined = paths.join(' ');
    const nums = combined.match(/-?[\d\.]+/g).map(Number);
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
    return vb;
  }

  // 1. Isotipo solo (esfera con hoja)
  const iconVb = getBounds(iconSubpaths, 12);
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${iconVb}" fill="#059669">
  <!-- NutriMesh Isotipo Oficial Vectorizado del Logo Original -->
  <path d="${iconSubpaths.join(' ')}" fill-rule="evenodd" />
</svg>`;
  fs.writeFileSync('C:/Users/Carlo/OneDrive/Desktop/nutrimesh-tmp/public/logo.svg', iconSvg);
  fs.writeFileSync('C:/Users/Carlo/OneDrive/Desktop/nutrimesh-tmp/public/favicon.svg', iconSvg);
  console.log('Saved logo.svg with viewBox:', iconVb);

  // 2. Lockup completo (Icono + NutriMesh)
  const fullSubpaths = iconSubpaths.concat(wordmarkSubpaths);
  const fullVb = getBounds(fullSubpaths, 16);
  const lockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fullVb}" fill="#059669">
  <!-- NutriMesh Lockup Completo Oficial Vectorizado -->
  <path d="${fullSubpaths.join(' ')}" fill-rule="evenodd" />
</svg>`;
  fs.writeFileSync('C:/Users/Carlo/OneDrive/Desktop/nutrimesh-tmp/public/logo-lockup.svg', lockupSvg);
  console.log('Saved logo-lockup.svg with viewBox:', fullVb);
});
