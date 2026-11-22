/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Pure client-side Canvas -> Animated GIF89a encoder for BackStory AI Photos.
 * Produces a smooth, seamlessly looping image/gif Blob that plays natively
 * inside every <img> tag across Story Editor, Feed, Gallery, and Story Pages.
 */

export type PhotoMotionStyle = 'ken_burns_zoom' | 'gentle_pan' | 'cinematic_drift' | 'warm_glow';

/** Build a fixed 256-color RGB palette (6x7x6 = 252 colors + 4 neutral greys) for fast, consistent quantization */
function buildPalette(): Uint8Array {
  const palette = new Uint8Array(256 * 3);
  let idx = 0;
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 7; g++) {
      for (let b = 0; b < 6; b++) {
        palette[idx * 3] = Math.round((r * 255) / 5);
        palette[idx * 3 + 1] = Math.round((g * 255) / 6);
        palette[idx * 3 + 2] = Math.round((b * 255) / 5);
        idx++;
      }
    }
  }
  const extraGreys = [32, 96, 160, 224];
  for (const v of extraGreys) {
    palette[idx * 3] = v;
    palette[idx * 3 + 1] = v;
    palette[idx * 3 + 2] = v;
    idx++;
  }
  return palette;
}

/** Map RGBA ImageData to palette indices (0..251) with subtle ordered dithering */
function quantizeFrame(rgba: Uint8ClampedArray, width: number, height: number): Uint8Array {
  const out = new Uint8Array(width * height);
  // 2x2 Bayer matrix scaled gently to reduce banding
  const bayer = [
    [-8, 4],
    [8, -4],
  ];
  for (let y = 0; y < height; y++) {
    const by = y & 1;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const d = bayer[by][x & 1];
      const r = Math.min(255, Math.max(0, rgba[i] + d));
      const g = Math.min(255, Math.max(0, rgba[i + 1] + d));
      const b = Math.min(255, Math.max(0, rgba[i + 2] + d));
      const ri = Math.round((r * 5) / 255);
      const gi = Math.round((g * 6) / 255);
      const bi = Math.round((b * 5) / 255);
      out[y * width + x] = ri * 42 + gi * 6 + bi;
    }
  }
  return out;
}

/** Standard GIF LZW encoder (8-bit minCodeSize) */
function lzwEncode(indices: Uint8Array, minCodeSize = 8): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  const bytes: number[] = [];

  let bitBuf = 0;
  let bitCount = 0;
  const emit = (code: number, size: number) => {
    bitBuf |= code << bitCount;
    bitCount += size;
    while (bitCount >= 8) {
      bytes.push(bitBuf & 0xff);
      bitBuf >>= 8;
      bitCount -= 8;
    }
  };

  // Dictionary keyed by (prefix << 8) | suffix
  let dict = new Map<number, number>();
  let nextCode = eoiCode + 1;
  let codeSize = minCodeSize + 1;

  emit(clearCode, codeSize);

  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const key = (prefix << 8) | k;
    const found = dict.get(key);
    if (found !== undefined) {
      prefix = found;
    } else {
      emit(prefix, codeSize);
      if (nextCode < 4096) {
        dict.set(key, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        emit(clearCode, codeSize);
        dict = new Map<number, number>();
        nextCode = eoiCode + 1;
        codeSize = minCodeSize + 1;
      }
      prefix = k;
    }
  }
  emit(prefix, codeSize);
  emit(eoiCode, codeSize);
  if (bitCount > 0) {
    bytes.push(bitBuf & 0xff);
  }

  // Pack into GIF sub-blocks (max 255 bytes each) + block terminator 0x00
  const out: number[] = [minCodeSize];
  let offset = 0;
  while (offset < bytes.length) {
    const len = Math.min(255, bytes.length - offset);
    out.push(len);
    for (let j = 0; j < len; j++) {
      out.push(bytes[offset + j]);
    }
    offset += len;
  }
  out.push(0x00);
  return new Uint8Array(out);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Generates a seamlessly looping Animated GIF Blob from a still image data URL
 * using the chosen cinematic motion style.
 */
export async function renderAnimatedGifBlob(
  imageDataUrl: string,
  motionStyle: PhotoMotionStyle = 'ken_burns_zoom',
  options?: { width?: number; height?: number; frames?: number; delayCs?: number }
): Promise<Blob> {
  const width = options?.width ?? 720;
  const height = options?.height ?? 405;
  const frameCount = options?.frames ?? 18;
  const delayCs = options?.delayCs ?? 11; // 110ms per frame (~2s smooth loop)

  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const palette = buildPalette();
  const chunks: Uint8Array[] = [];

  // GIF89a Header + Logical Screen Descriptor
  const header = new Uint8Array(13);
  header.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61], 0); // GIF89a
  header[6] = width & 0xff;
  header[7] = (width >> 8) & 0xff;
  header[8] = height & 0xff;
  header[9] = (height >> 8) & 0xff;
  header[10] = 0xf7; // Global Color Table Flag=1, Color Res=7, Sort=0, Size=7 (256 colors)
  header[11] = 0x00; // Background color index
  header[12] = 0x00; // Pixel aspect ratio
  chunks.push(header);
  chunks.push(palette);

  // NETSCAPE2.0 Application Extension for infinite looping
  chunks.push(
    new Uint8Array([
      0x21, 0xff, 0x0b,
      0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30,
      0x03, 0x01, 0x00, 0x00, 0x00,
    ])
  );

  // Base cover-fit scale
  const baseScale = Math.max(width / img.width, height / img.height);

  for (let f = 0; f < frameCount; f++) {
    // Seamless sinusoidal ping-pong progress 0 -> 1 -> 0
    const phase = (f / frameCount) * Math.PI * 2;
    const t = 0.5 - 0.5 * Math.cos(phase);

    let zoom = 1.0;
    let panX = 0;
    let panY = 0;
    let warmAlpha = 0;

    switch (motionStyle) {
      case 'ken_burns_zoom':
        zoom = 1.0 + t * 0.12;
        panX = (t - 0.5) * 14;
        panY = (t - 0.5) * -8;
        break;
      case 'gentle_pan':
        zoom = 1.12;
        panX = (t - 0.5) * 34;
        panY = Math.sin(phase) * 4;
        break;
      case 'cinematic_drift':
        zoom = 1.06 + Math.sin(phase) * 0.04;
        panX = Math.cos(phase) * 16;
        panY = Math.sin(phase) * 10;
        break;
      case 'warm_glow':
        zoom = 1.0 + t * 0.06;
        warmAlpha = 0.04 + t * 0.11;
        break;
    }

    const drawW = img.width * baseScale * zoom;
    const drawH = img.height * baseScale * zoom;
    const dx = (width - drawW) / 2 + panX;
    const dy = (height - drawH) / 2 + panY;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, dx, dy, drawW, drawH);

    if (warmAlpha > 0) {
      const grad = ctx.createRadialGradient(
        width * (0.3 + t * 0.4),
        height * 0.25,
        10,
        width * 0.5,
        height * 0.5,
        width * 0.75
      );
      grad.addColorStop(0, `rgba(255, 224, 150, ${warmAlpha.toFixed(3)})`);
      grad.addColorStop(1, 'rgba(255, 190, 100, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    const imgData = ctx.getImageData(0, 0, width, height);
    const indexed = quantizeFrame(imgData.data, width, height);

    // Graphic Control Extension
    chunks.push(
      new Uint8Array([
        0x21, 0xf9, 0x04, 0x00,
        delayCs & 0xff, (delayCs >> 8) & 0xff,
        0x00, 0x00,
      ])
    );

    // Image Descriptor
    chunks.push(
      new Uint8Array([
        0x2c,
        0x00, 0x00, 0x00, 0x00,
        width & 0xff, (width >> 8) & 0xff,
        height & 0xff, (height >> 8) & 0xff,
        0x00,
      ])
    );

    chunks.push(lzwEncode(indexed, 8));
  }

  // GIF Trailer
  chunks.push(new Uint8Array([0x3b]));

  const blobParts: BlobPart[] = chunks.map((chunk) => new Uint8Array(chunk));
  return new Blob(blobParts, { type: 'image/gif' });
}
