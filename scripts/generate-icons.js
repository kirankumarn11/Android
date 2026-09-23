import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Generating PWA icons from SVG...');

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('Generated pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('Generated pwa-512x512.png');

  // apple-touch-icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('Generated apple-touch-icon.png');

  // maskable 512x512 with safe padding (80% scale centered)
  const innerIcon = await sharp(svgBuffer)
    .resize(410, 410)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 2, g: 132, b: 199, alpha: 1 } // #0284c7 M3 primary
    }
  })
    .composite([{ input: innerIcon, top: 51, left: 51 }])
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('Generated pwa-maskable-512x512.png');

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
