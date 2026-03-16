import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'apps', 'web', 'public', 'icons');
const publicDir = join(__dirname, '..', 'apps', 'web', 'public');

// SVG for regular icons (with rounded rect background)
const regularSvg = `<svg width="512" height="512" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="10" fill="#2C1810"/>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M10 6 L38 6 L33 42 L15 42 Z M20 42 L20 30 A4 4 0 0 1 28 30 L28 42 Z"
    fill="#D4A574"
  />
</svg>`;

// SVG for maskable icons (full bleed background, icon slightly smaller/centered)
const maskableSvg = `<svg width="512" height="512" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" fill="#2C1810"/>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M13 10 L35 10 L31 38 L17 38 Z M21 38 L21 28 A3 3 0 0 1 27 28 L27 38 Z"
    fill="#D4A574"
  />
</svg>`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

async function generateIcons() {
  // Generate regular icons
  for (const size of sizes) {
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(Buffer.from(regularSvg))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // Generate maskable icons
  for (const size of maskableSizes) {
    const outputPath = join(iconsDir, `icon-maskable-${size}x${size}.png`);
    await sharp(Buffer.from(maskableSvg))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-maskable-${size}x${size}.png`);
  }

  // Generate favicon.png (32x32)
  await sharp(Buffer.from(regularSvg))
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.png'));
  console.log('Generated: favicon.png');

  // Generate apple-touch-icon (180x180)
  await sharp(Buffer.from(regularSvg))
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated: apple-touch-icon.png');

  // Generate favicon.ico (48x48 PNG in ICO container - just use a 48px PNG)
  // For src/app/favicon.ico, we generate a PNG that Next.js can use
  const appDir = join(__dirname, '..', 'apps', 'web', 'src', 'app');
  await sharp(Buffer.from(regularSvg))
    .resize(48, 48)
    .png()
    .toFile(join(appDir, 'favicon.png'));
  console.log('Generated: src/app/favicon.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
