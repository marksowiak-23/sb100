const fs = require('fs');
const path = require('path');

// 1. Generate SVG Favicon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="sbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#1E40AF" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>
  
  <!-- Rounded Base Container -->
  <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#sbGrad)" filter="url(#shadow)" />
  <rect x="2" y="2" width="60" height="60" rx="16" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-opacity="0.4" />

  <!-- Gold Accent Bookmark / Star -->
  <path d="M32 10 L35 18 L44 19 L37 25 L39 34 L32 29 L25 34 L27 25 L20 19 L29 18 Z" fill="url(#goldGrad)" opacity="0.3" transform="scale(0.5) translate(32, 10)" />

  <!-- Open Book Pages (Left & Right) -->
  <!-- Left Page -->
  <path d="M30 46 C24 43 17 43 14 44.5 C13.4 44.8 13 44.3 13 43.6 L13 22 C13 21.4 13.4 20.9 14 20.7 C18 19.3 25 19.5 30 22.5 Z" fill="#FFFFFF" />
  
  <!-- Right Page -->
  <path d="M34 46 C40 43 47 43 50 44.5 C50.6 44.8 51 44.3 51 43.6 L51 22 C51 21.4 50.6 20.9 50 20.7 C46 19.3 39 19.5 34 22.5 Z" fill="#F1F5F9" />

  <!-- Book Spine Divider -->
  <path d="M32 22 L32 46" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round" />

  <!-- Subtle Page Lines -->
  <!-- Left page lines -->
  <line x1="17" y1="26" x2="26" y2="28" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round" />
  <line x1="17" y1="31" x2="26" y2="33" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round" />
  <line x1="17" y1="36" x2="24" y2="38" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round" />

  <!-- Right page lines -->
  <line x1="38" y1="28" x2="47" y2="26" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round" />
  <line x1="38" y1="33" x2="47" y2="31" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round" />
  <line x1="40" y1="38" x2="47" y2="36" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round" />

  <!-- Center Golden Ribbon Bookmark -->
  <path d="M32 20 L32 36 L34.5 33.5 L37 36 L37 20 Z" fill="url(#goldGrad)" filter="url(#shadow)" />
</svg>`;

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
console.log('Created public/favicon.svg');

// 2. Generate Multi-size Binary .ICO File
// Creates 16x16, 32x32, and 48x48 icon image entries inside a single standard ICO container.

function drawIconPixels(size) {
  const pixels = new Uint8Array(size * size * 4); // BGRA

  // Corner radius ratio
  const r = size * 0.25;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Distance for rounded rectangle
      const dx = Math.max(0, Math.max(r - x, x - (size - 1 - r)));
      const dy = Math.max(0, Math.max(r - y, y - (size - 1 - r)));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > r) {
        // Transparent outside rounded box
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
        continue;
      }

      // Smooth anti-aliased edge
      let alpha = 255;
      if (dist > r - 1) {
        alpha = Math.round(255 * (r - dist));
      }

      // Normalized coordinates
      const nx = x / size;
      const ny = y / size;

      // Gradient background (Blue)
      let b = Math.round(235 - ny * 60 + nx * 20);
      let g = Math.round(99 + ny * 20 - nx * 10);
      let red = Math.round(37 - ny * 15);

      // Draw Open Book
      const bookYMin = size * 0.28;
      const bookYMax = size * 0.76;
      const bookXMin = size * 0.18;
      const bookXMax = size * 0.82;
      const centerX = size * 0.5;

      if (y >= bookYMin && y <= bookYMax && x >= bookXMin && x <= bookXMax) {
        // Spine gap
        const distFromCenter = Math.abs(x - (centerX - 0.5));
        if (distFromCenter < size * 0.04) {
          // Dark spine line
          red = 148;
          g = 163;
          b = 184;
        } else {
          // Page curve
          const pageCurve = Math.sin((x - bookXMin) / (bookXMax - bookXMin) * Math.PI) * (size * 0.06);
          if (y >= bookYMin + pageCurve && y <= bookYMax + pageCurve * 0.5) {
            if (x < centerX) {
              // Left page - Pure White
              red = 255;
              g = 255;
              b = 255;
            } else {
              // Right page - Slightly off-white
              red = 241;
              g = 245;
              b = 249;
            }

            // Draw text lines on page
            const relY = (y - bookYMin) / (bookYMax - bookYMin);
            if ((relY > 0.3 && relY < 0.38) || (relY > 0.5 && relY < 0.58) || (relY > 0.7 && relY < 0.78)) {
              if (distFromCenter > size * 0.08 && distFromCenter < size * 0.28) {
                red = 203;
                g = 213;
                b = 225;
              }
            }
          }
        }
      }

      // Golden Bookmark ribbon at top center
      if (Math.abs(x - (centerX + size * 0.05)) < size * 0.07 && y >= size * 0.22 && y <= size * 0.52) {
        // Gold color #F59E0B
        red = 245;
        g = 158;
        b = 11;
      }

      pixels[idx] = b;     // Blue
      pixels[idx + 1] = g; // Green
      pixels[idx + 2] = red; // Red
      pixels[idx + 3] = alpha; // Alpha
    }
  }

  return pixels;
}

function createIcoBuffer(sizes) {
  const images = sizes.map(size => {
    const pixels = drawIconPixels(size);
    const dibHeaderSize = 40;
    const pixelDataSize = size * size * 4;
    const maskRowSize = Math.floor((size + 31) / 32) * 4;
    const maskSize = maskRowSize * size;
    const imageSize = dibHeaderSize + pixelDataSize + maskSize;

    const imgBuf = Buffer.alloc(imageSize);

    // BITMAPINFOHEADER
    imgBuf.writeUInt32LE(dibHeaderSize, 0);       // biSize
    imgBuf.writeInt32LE(size, 4);                 // biWidth
    imgBuf.writeInt32LE(size * 2, 8);             // biHeight (2x for XOR + AND mask)
    imgBuf.writeUInt16LE(1, 12);                  // biPlanes
    imgBuf.writeUInt16LE(32, 14);                 // biBitCount (32 bpp BGRA)
    imgBuf.writeUInt32LE(0, 16);                  // biCompression (BI_RGB)
    imgBuf.writeUInt32LE(pixelDataSize + maskSize, 20); // biSizeImage
    imgBuf.writeInt32LE(0, 24);                   // biXPelsPerMeter
    imgBuf.writeInt32LE(0, 28);                   // biYPelsPerMeter
    imgBuf.writeUInt32LE(0, 32);                  // biClrUsed
    imgBuf.writeUInt32LE(0, 36);                  // biClrImportant

    // Write pixel data bottom-to-top (Windows BMP ordering)
    let offset = dibHeaderSize;
    for (let y = size - 1; y >= 0; y--) {
      for (let x = 0; x < size; x++) {
        const srcIdx = (y * size + x) * 4;
        imgBuf[offset] = pixels[srcIdx];         // B
        imgBuf[offset + 1] = pixels[srcIdx + 1]; // G
        imgBuf[offset + 2] = pixels[srcIdx + 2]; // R
        imgBuf[offset + 3] = pixels[srcIdx + 3]; // A
        offset += 4;
      }
    }

    // AND mask (all zeros since alpha channel is in 32bpp BGRA)
    imgBuf.fill(0, offset, offset + maskSize);

    return {
      size,
      data: imgBuf
    };
  });

  const headerSize = 6;
  const dirEntrySize = 16;
  const totalHeaderSize = headerSize + dirEntrySize * images.length;

  let currentOffset = totalHeaderSize;
  const entries = images.map(img => {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0); // bWidth
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1); // bHeight
    entry.writeUInt8(0, 2);                               // bColorCount
    entry.writeUInt8(0, 3);                               // bReserved
    entry.writeUInt16LE(1, 4);                            // wPlanes
    entry.writeUInt16LE(32, 6);                           // wBitCount
    entry.writeUInt32LE(img.data.length, 8);               // dwBytesInRes
    entry.writeUInt32LE(currentOffset, 12);                // dwImageOffset
    currentOffset += img.data.length;
    return entry;
  });

  const icoHeader = Buffer.alloc(headerSize);
  icoHeader.writeUInt16LE(0, 0);              // Reserved
  icoHeader.writeUInt16LE(1, 2);              // Type: 1 = ICO
  icoHeader.writeUInt16LE(images.length, 4);  // Count

  return Buffer.concat([icoHeader, ...entries, ...images.map(img => img.data)]);
}

const icoBuffer = createIcoBuffer([16, 32, 48]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
console.log('Created public/favicon.ico with 16x16, 32x32, 48x48 icon images (' + icoBuffer.length + ' bytes)');
