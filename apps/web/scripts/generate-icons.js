/**
 * Keystone PWA Icon Generator
 *
 * Generates PNG icons at all required PWA sizes from an SVG source.
 * Uses a keystone (architectural trapezoid) shape with emerald accent,
 * rendered on the brand earth-tone background.
 *
 * Run: node scripts/generate-icons.js
 * Requires: npm install sharp (dev dependency)
 */

const fs = require("fs");
const path = require("path");

// The keystone SVG icon at high resolution
function createIconSVG(size, maskable = false) {
  const padding = maskable ? size * 0.15 : size * 0.1;
  const innerSize = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;

  // Keystone shape (trapezoid wider at top, narrower at bottom)
  const ksW = innerSize * 0.52;
  const ksH = innerSize * 0.58;
  const topW = ksW;
  const botW = ksW * 0.68;
  const ksTop = cy - ksH / 2;
  const ksBot = cy + ksH / 2;

  // Keystone trapezoid path
  const ksPath = [
    `M ${cx - topW / 2} ${ksTop}`,
    `L ${cx + topW / 2} ${ksTop}`,
    `L ${cx + botW / 2} ${ksBot}`,
    `L ${cx - botW / 2} ${ksBot}`,
    "Z",
  ].join(" ");

  // Inner cutout (arch shape)
  const archW = botW * 0.55;
  const archH = ksH * 0.48;
  const archBot = ksBot - ksH * 0.12;
  const archTop = archBot - archH;
  const archR = archW / 2;

  const archPath = [
    `M ${cx - archW / 2} ${archBot}`,
    `L ${cx - archW / 2} ${archTop + archR}`,
    `A ${archR} ${archR} 0 0 1 ${cx + archW / 2} ${archTop + archR}`,
    `L ${cx + archW / 2} ${archBot}`,
    "Z",
  ].join(" ");

  // Emerald accent bar at the top of the keystone
  const accentH = ksH * 0.07;
  const accentPath = [
    `M ${cx - topW / 2 + 1} ${ksTop}`,
    `L ${cx + topW / 2 - 1} ${ksTop}`,
    `L ${cx + topW / 2 - 1} ${ksTop + accentH}`,
    `L ${cx - topW / 2 + 1} ${ksTop + accentH}`,
    "Z",
  ].join(" ");

  // Small "K" letter in the arch
  const letterSize = archW * 0.38;
  const letterY = archTop + archR + archH * 0.15;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.18}" fill="#2C1810"/>

  <!-- Subtle texture pattern -->
  <defs>
    <pattern id="grain" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="4" fill="none"/>
      <circle cx="2" cy="2" r="0.4" fill="#D4A574" opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.18}" fill="url(#grain)"/>

  <!-- Keystone shape -->
  <path d="${ksPath}" fill="#D4A574"/>

  <!-- Arch cutout -->
  <path d="${archPath}" fill="#2C1810"/>

  <!-- Emerald accent bar -->
  <path d="${accentPath}" fill="#059669" rx="1"/>

  <!-- K letter -->
  <text x="${cx}" y="${letterY}"
    font-family="serif"
    font-weight="700"
    font-size="${letterSize}"
    fill="#D4A574"
    text-anchor="middle"
    dominant-baseline="central">K</text>
</svg>`;
}

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, "..", "public", "icons");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generate() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    // Fallback: write SVGs directly if sharp is not available
    console.log("sharp not available, generating SVG icons instead...");
    for (const size of SIZES) {
      const svg = createIconSVG(size, false);
      fs.writeFileSync(path.join(outputDir, `icon-${size}x${size}.svg`), svg);
      console.log(`  Created icon-${size}x${size}.svg`);
    }
    // Maskable
    for (const size of [192, 512]) {
      const svg = createIconSVG(size, true);
      fs.writeFileSync(path.join(outputDir, `icon-maskable-${size}x${size}.svg`), svg);
      console.log(`  Created icon-maskable-${size}x${size}.svg`);
    }
    console.log("\nTo generate PNG icons, install sharp: npm install -D sharp");
    console.log("Then run this script again.");
    return;
  }

  for (const size of SIZES) {
    const svg = Buffer.from(createIconSVG(size, false));
    await sharp(svg).png().toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`  Created icon-${size}x${size}.png`);
  }

  // Maskable icons
  for (const size of [192, 512]) {
    const svg = Buffer.from(createIconSVG(size, true));
    await sharp(svg).png().toFile(path.join(outputDir, `icon-maskable-${size}x${size}.png`));
    console.log(`  Created icon-maskable-${size}x${size}.png`);
  }

  // Favicon
  const faviconSvg = Buffer.from(createIconSVG(32, false));
  await sharp(faviconSvg).png().toFile(path.join(outputDir, "..", "favicon.png"));
  console.log("  Created favicon.png");

  console.log("\nAll icons generated successfully.");
}

generate().catch(console.error);
