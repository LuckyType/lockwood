// Tree layout: turns a dependency graph into branches, leaves and ground decoration in world space.
// Pure JavaScript (uses ./vec.js), shared by the web page (which turns it into three.js objects) and the CLI rasterizer.
import { Vector3, Quaternion } from './vec.js';
import { ageFor } from './lockfile.js';

export const STYLES = {
  oak:    { name: 'oak',    spread: [0.55, 0.95], lenK: 1.0,  up: 0.25, droop: 0,    leader: false, trunkK: 1.0, leaf: 'ball',   leafCol: [0x3f8a3a, 0x5cab45, 0x2f6e2c, 0x7cc45a], bark: 0xa0724b, radK: 1.0, attach: [0.45, 1.0], twist: 0 },
  pine:   { name: 'pine',   spread: [1.15, 1.4],  lenK: 0.72, up: 0.05, droop: 0.25, leader: true,  trunkK: 1.5, leaf: 'cone',   leafCol: [0x1f5c3a, 0x2b7a4a, 0x17452c, 0x3a8f58], bark: 0x95664a, radK: 0.8, attach: [0.15, 1.0], twist: 0 },
  willow: { name: 'willow', spread: [0.5, 0.95],  lenK: 1.1,  up: 0.2,  droop: 0.75, leader: false, trunkK: 0.9, leaf: 'strand', leafCol: [0x7cb56b, 0x9ccb7f, 0x5f9a4f, 0xb7d98f], bark: 0xa98457, radK: 0.9, attach: [0.5, 1.0], twist: 0.1 },
  sakura: { name: 'sakura', spread: [0.7, 1.15],  lenK: 0.9,  up: 0.1,  droop: 0.05, leader: false, trunkK: 0.9, leaf: 'puff',   leafCol: [0xf2a7c2, 0xf7c6d8, 0xe07aa3, 0xffe0ea], bark: 0x8a6250, radK: 0.9, attach: [0.4, 1.0], twist: 0.15 },
  bonsai: { name: 'bonsai', spread: [0.95, 1.35], lenK: 0.62, up: 0.0,  droop: 0.2,  leader: false, trunkK: 1.5, leaf: 'pad',    leafCol: [0x2f7a3a, 0x3f9448, 0x236328, 0x56ab57], bark: 0x946a4e, radK: 1.35, attach: [0.3, 1.0], twist: 0.6 },
};

export function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rnd(h, salt) { let x = (h + Math.imul(salt, 0x9E3779B9)) | 0; x = Math.imul(x ^ x >>> 16, 0x45d9f3b); x = Math.imul(x ^ x >>> 16, 0x45d9f3b); x ^= x >>> 16; return (x >>> 0) / 4294967296; }
const UP = new Vector3(0, 1, 0);
const quatFromDir = (dir) => new Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// Leaf outline in its own plane: a pointed oval, fanned from LEAF_C. Shared by the page and the rasterizer.
export const LEAF_PTS = [[0, 1], [0.38, 0.72], [0.46, 0.4], [0.28, 0.08], [0, -0.12], [-0.28, 0.08], [-0.46, 0.4], [-0.38, 0.72]];
export const LEAF_C = [0, 0.45];

// A clump of leaves at a branch tip, in the tip's local frame (y along the branch). Colors are sRGB hex ints.
export function leafClump(style, isLeaf, h, age, flat) {
  const pal = style.leafCol; const pick = (k) => pal[Math.floor(rnd(h, 100 + k) * pal.length)];
  const N = (isLeaf ? 16 : 7) + Math.round(8 * age.t), len = 0.26 + 0.1 * age.t, R = (isLeaf ? 0.36 : 0.26) * (0.85 + 0.45 * age.t);
  const r3 = (k) => rnd(h, 200 + k) * 2 - 1;
  const tilt = (k) => flat ? (rnd(h, k) - 0.5) * 0.9 : (rnd(h, k) - 0.5) * 2.4;
  const mk = (x, y, z, k, o = {}) => ({ x, y, z, len: len * (o.ls || 1) * (0.8 + 0.4 * rnd(h, k + 50)), wid: len * 0.62 * (o.ws || 1), rot: o.rot ?? rnd(h, k + 60) * 6.283, tiltX: o.tx ?? tilt(k + 70), tiltY: o.ty ?? tilt(k + 80), color: pick(k) });
  const list = [];
  if (style.leaf === 'ball' || style.leaf === 'puff') { const puff = style.leaf === 'puff'; const RR = puff ? R * 1.25 : R;
    for (let k = 0; k < N + (puff ? 6 : 0); k++) { const v = new Vector3(r3(k * 3), r3(k * 3 + 1), r3(k * 3 + 2)); if (v.length() > 1) v.normalize(); v.multiplyScalar(RR); list.push(mk(v.x, v.y + RR * 0.3, v.z, k, puff ? { ws: 1.15, ls: 0.85 } : {})); } }
  else if (style.leaf === 'cone') { const H = R * 2.6; for (let k = 0; k < N + 8; k++) { const y = rnd(h, 400 + k) * H; const rr = R * 1.1 * (1 - y / H) * Math.sqrt(rnd(h, 500 + k)); const a = rnd(h, 600 + k) * 6.283;
      list.push(mk(Math.cos(a) * rr, y - H * 0.25, Math.sin(a) * rr, k, { ls: 1.4, ws: 0.32, rot: Math.PI + (rnd(h, 700 + k) - 0.5) * 1.3 })); } list.push(mk(0, H * 0.8, 0, 99, { ls: 1.2, ws: 0.32, rot: 0 })); }
  else if (style.leaf === 'strand') { const strands = isLeaf ? 4 : 2; for (let q = 0; q < strands; q++) { const a = rnd(h, 700 + q) * 6.283, rr = R * 0.6 * rnd(h, 800 + q); const n = 4 + Math.round(rnd(h, 900 + q) * 4) + Math.round(3 * age.t);
      for (let k = 0; k < n; k++) list.push(mk(Math.cos(a) * rr + k * 0.03 * r3(q * 10 + k), -k * len * 0.7 + 0.1, Math.sin(a) * rr, q * 10 + k, { ws: 0.7, rot: Math.PI + (rnd(h, 1000 + q * 10 + k) - 0.5) * 0.8 })); } }
  else if (style.leaf === 'pad') { for (let k = 0; k < N + 4; k++) { const a = rnd(h, 1000 + k) * 6.283, rr = R * 1.5 * Math.sqrt(rnd(h, 1100 + k));
      list.push(mk(Math.cos(a) * rr, (rnd(h, 1200 + k) < 0.3 ? len * 0.4 : 0) + 0.05, Math.sin(a) * rr, k, { tx: (flat ? 0.9 : 1.45) + (rnd(h, 1300 + k) - 0.5) * 0.4 })); } }
  return { list, radius: R * 1.6 };
}

// Lay out the whole tree. Returns items in parent-first order; each item has segments with both local
// (relative to the parent segment it hangs from) and world transforms, growth timing, and a leaf clump.
export function layoutTree(graph, styleKey, opts = {}) {
  const flat = !!opts.flat, seed = (opts.seed | 0) >>> 0, style = STYLES[styleKey] || STYLES.oak, age = ageFor(graph.count);
  const hs = (name) => seed ? (hashStr(name) ^ Math.imul(seed, 0x9E3779B1)) >>> 0 : hashStr(name); // seed 0 keeps the canonical tree
  const speed = graph.count > 250 ? 1.9 : graph.count > 120 ? 1.5 : graph.count > 40 ? 1.2 : 1;
  const items = []; let maxY = 0.5, maxR = 0.5, lastEnd = 0, trunkR = 0.1;
  const roots = graph.roots;
  const rootNode = roots.length === 1 ? roots[0] : { name: 'workspace', size: graph.count + 1, children: roots, versions: [], kind: 'workspace', virtual: true, depth: -1, out: new Map(), in: new Set(), viaTags: new Set() };
  function place(n, basePos, dir, depth, parentQ, parentItem, parentSegIdx, attachOffset, start) {
    const h = hs(n.name), isTrunk = depth === 0, size = n.size;
    const L = isTrunk ? style.trunkK * (1.2 + 0.5 * Math.log2(size + 1)) * (0.8 + 0.5 * age.t) : style.lenK * (0.5 + 0.45 * Math.log2(size + 1)) * (1 - 0.06 * Math.min(depth, 6));
    const r = style.radK * (0.03 + 0.035 * Math.pow(size, 0.42)) * (isTrunk ? (1 + 0.6 * age.t) : 1);
    if (isTrunk) trunkR = r;
    const segs = isTrunk ? 2 + Math.round(2 * age.t) : Math.max(1, Math.min(4, Math.round(L / 1.1)));
    const bendAmp = (0.08 + 0.25 * age.t + style.twist) * (isTrunk ? 0.5 : 1);
    const dur = (0.4 + 0.25 * L) * (0.65 + 0.7 * rnd(h, 31)) / speed;
    const q = quatFromDir(dir);
    const q0 = parentQ.clone().invert().multiply(q);
    const segLen = L / segs;
    const item = { n, name: n.name, depth, isTrunk, L, r, segs: [], q0, parent: parentItem, attachSeg: parentSegIdx, attachOffset, start, dur, h, phase: rnd(h, 7) * 6.283,
      leafStart: start + dur * (0.55 + 0.45 * rnd(h, 34)), leafDur: 0.35 + 0.5 * rnd(h, 35), pow: 2 + 2.5 * rnd(h, 36), leaf: null };
    let segQ = q.clone(), pos = basePos.clone();
    for (let i = 0; i < segs; i++) {
      const rBot = r * (1 - 0.35 * i / segs), rTop = r * (1 - 0.35 * (i + 1) / segs);
      const bend = new Quaternion().setFromEulerXYZ((rnd(h, 10 + i) - 0.5) * bendAmp, 0, (rnd(h, 20 + i) - 0.5) * bendAmp);
      item.segs.push({ len: segLen, rBot, rTop, bend, worldQ: segQ.clone(), worldBase: pos.clone() });
      pos = pos.clone().add(new Vector3(0, segLen, 0).applyQuaternion(segQ)); segQ = segQ.clone().multiply(bend);
    }
    item.tipPos = pos; item.tipQ = segQ;
    const isLeaf = n.children.length === 0;
    const lc = leafClump(style, isLeaf, h, age, flat); item.leaf = lc;
    maxY = Math.max(maxY, pos.y + lc.radius); maxR = Math.max(maxR, Math.hypot(pos.x, pos.z) + lc.radius);
    lastEnd = Math.max(lastEnd, start + dur, item.leafStart + item.leafDur + 0.2);
    items.push(item);
    const kids = [...n.children].sort((a, b) => b.size - a.size), m = kids.length;
    kids.forEach((c, i) => {
      const hc = hs(c.name);
      const leader = style.leader && i === 0 && depth < 7 && m > 1;
      let t, polar, az;
      if (leader) { t = 1; polar = 0.08 + 0.12 * rnd(hc, 2); az = rnd(hc, 3) * 6.283; }
      else { const j = style.leader && m > 1 ? i - 1 : i, mm = style.leader && m > 1 ? m - 1 : m; t = mm <= 1 ? 1 : style.attach[0] + (1 - style.attach[0]) * (j / (mm - 1)); if (isTrunk && style.leader) t = 0.25 + 0.75 * (j + 1) / mm;
        polar = style.spread[0] + (style.spread[1] - style.spread[0]) * rnd(hc, 2); az = i * 2.399963 + rnd(h, 3) * 6.283; }
      const k = Math.min(segs - 1, Math.floor(t * segs)), seg = item.segs[k], off = (t * segs - k) * segLen;
      const attach = seg.worldBase.clone().add(new Vector3(0, off, 0).applyQuaternion(seg.worldQ));
      const d = new Vector3(Math.sin(polar) * Math.cos(az), Math.cos(polar), Math.sin(polar) * Math.sin(az)).applyQuaternion(seg.worldQ);
      const droop = style.droop * Math.min(1, (depth + 1) / 3) + (style.leader ? 0.3 * (1 - t) * style.droop : 0);
      d.y += style.up - droop; d.normalize();
      const cL = style.lenK * (0.5 + 0.45 * Math.log2(c.size + 1));
      if (attach.y + d.y * cL < 0.35) { d.y = (0.35 - attach.y) / cL; d.normalize(); }
      place(c, attach, d, depth + 1, seg.worldQ, item, k, off, start + dur * (0.05 + 0.3 * t + 0.45 * rnd(hc, 33) * rnd(hc, 37)));
    });
  }
  const rh = hs(rootNode.name);
  const lean = new Vector3((rnd(rh, 1) - 0.5) * 0.12, 1, (rnd(rh, 2) - 0.5) * 0.12).normalize();
  place(rootNode, new Vector3(0, 0, 0), lean, 0, new Quaternion(), null, -1, 0, 0.2);
  return { items, maxY, maxR, trunkR, lastEnd, age, style, styleKey, flat, seed, count: graph.count, depth: graph.maxDepth, roots: roots.length, rootName: rootNode.name };
}

// Ground island, grass, roots, moss, mushrooms and clouds as plain geometry. Boxes carry an optional y/x rotation.
// `late` groups appear near the end of the growth animation.
export function layoutDecor(stats) {
  const { age, style, maxR, trunkR } = stats;
  const R = Math.max(2.6, maxR * 1.15 + 0.8), h = (hashStr(style.name + stats.count) ^ Math.imul(stats.seed || 0, 0x9E3779B1)) >>> 0;
  const groups = [];
  const box = (x, y, z, sx, sy, sz, color, o = {}) => ({ kind: 'box', x, y, z, sx, sy, sz, color, rotY: o.rotY || 0, rotX: o.rotX || 0, late: !!o.late });
  groups.push(box(0, -0.25, 0, 2 * R, 0.5, 2 * R, 0x6f9c4b));
  groups.push(box(0, -1.05, 0, 2 * R * 0.92, 1.1, 2 * R * 0.92, 0x5f4630));
  groups.push(box(0, -2.0, 0, 2 * R * 0.7, 1.0, 2 * R * 0.7, 0x4a3524));
  groups.push(box(0, -3.0, 0, 2 * R * 0.35, 1.2, 2 * R * 0.35, 0x4a3524));
  const tufts = []; const gpal = [0x7cc45a, 0x5cab45, 0x8fd166, 0x4f9a3f];
  const nT = 90 + Math.round(70 * age.t);
  for (let k = 0; k < nT; k++) { const x = (rnd(h, k * 3) - 0.5) * 1.9 * R, z = (rnd(h, k * 3 + 1) - 0.5) * 1.9 * R; if (Math.hypot(x, z) < trunkR * 1.4) continue; const s = 0.12 + 0.12 * rnd(h, k * 3 + 2); tufts.push({ x, y: s / 2, z, sx: s, sy: s * (1 + rnd(h, k + 900)), sz: s, color: gpal[k % 4] }); }
  for (let k = 0; k < 12; k++) { const s = 0.16 + 0.1 * rnd(h, 7000 + k); tufts.push({ x: (rnd(h, 5000 + k) - 0.5) * 1.8 * R, y: 0.08, z: (rnd(h, 6000 + k) - 0.5) * 1.8 * R, sx: s, sy: s, sz: s, color: 0x9a9078 }); }
  groups.push({ kind: 'cubes', cubes: tufts, late: false });
  if (age.t > 0.45) {
    const nR = 4 + Math.round(5 * age.t); const rootCol = mulHex(style.bark, 0.85);
    for (let k = 0; k < nR; k++) { const a = k / nR * 6.283 + rnd(h, 100 + k); const len = trunkR * (1.6 + 1.5 * rnd(h, 200 + k));
      groups.push(box(Math.cos(a) * (trunkR * 0.6 + len * 0.45), trunkR * 0.1, Math.sin(a) * (trunkR * 0.6 + len * 0.45), trunkR * 0.45, trunkR * 0.35, len, rootCol, { rotY: -a + Math.PI / 2, rotX: 0.12, late: true })); }
  }
  if (age.t > 0.55) {
    const moss = []; const mp = [0x4f9a3f, 0x6bb55a];
    for (let k = 0; k < 10 + Math.round(16 * age.t); k++) { const a = rnd(h, 300 + k) * 6.283, y = 0.1 + rnd(h, 400 + k) * trunkR * 2.2, s = 0.14 + 0.1 * rnd(h, 500 + k); moss.push({ x: Math.cos(a) * trunkR * 0.92, y, z: Math.sin(a) * trunkR * 0.92, sx: s, sy: s, sz: s, color: mp[k % 2] }); }
    groups.push({ kind: 'cubes', cubes: moss, late: true });
    const shrooms = [];
    for (let k = 0; k < 2 + Math.round(3 * age.t); k++) { const a = rnd(h, 600 + k) * 6.283, rr = trunkR * 1.5 + 0.4 + rnd(h, 700 + k) * 1.2, x = Math.cos(a) * rr, z = Math.sin(a) * rr, s = 0.16 + 0.14 * rnd(h, 800 + k);
      shrooms.push({ x, y: s * 0.6, z, sx: s * 0.5, sy: s * 1.2, sz: s * 0.5, color: 0xf0e6cf }, { x, y: s * 1.35, z, sx: s * 1.4, sy: s * 0.6, sz: s * 1.4, color: 0xc43a2a }, { x: x + s * 0.3, y: s * 1.7, z: z - s * 0.2, sx: s * 0.3, sy: s * 0.3, sz: s * 0.3, color: 0xfff6e0 }); }
    groups.push({ kind: 'cubes', cubes: shrooms, late: true });
  }
  const clouds = []; const cy = Math.max(7, stats.maxY * 1.3);
  for (let k = 0; k < 6; k++) { const cx = (rnd(h, 1000 + k) - 0.5) * 60, cz = (rnd(h, 1100 + k) - 0.5) * 40 - 10, y = cy + rnd(h, 1200 + k) * 5; const w = 2 + rnd(h, 1300 + k) * 3;
    for (let j = 0; j < 5; j++) { const s = 0.8 + rnd(h, 1600 + k * 7 + j) * 1.2; clouds.push({ x: cx + (rnd(h, 1400 + k * 7 + j) - 0.5) * w * 2, y: y + (rnd(h, 1500 + k * 7 + j) - 0.5) * 0.8, z: cz, sx: s, sy: 0.6, sz: s, color: 0xfffaf0 }); } }
  groups.push({ kind: 'cubes', cubes: clouds, late: false, cloud: true });
  return { R, groups };
}

export function mulHex(hex, f) { const r = clamp(Math.round(((hex >> 16) & 255) * f), 0, 255), g = clamp(Math.round(((hex >> 8) & 255) * f), 0, 255), b = clamp(Math.round((hex & 255) * f), 0, 255); return (r << 16) | (g << 8) | b; }

// Camera framing shared by both views. `flat` is the orthographic 2D view.
export function fitCamera(stats, aspect, flat) {
  const H = stats.maxY, W = Math.max(stats.maxR, 1.2), fov = 42 * Math.PI / 180;
  let dist = Math.max(H * 1.6, W * 2.9) / (2 * Math.tan(fov / 2)) + W * 0.8, targetY = H * 0.46, yaw = 0.7, pitch = 0.28;
  if (flat) { dist = Math.max(H * 0.78, (W + 1.5) * 1.25 / aspect) / 0.42; targetY = H * 0.4; yaw = 0.06; pitch = 0.1; }
  return { dist, targetY, yaw, pitch, orthoHalfHeight: dist * 0.42 };
}
