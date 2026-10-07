// Minimal PNG encoder (RGBA, 8-bit, no filtering) with nearest-neighbour upscaling. Node only (uses zlib).
import { deflateSync } from 'node:zlib';

const CRC = new Int32Array(256);
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c; }
function crc32(buf) { let c = -1; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

export function encodePng(img, scale = 1) {
  const { width: W, height: H, rgba } = img; const s = Math.max(1, Math.round(scale)); const OW = W * s, OH = H * s;
  const raw = Buffer.alloc((OW * 4 + 1) * OH);
  for (let y = 0; y < OH; y++) { const row = y * (OW * 4 + 1); raw[row] = 0; const sy = Math.floor(y / s);
    for (let x = 0; x < OW; x++) { const si = (sy * W + Math.floor(x / s)) * 4, di = row + 1 + x * 4; raw[di] = rgba[si]; raw[di + 1] = rgba[si + 1]; raw[di + 2] = rgba[si + 2]; raw[di + 3] = rgba[si + 3]; } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(OW, 0); ihdr.writeUInt32BE(OH, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
