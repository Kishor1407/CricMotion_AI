const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. High-impact Cricket & AI Video Icon (Neobrutalism Snapchat Yellow + Red Ball + Seam + Lightning)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="120%" height="120%">
      <feDropShadow dx="3" dy="3" stdDeviation="0" flood-color="#000000" />
    </filter>
  </defs>
  
  <!-- Outer Neobrutalist Rounded Square -->
  <rect x="4" y="4" width="54" height="54" rx="14" fill="#FFFC00" stroke="#000000" stroke-width="3.5" filter="url(#shadow)" />
  
  <!-- Cricket Ball Circle -->
  <circle cx="31" cy="31" r="18" fill="#E11D48" stroke="#000000" stroke-width="2.5" />
  
  <!-- White Stitched Seams -->
  <path d="M19 23 C24 28, 24 34, 19 39" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="2.5,2" stroke-linecap="round" />
  <path d="M43 23 C38 28, 38 34, 43 39" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="2.5,2" stroke-linecap="round" />
  
  <!-- Central Electric Lightning Strike (AI Video) -->
  <polygon points="34,17 23,31 30,31 27,45 40,29 32,29" fill="#FFFC00" stroke="#000000" stroke-width="1.8" stroke-linejoin="round" />
</svg>`;

// Helper function to build a standard Windows ICO file from PNG buffers
function buildIco(images) {
  // Header: 6 bytes
  // 0-1: Reserved (0)
  // 2-3: Type (1 = ICO)
  // 4-5: Count of images
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  // Directory entries: 16 bytes per image
  const dirSize = 16 * count;
  let offset = 6 + dirSize;

  const dirBuffers = [];
  const dataBuffers = [];

  for (const img of images) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    dir.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    dir.writeUInt8(0, 2); // Color palette
    dir.writeUInt8(0, 3); // Reserved
    dir.writeUInt16LE(1, 4); // Color planes
    dir.writeUInt16LE(32, 6); // Bits per pixel
    dir.writeUInt32LE(img.buffer.length, 8); // Size
    dir.writeUInt32LE(offset, 12); // Offset

    dirBuffers.push(dir);
    dataBuffers.push(img.buffer);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirBuffers, ...dataBuffers]);
}

async function main() {
  const publicDir = path.resolve(__dirname, '../frontend/public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write icon.svg
  const svgPath = path.join(publicDir, 'icon.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log('✅ Generated frontend/public/icon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // Generate PNG sizes
  const sizes = [16, 32, 48, 64, 180, 192, 512];
  const pngBuffers = {};

  for (const size of sizes) {
    const buf = await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngBuffers[size] = buf;
  }

  // Save standard PNGs
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), pngBuffers[32]);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), pngBuffers[64]);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngBuffers[180]);
  console.log('✅ Generated favicon.png (32x32), icon.png (64x64), apple-touch-icon.png (180x180)');

  // Build binary favicon.ico containing 16x16, 32x32, 48x48
  const icoBuffer = buildIco([
    { width: 16, height: 16, buffer: pngBuffers[16] },
    { width: 32, height: 32, buffer: pngBuffers[32] },
    { width: 48, height: 48, buffer: pngBuffers[48] },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log(`✅ Generated valid binary favicon.ico (${icoBuffer.length} bytes)`);
}

main().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
