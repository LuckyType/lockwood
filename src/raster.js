// Software rasterizer for the flat 2D view: orthographic camera, three-band toon shading, inked depth outline.
// Mirrors the look of the three.js page closely enough that a CI-rendered PNG matches what people see in the browser.
import { Vector3, Quaternion } from './vec.js';
import { LEAF_PTS, LEAF_C, fitCamera } from './layout.js';

const srgb2lin = (c) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const lin2srgb = (c) => c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
const hexLin = (hex) => [srgb2lin(((hex >> 16) & 255) / 255), srgb2lin(((hex >> 8) & 255) / 255), srgb2lin((hex & 255) / 255)];
const clamp01 = (x) => x < 0 ? 0 : x > 1 ? 1 : x;

// Collect world-space triangles from a layout. Each triangle: [ax,ay,az, bx,by,bz, cx,cy,cz, colorHex, doubleSided]
export function collectTriangles(stats, decor, flat) {
  const tris = []; const zk = flat ? 0.4 : 1;
  const push = (a, b, c, color, dbl) => tris.push([a.x, a.y, a.z * zk, b.x, b.y, b.z * zk, c.x, c.y, c.z * zk, color, !!dbl]);
  const quad = (p0, p1, p2, p3, color) => { push(p0, p1, p2, color); push(p0, p2, p3, color); };
  const boxTris = (center, half, q, color, scaleZ = 1) => {
    const corner = (sx, sy, sz) => new Vector3(sx * half.x, sy * half.y, sz * half.z).applyQuaternion(q).add(center);
    const c = [corner(-1, -1, -1), corner(1, -1, -1), corner(1, 1, -1), corner(-1, 1, -1), corner(-1, -1, 1), corner(1, -1, 1), corner(1, 1, 1), corner(-1, 1, 1)];
    quad(c[4], c[5], c[6], c[7], color); quad(c[1], c[0], c[3], c[2], color); // front, back
    quad(c[3], c[2], c[6], c[7], color); quad(c[0], c[1], c[5], c[4], color); // top, bottom
    quad(c[5], c[1], c[2], c[6], color); quad(c[0], c[4], c[7], c[3], color); // right, left
  };
  const bark = stats.style.bark;
  for (const it of stats.items) {
    for (const s of it.segs) {
      const hb = s.rBot * 0.7071, ht = s.rTop * 0.7071;
      const P = (x, y, z) => new Vector3(x, y, z).applyQuaternion(s.worldQ).add(s.worldBase);
      const b = [P(-hb, 0, -hb), P(hb, 0, -hb), P(hb, 0, hb), P(-hb, 0, hb)], t = [P(-ht, s.len, -ht), P(ht, s.len, -ht), P(ht, s.len, ht), P(-ht, s.len, ht)];
      for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; quad(b[i], b[j], t[j], t[i], bark); }
      quad(t[0], t[1], t[2], t[3], bark);
    }
    const q = new Quaternion(), tipQ = it.tipQ, tipPos = it.tipPos;
    for (const l of it.leaf.list) {
      q.setFromEulerXYZ(l.tiltX, l.tiltY, l.rot);
      const v = (pt) => new Vector3(pt[0] * l.wid, (pt[1] - 0.4) * l.len, 0).applyQuaternion(q).add(new Vector3(l.x, l.y, l.z)).applyQuaternion(tipQ).add(tipPos);
      const c = v(LEAF_C);
      for (let i = 0; i < LEAF_PTS.length; i++) { const a = v(LEAF_PTS[i]), b = v(LEAF_PTS[(i + 1) % LEAF_PTS.length]); push(c, b, a, l.color, true); }
    }
  }
  for (const g of decor.groups) {
    if (g.kind === 'box') { boxTris(new Vector3(g.x, g.y, g.z), new Vector3(g.sx / 2, g.sy / 2, g.sz / 2), new Quaternion().setFromEulerXYZ(g.rotX, g.rotY, 0), g.color); }
    else if (g.kind === 'cubes') {
      if (g.cloud) { const k = zk; for (const c of g.cubes) { boxTris(new Vector3(c.x, c.y, c.z / k), new Vector3(c.sx / 2, c.sy / 2, c.sz / 2 / k), new Quaternion(), c.color); } } // clouds are not flattened
      else for (const c of g.cubes) boxTris(new Vector3(c.x, c.y, c.z), new Vector3(c.sx / 2, c.sy / 2, c.sz / 2), new Quaternion(), c.color);
    }
  }
  return tris;
}

// Render to an RGBA buffer. opts: width, height, bg (hex or null for transparent), outline (bool), levels (int)
export function render(stats, decor, opts = {}) {
  const W = opts.width || 400, H = opts.height || 300, aspect = W / H, flat = true;
  const fit = fitCamera(stats, aspect, flat);
  const target = new Vector3(0, fit.targetY, 0);
  const cp = Math.cos(fit.pitch), sp = Math.sin(fit.pitch);
  const camPos = new Vector3(target.x + fit.dist * cp * Math.sin(fit.yaw), target.y + fit.dist * sp, target.z + fit.dist * cp * Math.cos(fit.yaw));
  const f = target.clone().sub(camPos).normalize();
  const right = f.clone().cross(new Vector3(0, 1, 0)).normalize();
  const up = right.clone().cross(f).normalize();
  const hh = fit.orthoHalfHeight, hw = hh * aspect;
  // light, as the page's 2D view places it: toward the camera, raised, nudged to the upper left
  const sun = new Vector3(camPos.x - target.x, fit.dist * 0.9, camPos.z - target.z).normalize().multiplyScalar(10).add(new Vector3(-6, 2, 0)).normalize();
  const sunCol = hexLin(0xfff6e0), sky = hexLin(0xf4efe4), ground = hexLin(0xb8b08a), hemiI = 0.75, sunI = 1.0;
  const bands = [70 / 255, 150 / 255, 1];
  const tris = collectTriangles(stats, decor, flat);
  const depth = new Float32Array(W * H).fill(Infinity), col = new Float32Array(W * H * 3);
  const proj = (x, y, z) => { const dx = x - target.x, dy = y - target.y, dz = z - target.z; return [((dx * right.x + dy * right.y + dz * right.z) / hw + 1) * 0.5 * W, (1 - (dx * up.x + dy * up.y + dz * up.z) / hh) * 0.5 * H, (x - camPos.x) * f.x + (y - camPos.y) * f.y + (z - camPos.z) * f.z]; };
  const shadeCache = new Map();
  for (const t of tris) {
    const [ax, ay, az, bx, by, bz, cx, cy, cz, color, dbl] = t;
    // normal, flipped to face the camera (leaves are double sided; boxes never show their back faces anyway)
    let nx = (by - ay) * (cz - az) - (bz - az) * (cy - ay), ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az), nz = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    if (nx * f.x + ny * f.y + nz * f.z > 0) { if (!dbl) continue; nx = -nx; ny = -ny; nz = -nz; }
    const dotNL = nx * sun.x + ny * sun.y + nz * sun.z, band = bands[Math.min(2, Math.floor((dotNL * 0.5 + 0.5) * 3))], hm = ny * 0.5 + 0.5;
    const key = color * 64 + Math.round(band * 7) * 8 + Math.round(hm * 7);
    let rgb = shadeCache.get(key);
    if (!rgb) { const base = hexLin(color); rgb = base.map((c, i) => lin2srgb(clamp01(c * (band * sunCol[i] * sunI + (ground[i] + (sky[i] - ground[i]) * hm) * hemiI)))); shadeCache.set(key, rgb); }
    const [x0, y0, z0] = proj(ax, ay, az), [x1, y1, z1] = proj(bx, by, bz), [x2, y2, z2] = proj(cx, cy, cz);
    const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2))), maxX = Math.min(W - 1, Math.ceil(Math.max(x0, x1, x2)));
    const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2))), maxY = Math.min(H - 1, Math.ceil(Math.max(y0, y1, y2)));
    if (minX > maxX || minY > maxY) continue;
    const area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0); if (Math.abs(area) < 1e-9) continue;
    const inv = 1 / area;
    for (let py = minY; py <= maxY; py++) { const yy = py + 0.5;
      for (let px = minX; px <= maxX; px++) { const xx = px + 0.5;
        let w0 = ((x1 - xx) * (y2 - yy) - (x2 - xx) * (y1 - yy)) * inv, w1 = ((x2 - xx) * (y0 - yy) - (x0 - xx) * (y2 - yy)) * inv, w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const z = w0 * z0 + w1 * z1 + w2 * z2, i = py * W + px;
        if (z < depth[i]) { depth[i] = z; col[i * 3] = rgb[0]; col[i * 3 + 1] = rgb[1]; col[i * 3 + 2] = rgb[2]; }
      } }
  }
  // compose: background, outline, palette quantisation
  const out = new Uint8ClampedArray(W * H * 4), levels = opts.levels || 14, ink = [0.14, 0.09, 0.07], outlineK = opts.outline === false ? 0 : 0.9, th = 0.3;
  const skyTop = [0xf7 / 255, 0xf1 / 255, 0xe4 / 255], skyBot = [0xee / 255, 0xe3 / 255, 0xcd / 255];
  const bgHex = opts.bg === undefined || opts.bg === null ? null : opts.bg;
  const smooth = (e0, e1, x) => { const t = clamp01((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const i = py * W + px, d = depth[i]; let r, g, b, a = 255;
    if (d === Infinity) {
      if (bgHex === null) { a = 0; r = g = b = 0; }
      else if (bgHex === 'sky') { const v = 1 - py / H, m = smooth(0.05, 0.85, v); r = skyBot[0] + (skyTop[0] - skyBot[0]) * m; g = skyBot[1] + (skyTop[1] - skyBot[1]) * m; b = skyBot[2] + (skyTop[2] - skyBot[2]) * m; }
      else { r = ((bgHex >> 16) & 255) / 255; g = ((bgHex >> 8) & 255) / 255; b = (bgHex & 255) / 255; }
    } else {
      r = col[i * 3]; g = col[i * 3 + 1]; b = col[i * 3 + 2];
      if (outlineK) { const far = (j) => j < 0 || j >= W * H || depth[j] - d > th; let e = 0;
        if (px > 0 ? far(i - 1) : true) e = 1; if (px < W - 1 ? far(i + 1) : true) e = 1; if (py > 0 ? far(i - W) : true) e = 1; if (py < H - 1 ? far(i + W) : true) e = 1;
        if (e) { r += (ink[0] - r) * outlineK; g += (ink[1] - g) * outlineK; b += (ink[2] - b) * outlineK; } }
    }
    if (a && d !== Infinity) { r = Math.floor(r * levels + 0.5) / levels; g = Math.floor(g * levels + 0.5) / levels; b = Math.floor(b * levels + 0.5) / levels; }
    out[i * 4] = r * 255; out[i * 4 + 1] = g * 255; out[i * 4 + 2] = b * 255; out[i * 4 + 3] = a;
  }
  return { width: W, height: H, rgba: out };
}

// Pixel buffer → SVG, one path per colour, runs merged horizontally. Crisp at any size.
export function toSvg(img, scale = 2, title = 'Dependency tree') {
  const { width: W, height: H, rgba } = img; const byColor = new Map();
  for (let y = 0; y < H; y++) { let x = 0; while (x < W) { const i = (y * W + x) * 4; if (!rgba[i + 3]) { x++; continue; }
    const key = (rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2]; let run = 1;
    while (x + run < W) { const j = (y * W + x + run) * 4; if (!rgba[j + 3] || ((rgba[j] << 16) | (rgba[j + 1] << 8) | rgba[j + 2]) !== key) break; run++; }
    let d = byColor.get(key); if (!d) { d = []; byColor.set(key, d); } d.push(`M${x} ${y}h${run}v1h-${run}z`); x += run; } }
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * scale}" height="${H * scale}" shape-rendering="crispEdges" role="img" aria-label="${title}">\n<title>${title}</title>\n`;
  for (const [key, d] of byColor) s += `<path fill="#${key.toString(16).padStart(6, '0')}" d="${d.join('')}"/>\n`;
  return s + '</svg>\n';
}
