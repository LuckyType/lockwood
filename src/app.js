// Browser app: three.js scene, pixel-art post-processing, growth and wind animation, hover tracing and the panels.
// Layout and parsing live in ./layout.js and ./lockfile.js, shared with the CLI.
import { buildGraph, FORMATS } from './lockfile.js';
import { SAMPLES } from './samples.js';
import { STYLES, layoutTree, layoutDecor, fitCamera, LEAF_PTS, LEAF_C } from './layout.js';

const T = window.THREE;
const stage = document.getElementById('stage');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (id) => document.getElementById(id);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ---------- renderer, cameras, pixel post-process ---------- */
const renderer = new T.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
stage.appendChild(renderer.domElement);
const scene = new T.Scene();
const camera = new T.PerspectiveCamera(42, 1, 0.1, 300);
const ortho = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
let view = '2d'; const cam = () => view === '2d' ? ortho : camera;
const hemi = new T.HemisphereLight(0xf4efe4, 0xb8b08a, 0.75); scene.add(hemi);
const sun = new T.DirectionalLight(0xfff6e0, 1.0); sun.position.set(6, 10, 4); scene.add(sun);

let rt = null, pixelSize = 2;
const post = new T.ShaderMaterial({
  uniforms: { tDiffuse: { value: null }, tDepth: { value: null }, res: { value: new T.Vector2(1, 1) }, outline: { value: 1 }, outlineK: { value: 0.85 }, levels: { value: 14 }, isOrtho: { value: 1 },
    near: { value: camera.near }, far: { value: camera.far }, skyTop: { value: new T.Color(0xf7f1e4) }, skyBot: { value: new T.Color(0xeee3cd) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `#include <packing>
    uniform sampler2D tDiffuse; uniform sampler2D tDepth; uniform vec2 res; uniform float outline, outlineK, levels, near, far, isOrtho; uniform vec3 skyTop, skyBot; varying vec2 vUv;
    float vz(vec2 uv){ float d = texture2D(tDepth, uv).x; return isOrtho > 0.5 ? orthographicDepthToViewZ(d, near, far) : perspectiveDepthToViewZ(d, near, far); }
    void main(){
      vec2 px = 1.0 / res; vec4 c = texture2D(tDiffuse, vUv); float d = texture2D(tDepth, vUv).x; vec3 col = c.rgb;
      if (d >= 0.99999) { col = mix(skyBot, skyTop, smoothstep(0.05, 0.85, vUv.y)); gl_FragColor = vec4(col, 1.0); return; }
      if (outline > 0.5) {
        float z = vz(vUv); float th = isOrtho > 0.5 ? 0.3 : 0.22 + 0.02 * abs(z); float e = 0.0;
        if (vz(vUv - vec2(px.x, 0.)) - z < -th) e = 1.0; if (vz(vUv + vec2(px.x, 0.)) - z < -th) e = 1.0;
        if (vz(vUv + vec2(0., px.y)) - z < -th) e = 1.0; if (vz(vUv - vec2(0., px.y)) - z < -th) e = 1.0;
        col = mix(col, vec3(0.14, 0.09, 0.07), outlineK * e);
      }
      col = floor(col * levels + 0.5) / levels;
      gl_FragColor = vec4(col, 1.0);
    }`, depthTest: false, depthWrite: false
});
const postScene = new T.Scene(); const postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), post));
function makeRT(w, h) {
  if (rt) { rt.depthTexture.dispose(); rt.dispose(); }
  const depth = new T.DepthTexture(w, h, T.UnsignedIntType);
  rt = new T.WebGLRenderTarget(w, h, { minFilter: T.NearestFilter, magFilter: T.NearestFilter, depthTexture: depth, depthBuffer: true });
  post.uniforms.tDiffuse.value = rt.texture; post.uniforms.tDepth.value = depth; post.uniforms.res.value.set(w, h);
}
function updateOrtho() { const a = stage.clientWidth / Math.max(1, stage.clientHeight), hh = orbit.dist * 0.42; ortho.left = -hh * a; ortho.right = hh * a; ortho.top = hh; ortho.bottom = -hh; ortho.updateProjectionMatrix(); }
function resize() {
  const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); updateOrtho();
  makeRT(Math.max(2, Math.floor(w / pixelSize)), Math.max(2, Math.floor(h / pixelSize)));
}
addEventListener('resize', resize);

/* ---------- orbit / turntable ---------- */
const orbit = { yaw: 0.7, pitch: 0.28, dist: 12, target: new T.Vector3(0, 2, 0), minD: 3, maxD: 60, idle: 0 };
const ptrs = new Map(); let lastPinch = 0, dragging = false, moved = 0;
const cv = renderer.domElement; cv.style.touchAction = 'none';
cv.addEventListener('pointerdown', e => { ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); dragging = true; moved = 0; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', e => {
  if (ptrs.has(e.pointerId)) { const p = ptrs.get(e.pointerId); const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    if (ptrs.size === 1) { orbit.yaw -= dx * 0.006; if (view !== '2d') orbit.pitch = clamp(orbit.pitch + dy * 0.005, -0.15, 1.35); orbit.idle = 0; }
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (lastPinch) orbit.dist = clamp(orbit.dist * lastPinch / d, orbit.minD, orbit.maxD); lastPinch = d; } }
  hoverAt(e.clientX, e.clientY);
});
const endPtr = e => { ptrs.delete(e.pointerId); if (!ptrs.size) { dragging = false; lastPinch = 0; } };
cv.addEventListener('pointerup', e => { endPtr(e); if (moved < 6) clickAt(e.clientX, e.clientY); });
cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('pointerleave', () => { if (!pinned) setHover(null); hideTip(); });
cv.addEventListener('wheel', e => { e.preventDefault(); orbit.dist = clamp(orbit.dist * Math.exp(e.deltaY * 0.0012), orbit.minD, orbit.maxD); orbit.idle = 0; }, { passive: false });
function updateCamera(dt) {
  const flat = view === '2d';
  if (!flat && !dragging && !reduceMotion) { orbit.idle += dt; if (orbit.idle > 6) orbit.yaw += dt * 0.06; }
  const pitch = flat ? 0.1 : orbit.pitch, c = cam(), cp = Math.cos(pitch), sp = Math.sin(pitch);
  c.position.set(orbit.target.x + orbit.dist * cp * Math.sin(orbit.yaw), orbit.target.y + orbit.dist * sp, orbit.target.z + orbit.dist * cp * Math.cos(orbit.yaw));
  c.lookAt(orbit.target);
  if (flat) { updateOrtho(); sun.position.set(c.position.x - orbit.target.x, orbit.dist * 0.9, c.position.z - orbit.target.z).normalize().multiplyScalar(10).add(new T.Vector3(-6, 2, 0)); }
  else sun.position.set(6, 10, 4);
}

/* ---------- geometry helpers ---------- */
const grad = new T.DataTexture(new Uint8Array([70, 150, 255]), 3, 1, T.RedFormat); grad.minFilter = grad.magFilter = T.NearestFilter; grad.needsUpdate = true;
const toonMat = (o) => new T.MeshToonMaterial(Object.assign({ gradientMap: grad }, o));
const boxNI = new T.BoxGeometry(1, 1, 1).toNonIndexed(); const bp = boxNI.attributes.position.array, bn = boxNI.attributes.normal.array;
const colorCache = new Map(); const col3 = (hex) => { let c = colorCache.get(hex); if (!c) { c = new T.Color(hex); colorCache.set(hex, c); } return c; };
function mergedCubes(list) {
  const n = list.length, pos = new Float32Array(n * 108), nor = new Float32Array(n * 108), col = new Float32Array(n * 108);
  for (let i = 0; i < n; i++) { const c = list[i], cc = col3(c.color);
    for (let v = 0; v < 36; v++) { const o = i * 108 + v * 3; pos[o] = bp[v * 3] * c.sx + c.x; pos[o + 1] = bp[v * 3 + 1] * c.sy + c.y; pos[o + 2] = bp[v * 3 + 2] * c.sz + c.z;
      nor[o] = bn[v * 3]; nor[o + 1] = bn[v * 3 + 1]; nor[o + 2] = bn[v * 3 + 2]; col[o] = cc.r; col[o + 1] = cc.g; col[o + 2] = cc.b; } }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('normal', new T.BufferAttribute(nor, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3)); return g;
}
function mergedLeaves(list) {
  const tri = LEAF_PTS.length, n = list.length, pos = new Float32Array(n * tri * 9), nor = new Float32Array(n * tri * 9), col = new Float32Array(n * tri * 9);
  const v = new T.Vector3(), nv = new T.Vector3(), q = new T.Quaternion(), e = new T.Euler(); let o = 0;
  for (const l of list) {
    e.set(l.tiltX, l.tiltY, l.rot, 'XYZ'); q.setFromEuler(e); nv.set(0, 0, 1).applyQuaternion(q); const cc = col3(l.color);
    for (let t = 0; t < tri; t++) { const pa = LEAF_PTS[t], pb = LEAF_PTS[(t + 1) % tri];
      for (const pt of [LEAF_C, pb, pa]) { v.set(pt[0] * l.wid, (pt[1] - 0.4) * l.len, 0).applyQuaternion(q);
        pos[o] = v.x + l.x; pos[o + 1] = v.y + l.y; pos[o + 2] = v.z + l.z; nor[o] = nv.x; nor[o + 1] = nv.y; nor[o + 2] = nv.z; col[o] = cc.r; col[o + 1] = cc.g; col[o + 2] = cc.b; o += 3; } } }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('normal', new T.BufferAttribute(nor, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3)); return g;
}
function makeMats(style) {
  const bark = new T.Color(style.bark), ds = { side: T.DoubleSide, vertexColors: true };
  return {
    bark: { normal: toonMat({ color: bark }), dim: toonMat({ color: bark.clone().multiplyScalar(0.45) }), hov: toonMat({ color: bark, emissive: 0xe3b341, emissiveIntensity: 0.9 }), dep: toonMat({ color: bark, emissive: 0x2fbf4a, emissiveIntensity: 0.7 }), src: toonMat({ color: bark, emissive: 0x3d6dff, emissiveIntensity: 0.8 }) },
    leaf: { normal: toonMat({ ...ds }), dim: toonMat({ ...ds, color: 0x626262 }), hov: toonMat({ ...ds, emissive: 0xe3b341, emissiveIntensity: 0.8 }), dep: toonMat({ ...ds, emissive: 0x2fbf4a, emissiveIntensity: 0.55 }), src: toonMat({ ...ds, emissive: 0x3d6dff, emissiveIntensity: 0.7 }) },
  };
}

/* ---------- build the scene from a layout ---------- */
let tree = null, items = [], byName = new Map(), pickables = [], mats = null, decor = [], late = [], treeStats = null, pinned = null, hovered = null, graph = null, seed = 0;
let growT = 0, wind = true; const clock = new T.Clock();
function clearTree() {
  if (tree) { scene.remove(tree); tree.traverse(o => { if (o.geometry && o.geometry !== boxNI) o.geometry.dispose(); }); }
  decor.forEach(d => { scene.remove(d); d.traverse(o => { if (o.geometry) o.geometry.dispose(); }); });
  tree = null; items = []; byName = new Map(); pickables = []; decor = []; late = []; pinned = null; hovered = null; hideTip();
}
function buildTree() {
  clearTree();
  const flat = view === '2d';
  const stats = layoutTree(graph, $('style').value, { flat, seed }); treeStats = stats;
  mats = makeMats(stats.style);
  tree = new T.Group(); tree.scale.z = flat ? 0.4 : 1; scene.add(tree);
  const tq = (q) => new T.Quaternion(q.x, q.y, q.z, q.w);
  for (const it of stats.items) {
    const parentHolder = it.parent ? it.parent.segList[it.attachSeg].holder : tree;
    const group = new T.Group(); group.position.set(0, it.attachOffset, 0); it.qThree = tq(it.q0); group.quaternion.copy(it.qThree); parentHolder.add(group);
    if (it.parent) it.parent.segList[it.attachSeg].kids.push({ group, offset: it.attachOffset });
    let holder = group; it.segList = [];
    for (const seg of it.segs) {
      const geo = new T.CylinderGeometry(seg.rTop, seg.rBot, 1, 4, 1); geo.translate(0, 0.5, 0); geo.rotateY(Math.PI / 4);
      const mesh = new T.Mesh(geo, mats.bark.normal); mesh.userData.item = it; mesh.scale.y = 0.0001; holder.add(mesh); pickables.push(mesh);
      const next = new T.Group(); next.quaternion.copy(tq(seg.bend)); holder.add(next);
      it.segList.push({ mesh, holder, segLen: seg.len, next, kids: [] }); holder = next;
    }
    const leaf = new T.Mesh(mergedLeaves(it.leaf.list), mats.leaf.normal); leaf.userData.item = it; leaf.scale.setScalar(0.0001); holder.add(leaf); pickables.push(leaf);
    it.group = group; it.leafMesh = leaf; items.push(it); byName.set(it.name, it);
  }
  const d = layoutDecor(stats); const island = new T.Group(); island.scale.z = flat ? 0.4 : 1; const clouds = new T.Group(); clouds.userData.cloud = true;
  for (const g of d.groups) {
    let m;
    if (g.kind === 'box') { m = new T.Mesh(new T.BoxGeometry(g.sx, g.sy, g.sz), toonMat({ color: g.color })); m.position.set(g.x, g.y, g.z); m.rotation.y = g.rotY; m.rotation.x = g.rotX; }
    else m = new T.Mesh(mergedCubes(g.cubes), toonMat({ vertexColors: true }));
    if (g.late) { m.scale.setScalar(0.0001); late.push(m); }
    (g.cloud ? clouds : island).add(m);
  }
  scene.add(island); scene.add(clouds); decor.push(island, clouds);
  const aspect = stage.clientWidth / Math.max(1, stage.clientHeight), fit = fitCamera(stats, aspect, flat);
  orbit.target.set(0, fit.targetY, 0); orbit.dist = fit.dist; orbit.minD = fit.dist * 0.25; orbit.maxD = fit.dist * 3; orbit.idle = 0;
  if (flat) orbit.yaw = fit.yaw; else { orbit.yaw = fit.yaw; orbit.pitch = fit.pitch; }
  post.uniforms.isOrtho.value = flat ? 1 : 0; post.uniforms.outlineK.value = flat ? 0.85 : 0.6;
  hemi.intensity = flat ? 0.75 : 0.7; sun.intensity = flat ? 1.0 : 1.1;
  growT = 0; applyHighlight(null); renderStatus(); renderInfo(null);
}

/* ---------- animation ---------- */
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeBack = (x) => { const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const tmpE = new T.Euler(), tmpQ = new T.Quaternion();
function animate() {
  requestAnimationFrame(animate);
  const rawDt = clock.getDelta(), dt = Math.min(0.1, rawDt), now = clock.elapsedTime;
  if (tree) {
    const growing = treeStats && growT < treeStats.lastEnd + 0.5; if (growing) growT += Math.min(0.5, rawDt);
    const thick = growing ? 0.1 + 0.9 * easeOut(clamp(growT / treeStats.lastEnd, 0, 1)) : 1;
    for (const it of items) {
      if (growing) {
        const g = 1 - Math.pow(1 - clamp((growT - it.start) / it.dur, 0, 1), it.pow), segs = it.segList.length;
        for (let i = 0; i < segs; i++) { const p = clamp(g * segs - i, 0, 1), s = it.segList[i]; s.mesh.scale.y = Math.max(0.0001, s.segLen * p); s.mesh.scale.x = s.mesh.scale.z = Math.max(0.03, thick * (0.35 + 0.65 * p)); s.next.position.y = s.segLen * p; for (const k of s.kids) k.group.position.y = k.offset * p; }
        const ls = clamp((growT - it.leafStart) / it.leafDur, 0, 1); it.leafMesh.scale.setScalar(Math.max(0.0001, easeBack(ls)));
      }
      if (wind && !reduceMotion) { const amp = clamp(0.014 / (it.r + 0.05), 0, 0.075) * (it.depth === 0 ? 0.15 : 1); tmpE.set(Math.sin(now * 1.1 + it.phase) * amp * 0.6, 0, Math.sin(now * 1.6 + it.phase * 1.7) * amp); tmpQ.setFromEuler(tmpE); it.group.quaternion.copy(it.qThree).multiply(tmpQ); }
      else it.group.quaternion.copy(it.qThree);
    }
    if (growing) { const ls = easeBack(clamp((growT - treeStats.lastEnd * 0.6) / (treeStats.lastEnd * 0.4), 0, 1)); for (const m of late) m.scale.setScalar(Math.max(0.0001, ls)); }
    for (const d of decor) if (d.userData.cloud && !reduceMotion) { d.position.x += dt * 0.4; if (d.position.x > 40) d.position.x = -40; }
  }
  updateCamera(dt);
  renderer.setRenderTarget(rt); renderer.render(scene, cam());
  renderer.setRenderTarget(null); renderer.render(postScene, postCam);
}

/* ---------- highlight, hover, info ---------- */
const tip = $('tip'), infoBody = $('infoBody'), statusEl = $('status');
function applyHighlight(name) {
  if (!items.length) return;
  if (!name) { for (const it of items) { for (const s of it.segList) s.mesh.material = mats.bark.normal; it.leafMesh.material = mats.leaf.normal; } return; }
  const it0 = byName.get(name), all = it0.n.virtual;
  const deps = all ? new Set(items.map(i => i.name)) : graph.closure(name, 'out'), srcs = all ? new Set() : graph.closure(name, 'in');
  for (const it of items) { const st = it.name === name ? 'hov' : deps.has(it.name) ? 'dep' : srcs.has(it.name) ? 'src' : 'dim'; for (const s of it.segList) s.mesh.material = mats.bark[st]; it.leafMesh.material = mats.leaf[st]; }
}
const ray = new T.Raycaster(), ndc = new T.Vector2(); let lastPick = 0;
function pick(x, y) { const r = cv.getBoundingClientRect(); ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, cam()); const hits = ray.intersectObjects(pickables, false); return hits.length ? hits[0].object.userData.item : null; }
function hoverAt(x, y) {
  if (!tree || (dragging && moved > 6)) return;
  const t = performance.now(); if (t - lastPick < 40) return; lastPick = t;
  const it = pick(x, y);
  if (it) { tip.textContent = it.name + (it.n.versions[0] ? ' ' + it.n.versions[0] : ''); tip.hidden = false; tip.style.left = x + 'px'; tip.style.top = y + 'px'; cv.style.cursor = 'pointer'; } else { hideTip(); cv.style.cursor = ''; }
  if (!pinned) setHover(it ? it.name : null);
}
function hideTip() { tip.hidden = true; }
function clickAt(x, y) { const it = pick(x, y); if (!it) { pinned = null; setHover(null); return; } pinned = pinned === it.name ? null : it.name; setHover(pinned); }
function setHover(name) { if (name === hovered) return; hovered = name; applyHighlight(name); renderInfo(name); }
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function renderInfo(name) {
  if (!name) { infoBody.innerHTML = '<p class="hint">Hover a branch to trace what it needs and who needs it. Click to pin.</p>'; return; }
  const n = byName.get(name).n;
  if (n.virtual) { infoBody.innerHTML = `<h2>workspace</h2><p class="hint">${graph.roots.length} workspace members share this trunk: ${esc(graph.roots.map(r => r.name).join(', '))}.</p>`; return; }
  const deps = graph.closure(name, 'out'), srcs = graph.closure(name, 'in');
  const needed = [...n.in].sort(), shown = needed.slice(0, 6).join(', ') + (needed.length > 6 ? ` +${needed.length - 6} more` : '');
  const via = [...n.viaTags].map(t => t.replace('dev:', 'dev group ').replace('extra:', 'extra ')).join(', ');
  const kind = n.kind === 'editable' || n.kind === 'virtual' || n.kind === 'root' ? 'this project' : n.kind;
  infoBody.innerHTML = `<h2>${esc(n.name)} <span class="ver">${esc(n.versions.join(' / '))}</span></h2>
    <dl><dt>source</dt><dd>${esc(kind)}${pinned === name ? ' · pinned' : ''}</dd>
    <dt>depth</dt><dd>${n.depth === 0 ? 'trunk' : 'level ' + n.depth}</dd>
    <dt>needs</dt><dd>${n.out.size} directly, ${deps.size} in total</dd>
    <dt>needed by</dt><dd>${needed.length ? esc(shown) : 'nothing (root)'}${srcs.size > needed.length ? ` · ${srcs.size} upstream in all` : ''}</dd>
    ${via ? `<dt>via</dt><dd>${esc(via)}</dd>` : ''}</dl>`;
}
function renderStatus() {
  const s = treeStats, a = s.age, stageName = a.stage[0].toUpperCase() + a.stage.slice(1);
  statusEl.innerHTML = `<b>${stageName} ${s.style.name}</b> from ${esc(graph.format)} · ${a.years} year${a.years === 1 ? '' : 's'} old · ${s.count} package${s.count === 1 ? '' : 's'} · ${s.depth} level${s.depth === 1 ? '' : 's'} deep${s.roots > 1 ? ` · ${s.roots} workspace members` : ''}${seed ? ` · seed ${seed}` : ''}`;
}

/* ---------- UI ---------- */
const sampleSel = $('sample'), drawer = $('drawer'), lockText = $('lockText'), errEl = $('err');
let currentText = '', sampleKey = 'mature';
function grow(text, key) { graph = buildGraph(text); currentText = text; sampleKey = key; buildTree(); }
function regrow(newSeed) { if (newSeed !== undefined) seed = newSeed; if (graph) buildTree(); }
$('style').addEventListener('change', () => regrow());
$('view').addEventListener('change', e => { view = e.target.value; orbit.pitch = 0.28; regrow(); });
$('regrow').addEventListener('click', () => regrow(1 + Math.floor(Math.random() * 999999)));
sampleSel.addEventListener('change', () => { if (sampleSel.value === 'custom') return; seed = 0; grow(SAMPLES[sampleSel.value], sampleSel.value); });
$('pixel').addEventListener('input', e => { pixelSize = +e.target.value; resize(); });
$('outlines').addEventListener('change', e => { post.uniforms.outline.value = e.target.checked ? 1 : 0; });
$('wind').addEventListener('change', e => { wind = e.target.checked; });
$('menuBtn').addEventListener('click', () => { const c = $('ctrl'); c.hidden = !c.hidden; $('menuBtn').setAttribute('aria-expanded', String(!c.hidden)); });
$('loadBtn').addEventListener('click', () => { lockText.value = currentText; errEl.textContent = ''; drawer.hidden = false; lockText.focus(); });
$('cancel').addEventListener('click', () => { drawer.hidden = true; });
drawer.addEventListener('click', e => { if (e.target === drawer) drawer.hidden = true; });
addEventListener('keydown', e => { if (e.key === 'Escape') { drawer.hidden = true; if (pinned) { pinned = null; setHover(null); } } });
$('grow').addEventListener('click', () => {
  try { seed = 0; grow(lockText.value, 'custom'); const opt = sampleSel.querySelector('[value=custom]'); opt.hidden = false; sampleSel.value = 'custom'; drawer.hidden = true; }
  catch (err) { errEl.textContent = 'Could not read that lockfile: ' + err.message; }
});
const readFile = (f) => { if (!f) return; const r = new FileReader(); r.onload = () => { lockText.value = r.result; errEl.textContent = ''; }; r.readAsText(f); };
$('file').addEventListener('change', e => readFile(e.target.files[0]));
const drop = $('drop');
for (const ev of ['dragenter', 'dragover']) drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); });
for (const ev of ['dragleave', 'drop']) drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); });
drop.addEventListener('drop', e => readFile(e.dataTransfer.files[0]));
document.body.addEventListener('dragover', e => e.preventDefault());
document.body.addEventListener('drop', e => { e.preventDefault(); if (drawer.hidden && e.dataTransfer.files[0]) { drawer.hidden = false; readFile(e.dataTransfer.files[0]); } });
$('formats').textContent = Object.keys(FORMATS).join(', ');

function start(saved) {
  resize(); animate();
  if (saved && saved.style && STYLES[saved.style]) $('style').value = saved.style;
  if (saved && (saved.view === '2d' || saved.view === '3d')) { view = saved.view; $('view').value = view; }
  if (saved && saved.pixel) { pixelSize = saved.pixel; $('pixel').value = saved.pixel; resize(); }
  if (saved && saved.seed) seed = saved.seed;
  try {
    if (saved && saved.key === 'custom' && saved.text) { grow(saved.text, 'custom'); sampleSel.querySelector('[value=custom]').hidden = false; sampleSel.value = 'custom'; }
    else { const k = saved && SAMPLES[saved.key] ? saved.key : 'mature'; sampleSel.value = k; grow(SAMPLES[k], k); }
  } catch (e) { statusEl.textContent = 'Could not grow: ' + e.message; }
}
window.claude?.hot?.snapshot?.(() => ({ key: sampleKey, text: sampleKey === 'custom' ? currentText : '', style: $('style').value, pixel: pixelSize, view, seed }));
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
