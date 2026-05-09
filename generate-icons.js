/**
 * Script to generate PWA icons from SVG source.
 * Run: node generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC_SVG = path.join(__dirname, 'src/assets/icons/icon.svg');
const DEST_DIR = path.join(__dirname, 'src/assets/icons');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  for (const size of SIZES) {
    const outputFile = path.join(DEST_DIR, `icon-${size}x${size}.png`);
    await sharp(SRC_SVG)
      .resize(size, size)
      .png()
      .toFile(outputFile);
    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // Also generate favicon.png (32x32) from the favicon SVG
  const faviconSvg = path.join(__dirname, 'src/favicon.svg');
  await sharp(faviconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, 'src/favicon-32x32.png'));
  console.log('Generated: favicon-32x32.png');

  console.log('\nAll icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
