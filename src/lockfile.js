// Lockfile parsers and dependency graph. Pure JavaScript, no dependencies; shared by the web page and the CLI.
/* ---------- TOML subset parser (what uv writes: tables, array tables, strings, numbers, bools, arrays, inline tables) ---------- */
function stripComment(line) {
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '\\' && q === '"') i++; else if (c === q) q = null; }
    else if (c === '"' || c === "'") q = c;
    else if (c === '#') return line.slice(0, i);
  }
  return line;
}
function bracketBalance(s) {
  let d = 0, q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\' && q === '"') i++; else if (c === q) q = null; }
    else if (c === '"' || c === "'") q = c;
    else if (c === '[' || c === '{') d++;
    else if (c === ']' || c === '}') d--;
  }
  return d;
}
function parseValue(src) {
  let p = 0;
  const ws = () => { while (p < src.length && /[\s,]/.test(src[p])) p++; };
  const err = (m) => { throw new Error(m + ' near "' + src.slice(Math.max(0, p - 12), p + 12).replace(/\n/g, ' ') + '"'); };
  function val() {
    ws();
    const c = src[p];
    if (c === '"') {
      if (src.startsWith('"""', p)) { const e = src.indexOf('"""', p + 3); const s = src.slice(p + 3, e); p = e + 3; return s; }
      p++; let out = '';
      while (p < src.length && src[p] !== '"') {
        if (src[p] === '\\') { p++; const e = src[p]; const map = { n: '\n', t: '\t', r: '\r', '"': '"', '\\': '\\' };
          if (e === 'u') { out += String.fromCharCode(parseInt(src.slice(p + 1, p + 5), 16)); p += 5; continue; }
          out += map[e] ?? e; p++; continue; }
        out += src[p++];
      }
      p++; return out;
    }
    if (c === "'") {
      if (src.startsWith("'''", p)) { const e = src.indexOf("'''", p + 3); const s = src.slice(p + 3, e); p = e + 3; return s; }
      const e = src.indexOf("'", p + 1); const s = src.slice(p + 1, e); p = e + 1; return s;
    }
    if (c === '[') { p++; const arr = []; for (;;) { ws(); if (src[p] === ']') { p++; return arr; } if (p >= src.length) err('unterminated array'); arr.push(val()); } }
    if (c === '{') { p++; const obj = {}; for (;;) { ws(); if (src[p] === '}') { p++; return obj; } if (p >= src.length) err('unterminated table');
        const k = key(); ws(); if (src[p] !== '=') err('expected ='); p++; obj[k] = val(); } }
    const m = /^(true|false|[-+]?(?:\d[\d_]*)(?:\.\d+)?(?:[eE][-+]?\d+)?|[-+]?(inf|nan)|\d{4}-\d\d-\d\d[^\s,\]}]*)/.exec(src.slice(p));
    if (m) { p += m[0].length; if (m[0] === 'true') return true; if (m[0] === 'false') return false; const n = Number(m[0].replace(/_/g, '')); return isNaN(n) ? m[0] : n; }
    err('unexpected token');
  }
  function key() { ws(); if (src[p] === '"' || src[p] === "'") return String(val()); const m = /^[A-Za-z0-9_\-]+/.exec(src.slice(p)); if (!m) err('bad key'); p += m[0].length; return m[0]; }
  const v = val(); ws(); return v;
}
function parseToml(text) {
  const root = {}; let cur = root;
  const lines = text.split(/\r?\n/);
  const resolve = (path, asArrayItem) => {
    let node = root;
    for (let i = 0; i < path.length; i++) {
      const seg = path[i], last = i === path.length - 1;
      if (last && asArrayItem) { if (!Array.isArray(node[seg])) node[seg] = []; const t = {}; node[seg].push(t); return t; }
      if (node[seg] === undefined) node[seg] = {};
      node = Array.isArray(node[seg]) ? node[seg][node[seg].length - 1] : node[seg];
    }
    return node;
  };
  const splitPath = (s) => s.split('.').map(x => x.trim().replace(/^"|"$/g, ''));
  for (let i = 0; i < lines.length; i++) {
    let line = stripComment(lines[i]).trim();
    if (!line) continue;
    if (line.startsWith('[[')) { cur = resolve(splitPath(line.slice(2, line.indexOf(']]'))), true); continue; }
    if (line.startsWith('[')) { cur = resolve(splitPath(line.slice(1, line.indexOf(']'))), false); continue; }
    const eq = line.indexOf('=');
    if (eq < 0) throw new Error('Line ' + (i + 1) + ': expected key = value');
    const k = line.slice(0, eq).trim().replace(/^"|"$/g, '');
    let v = line.slice(eq + 1);
    while (bracketBalance(v) > 0 && i + 1 < lines.length) { i++; v += '\n' + stripComment(lines[i]); }
    try { cur[k] = parseValue(v); } catch (e) { throw new Error('Line ' + (i + 1) + ': ' + e.message); }
  }
  return root;
}

/* ---------- uv.lock → dependency graph ---------- */
const FORMATS = {
  'uv.lock': 'uv (Python)', 'poetry.lock': 'Poetry (Python)', 'Pipfile.lock': 'Pipenv (Python)',
  'package-lock.json': 'npm', 'bun.lock': 'Bun', 'yarn.lock': 'Yarn', 'pnpm-lock.yaml': 'pnpm',
  'Cargo.lock': 'Cargo (Rust)', 'Gemfile.lock': 'Bundler (Ruby)', 'composer.lock': 'Composer (PHP)',
};
function detectFormat(t) {
  if (t[0] === '{') {
    let json; try { json = JSON.parse(stripJsonc(t)); } catch (e) { throw new Error('Invalid JSON: ' + e.message); }
    if (json._meta && (json.default || json.develop)) return ['Pipfile.lock', json];
    if (Array.isArray(json.packages) && (json['packages-dev'] !== undefined || json['content-hash'] !== undefined || json['minimum-stability'] !== undefined)) return ['composer.lock', json];
    if (json.workspaces && json.packages && !json.packages[''] && typeof json.workspaces === 'object' && !Array.isArray(json.workspaces)) return ['bun.lock', json];
    if (json.lockfileVersion !== undefined || json.packages || json.dependencies) return ['package-lock.json', json];
    throw new Error('This JSON is not a lockfile this tool knows (npm, bun, Pipfile or composer).');
  }
  if (/^# This file is automatically @generated by Cargo/m.test(t) || (/^\[\[package\]\]/m.test(t) && /^checksum = /m.test(t))) return ['Cargo.lock', null];
  if (/^# yarn lockfile v1/m.test(t) || /^# THIS IS AN AUTOGENERATED FILE\. DO NOT EDIT THIS FILE DIRECTLY\.\s*\n# yarn/m.test(t)) return ['yarn.lock', null];
  if (/^__metadata:/m.test(t)) return ['yarn.lock', null];
  if (/^lockfileVersion:/m.test(t) && (/^importers:/m.test(t) || /^packages:/m.test(t))) return ['pnpm-lock.yaml', null];
  if (/^GEM\s*$/m.test(t) && /^  specs:/m.test(t) || /^DEPENDENCIES\s*$/m.test(t)) return ['Gemfile.lock', null];
  if (/^\[\[package\]\]/m.test(t)) { if (/^python-versions = /m.test(t) || /^\[package\.dependencies\]/m.test(t) || /^lock-version = /m.test(t)) return ['poetry.lock', null]; return ['uv.lock', null]; }
  throw new Error('Unrecognised lockfile. Supported: ' + Object.keys(FORMATS).join(', ') + '.');
}
function buildGraph(text) {
  const t = text.trim();
  if (!t) throw new Error('Nothing to read. Paste a lockfile (' + Object.keys(FORMATS).join(', ') + ').');
  const [format, json] = detectFormat(t);
  const meta = { format, ecosystem: FORMATS[format] };
  switch (format) {
    case 'package-lock.json': return finishGraph(npmNodes(json), Object.assign(meta, { lockfileVersion: json.lockfileVersion }));
    case 'bun.lock': return finishGraph(bunNodes(json), meta);
    case 'Pipfile.lock': return finishGraph(pipfileNodes(json), meta);
    case 'composer.lock': return finishGraph(composerNodes(json), meta);
    case 'Cargo.lock': return finishGraph(cargoNodes(parseToml(text)), meta);
    case 'poetry.lock': return finishGraph(poetryNodes(parseToml(text)), meta);
    case 'yarn.lock': return finishGraph(/^__metadata:/m.test(t) ? yarnBerryNodes(parseYaml(text)) : yarnClassicNodes(text), meta);
    case 'pnpm-lock.yaml': return finishGraph(pnpmNodes(parseYaml(text)), meta);
    case 'Gemfile.lock': return finishGraph(gemfileNodes(text), meta);
    default: { const doc = parseToml(text); return finishGraph(uvNodes(doc), Object.assign(meta, { manifest: doc.manifest || null, requiresPython: doc['requires-python'] })); }
  }
}
function stripJsonc(text) { // comments and trailing commas, outside strings
  let out = "", q = false;
  for (let i = 0; i < text.length; i++) { const c = text[i];
    if (q) { out += c; if (c === "\\") { out += text[++i] ?? ""; } else if (c === '"') q = false; continue; }
    if (c === '"') { q = true; out += c; continue; }
    if (c === "/" && text[i + 1] === "/") { while (i < text.length && text[i] !== "\n") i++; out += "\n"; continue; }
    if (c === "/" && text[i + 1] === "*") { const e = text.indexOf("*/", i + 2); i = e < 0 ? text.length : e + 1; continue; }
    out += c; }
  return out.replace(/,(\s*[\]}])/g, "$1");
}
function bunNodes(json) {
  const nodes = new Map();
  const get = (name, kind) => { let n = nodes.get(name); if (!n) { n = newNode(name, kind || "registry"); nodes.set(name, n); } return n; };
  const addDep = (map, dn, tag) => { const e = map.get(dn) || { name: dn, extras: new Set(), tags: new Set() }; if (tag) e.tags.add(tag); map.set(dn, e); };
  const addVer = (n, v) => { if (v && !n.versions.includes(String(v))) n.versions.push(String(v)); };
  const wsNames = new Map();
  for (const [path, w] of Object.entries(json.workspaces)) { if (!w || typeof w !== "object") continue; const name = w.name || (path === "" ? "project" : path.split("/").pop()); wsNames.set(path, name);
    const n = get(name, "root"); n.kind = "root"; addVer(n, w.version);
    for (const d of Object.keys(w.dependencies || {})) addDep(n.deps, d);
    for (const d of Object.keys(w.optionalDependencies || {})) addDep(n.deps, d, "optional");
    for (const d of Object.keys(w.peerDependencies || {})) addDep(n.deps, d, "peer");
    if (w.devDependencies && Object.keys(w.devDependencies).length) { n.dev.dev = n.dev.dev || new Map(); for (const d of Object.keys(w.devDependencies)) addDep(n.dev.dev, d, "dev:dev"); } }
  for (const [key, entry] of Object.entries(json.packages)) {
    if (!Array.isArray(entry) || typeof entry[0] !== "string") continue;
    const spec = entry[0]; const at = spec.lastIndexOf("@"); const name = at > 0 ? spec.slice(0, at) : spec; const ver = at > 0 ? spec.slice(at + 1) : "";
    if (ver.startsWith("workspace:")) continue;
    const kind = /^(git|github):/.test(ver) ? "git" : /^(file|link):/.test(ver) ? "path" : /^https?:/.test(ver) ? "url" : "registry";
    const n = get(name, kind); addVer(n, kind === "registry" ? ver : ver.replace(/^[a-z]+:/, ""));
    const info = entry.find(x => x && typeof x === "object" && !Array.isArray(x)) || {};
    for (const d of Object.keys(info.dependencies || {})) addDep(n.deps, d);
    for (const d of Object.keys(info.optionalDependencies || {})) addDep(n.deps, d, "optional");
  }
  if (!nodes.size) throw new Error("No packages found in bun.lock.");
  return nodes;
}
function newNode(name, kind) { return { name, versions: [], kind, deps: new Map(), optional: {}, dev: {}, reqExtras: new Set() }; }
function npmNodes(json) {
  const nodes = new Map();
  const get = (name, kind) => { let n = nodes.get(name); if (!n) { n = newNode(name, kind || "registry"); nodes.set(name, n); } return n; };
  const addDep = (map, dn, tag) => { const e = map.get(dn) || { name: dn, extras: new Set(), tags: new Set() }; if (tag) e.tags.add(tag); map.set(dn, e); };
  const addVer = (n, v) => { if (v && !n.versions.includes(String(v))) n.versions.push(String(v)); };
  if (json.packages && typeof json.packages === "object") { // lockfileVersion 2 and 3
    const rootName = (json.packages[""] && json.packages[""].name) || json.name || "project";
    for (const [key, p] of Object.entries(json.packages)) {
      if (!p || typeof p !== "object") continue;
      const isRoot = key === ""; const idx = key.lastIndexOf("node_modules/");
      const name = isRoot ? rootName : (idx >= 0 ? key.slice(idx + 13) : key);
      if (p.link) continue;
      const n = get(name, isRoot ? "root" : (p.resolved && /^git/.test(p.resolved) ? "git" : /^file:/.test(p.resolved || "") ? "path" : "registry"));
      if (isRoot) n.kind = "root"; addVer(n, p.version);
      for (const d of Object.keys(p.dependencies || {})) addDep(n.deps, d);
      for (const d of Object.keys(p.optionalDependencies || {})) addDep(n.deps, d, "optional");
      if (isRoot) { n.dev.dev = n.dev.dev || new Map(); for (const d of Object.keys(p.devDependencies || {})) addDep(n.dev.dev, d, "dev:dev"); }
    }
    if (!nodes.size) throw new Error("No packages found in package-lock.json.");
    return nodes;
  }
  if (json.dependencies && typeof json.dependencies === "object") { // lockfileVersion 1
    const rootName = json.name || "project"; const root = get(rootName, "root"); addVer(root, json.version);
    const walk = (deps, top) => { for (const [name, d] of Object.entries(deps)) { if (!d || typeof d !== "object") continue; const n = get(name); addVer(n, d.version);
      for (const r of Object.keys(d.requires || {})) addDep(n.deps, r);
      if (top) { if (d.dev) { root.dev.dev = root.dev.dev || new Map(); addDep(root.dev.dev, name, "dev:dev"); } else addDep(root.deps, name); }
      if (d.dependencies) walk(d.dependencies, false); } };
    walk(json.dependencies, true);
    // top-level packages that something else already requires are not direct deps of the root
    const required = new Set(); for (const n of nodes.values()) if (n !== root) for (const e of n.deps.keys()) required.add(e);
    for (const e of [...root.deps.keys()]) if (required.has(e) && !(root.dev.dev && root.dev.dev.has(e))) root.deps.delete(e);
    return nodes;
  }
  throw new Error("This JSON does not look like a package-lock.json (no packages or dependencies).");
}
function uvNodes(doc) {
  const pkgs = doc.package;
  if (!Array.isArray(pkgs) || !pkgs.length) throw new Error('No [[package]] tables found. Is this a uv.lock?');
  const nodes = new Map();
  const srcKind = (s) => !s ? 'unknown' : s.editable !== undefined ? 'editable' : s.virtual !== undefined ? 'virtual' : s.registry ? 'registry' : s.git ? 'git' : s.url ? 'url' : s.path ? 'path' : s.directory ? 'directory' : Object.keys(s)[0] || 'unknown';
  for (const p of pkgs) {
    if (!p.name) continue;
    const name = String(p.name).toLowerCase();
    let n = nodes.get(name);
    if (!n) { n = newNode(name, srcKind(p.source)); nodes.set(name, n); }
    if (p.version && !n.versions.includes(String(p.version))) n.versions.push(String(p.version));
    const addDep = (map, d, tag) => { if (!d || !d.name) return; const dn = String(d.name).toLowerCase(); const e = map.get(dn) || { name: dn, extras: new Set(), marker: d.marker, tags: new Set() }; (d.extra || []).forEach(x => e.extras.add(x)); if (tag) e.tags.add(tag); map.set(dn, e); };
    (p.dependencies || []).forEach(d => addDep(n.deps, d));
    for (const [extra, list] of Object.entries(p['optional-dependencies'] || {})) { n.optional[extra] = n.optional[extra] || new Map(); (list || []).forEach(d => addDep(n.optional[extra], d, 'extra:' + extra)); }
    for (const [group, list] of Object.entries(p['dev-dependencies'] || {})) { n.dev[group] = n.dev[group] || new Map(); (list || []).forEach(d => addDep(n.dev[group], d, 'dev:' + group)); }
  }
  return nodes;
}
function finishGraph(nodes, meta) {
  // which extras each package was asked for
  for (const n of nodes.values()) for (const map of [n.deps, ...Object.values(n.optional), ...Object.values(n.dev)]) for (const e of map.values()) { const t = nodes.get(e.name); if (t) e.extras.forEach(x => t.reqExtras.add(x)); }
  // effective edges
  const isLocal = (n) => n.kind === 'editable' || n.kind === 'virtual' || n.kind === 'directory' || n.kind === 'path' || n.kind === 'root';
  for (const n of nodes.values()) {
    const out = new Map();
    const take = (map, tag) => { for (const e of map.values()) { if (!nodes.has(e.name)) continue; const o = out.get(e.name) || { name: e.name, tags: new Set() }; if (tag) o.tags.add(tag); out.set(e.name, o); } };
    take(n.deps);
    for (const x of n.reqExtras) if (n.optional[x]) take(n.optional[x], 'extra:' + x);
    if (isLocal(n)) for (const [g, map] of Object.entries(n.dev)) take(map, 'dev:' + g);
    n.out = out; n.in = new Set();
  }
  for (const n of nodes.values()) for (const e of n.out.values()) nodes.get(e.name).in.add(n.name);
  let roots = [...nodes.values()].filter(n => isLocal(n) && ![...n.in].some(i => isLocal(nodes.get(i))));
  if (!roots.length) roots = [...nodes.values()].filter(n => n.in.size === 0);
  if (!roots.length) roots = [nodes.values().next().value];
  roots.sort((a, b) => a.name.localeCompare(b.name));
  // spanning tree by BFS (shortest path), children sorted by name
  const treeParent = new Map(); const order = [];
  const queue = roots.map(r => r.name); roots.forEach(r => treeParent.set(r.name, null));
  while (queue.length) { const name = queue.shift(); const n = nodes.get(name); n.depth = treeParent.get(name) === null ? 0 : nodes.get(treeParent.get(name)).depth + 1; order.push(n); n.children = [];
    const kids = [...n.out.keys()].sort(); for (const k of kids) if (!treeParent.has(k)) { treeParent.set(k, name); queue.push(k); } }
  for (const n of order) { const p = treeParent.get(n.name); n.parent = p; if (p) nodes.get(p).children.push(n); n.viaTags = p ? nodes.get(p).out.get(n.name).tags : new Set(); }
  const sizeOf = (n) => { n.size = 1 + n.children.reduce((s, c) => s + sizeOf(c), 0); return n.size; };
  roots.forEach(sizeOf);
  const closure = (start, dir) => { const seen = new Set(); const st = [start]; while (st.length) { const x = st.pop(); for (const y of (dir === 'out' ? nodes.get(x).out.keys() : nodes.get(x).in)) if (!seen.has(y)) { seen.add(y); st.push(y); } } seen.delete(start); return seen; };
  const maxDepth = Math.max(...order.map(n => n.depth));
  return Object.assign({ nodes, roots, order, count: order.length, maxDepth, closure }, meta);
}

/* ---------- age model: dependency count → tree age ---------- */
function ageFor(count) {
  const years = Math.max(1, Math.min(500, Math.round(count * 1.2)));
  const stage = years < 10 ? 'sapling' : years < 40 ? 'young' : years < 120 ? 'mature' : years < 300 ? 'old' : 'ancient';
  const t = Math.min(1, Math.log(count + 1) / Math.log(450)); // 0..1 across sapling → ancient
  return { years, stage, t };
}

/* ---------- synthetic lockfile generator (for the larger demo sizes) ---------- */
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function genLockText(count, seed) {
  const rnd = mulberry(seed);
  const A = ['py', 'aio', 'fast', 'hyper', 'meta', 'neo', 'poly', 'quasi', 'omni', 'ultra', 'micro', 'proto', 'geo', 'bio', 'cryo', 'astro', 'lumi', 'vexa', 'tor', 'zel'];
  const B = ['stream', 'parse', 'cache', 'graph', 'mesh', 'orm', 'auth', 'forms', 'sched', 'json', 'yaml', 'http', 'tls', 'queue', 'vector', 'tensor', 'lex', 'plot', 'ml', 'sync', 'io', 'db', 'kit', 'core', 'utils', 'types', 'cli', 'api'];
  const names = new Set(['forest-service']);
  while (names.size < count) { const n = A[Math.floor(rnd() * A.length)] + (rnd() < 0.5 ? '-' : '') + B[Math.floor(rnd() * B.length)] + (rnd() < 0.3 ? B[Math.floor(rnd() * B.length)] : ''); names.add(n); }
  const list = [...names]; const pkgs = list.map((name, i) => ({ name, version: `${Math.floor(rnd() * 5)}.${Math.floor(rnd() * 20)}.${Math.floor(rnd() * 10)}`, deps: [] }));
  // layered DAG: package i may depend on packages with larger index (acyclic); the root fans out widely
  for (let i = 1; i < pkgs.length; i++) { const k = rnd() < 0.35 ? 0 : rnd() < 0.7 ? 1 : 2 + Math.floor(rnd() * 3); for (let j = 0; j < k; j++) { const t = i + 1 + Math.floor(rnd() * Math.min(40, pkgs.length - i - 1)); if (t < pkgs.length && !pkgs[i].deps.includes(pkgs[t].name)) pkgs[i].deps.push(pkgs[t].name); } }
  const rootDeps = []; for (let i = 1; i < pkgs.length; i++) { const needed = pkgs.some((p, j) => j !== i && j > 0 && p.deps.includes(pkgs[i].name)); if (!needed || rnd() < 0.08) rootDeps.push(pkgs[i].name); }
  pkgs[0].deps = rootDeps.slice(0, Math.max(6, Math.round(count * 0.12)));
  // anything unreachable hangs off a random reachable package
  const reach = new Set(['forest-service']); const q = ['forest-service']; while (q.length) { const qn = q.shift(); const p = pkgs.find(x => x.name === qn); for (const d of p.deps) if (!reach.has(d)) { reach.add(d); q.push(d); } }
  for (const p of pkgs) if (!reach.has(p.name)) { const host = pkgs[1 + Math.floor(rnd() * Math.min(pkgs.length - 1, 30))]; if (host.name !== p.name && !host.deps.includes(p.name) && pkgs.indexOf(host) < pkgs.indexOf(p)) host.deps.push(p.name); else pkgs[0].deps.push(p.name); }
  let out = `version = 1\nrequires-python = ">=3.12"\n\n`;
  for (const p of pkgs) {
    out += `[[package]]\nname = "${p.name}"\nversion = "${p.version}"\n`;
    out += p === pkgs[0] ? `source = { editable = "." }\n` : `source = { registry = "https://pypi.org/simple" }\n`;
    if (p.deps.length) out += `dependencies = [\n${p.deps.map(d => `    { name = "${d}" },`).join('\n')}\n]\n`;
    if (p === pkgs[0]) out += `\n[package.dev-dependencies]\ndev = [\n    { name = "${pkgs[1].name}" },\n]\n`;
    out += '\n';
  }
  return out;
}

/* ---------- helpers shared by the extra parsers ---------- */
const mkGet = (nodes) => (name, kind) => { let n = nodes.get(name); if (!n) { n = newNode(name, kind || 'registry'); nodes.set(name, n); } return n; };
const addEdge = (map, dn, tag) => { const e = map.get(dn) || { name: dn, extras: new Set(), tags: new Set() }; if (tag) e.tags.add(tag); map.set(dn, e); };
const addVersion = (n, v) => { if (v !== undefined && v !== null && v !== '' && !n.versions.includes(String(v))) n.versions.push(String(v)); };
// Lockfiles without a root entry: make a synthetic root whose branches are the packages nothing else depends on.
function syntheticRoot(nodes, rootName, devNames) {
  const required = new Set(); for (const n of nodes.values()) for (const d of n.deps.keys()) required.add(d);
  const root = newNode(rootName, 'root');
  for (const n of [...nodes.values()].sort((a, b) => a.name.localeCompare(b.name))) if (!required.has(n.name)) {
    if (devNames && devNames.has(n.name)) { root.dev.dev = root.dev.dev || new Map(); addEdge(root.dev.dev, n.name, 'dev:dev'); } else addEdge(root.deps, n.name); }
  nodes.set(rootName, root); return nodes;
}
function splitSpec(spec) { // 'name@version' and '@scope/name@version' → [name, version]
  const at = spec.lastIndexOf('@'); if (at <= 0) return [spec, '']; return [spec.slice(0, at), spec.slice(at + 1)];
}

/* ---------- a small YAML subset: nested maps, scalar values, simple lists (enough for pnpm and Yarn berry) ---------- */
function yamlScalar(v) {
  v = v.trim(); if (!v) return '';
  if ((v[0] === '"' && v.endsWith('"')) || (v[0] === "'" && v.endsWith("'"))) return v.slice(1, -1).replace(/\\"/g, '"');
  return v;
}
function yamlSplitKey(line) { // returns [key, rest] where rest is after the colon, or null when no key
  let i = 0, key;
  if (line[0] === '"' || line[0] === "'") { const q = line[0]; let j = 1; while (j < line.length && line[j] !== q) { if (line[j] === '\\') j++; j++; } key = line.slice(1, j); i = j + 1; }
  else { const m = /^[^:#]*?(?=:(?:\s|$))/.exec(line); if (!m) return null; key = m[0].trim(); i = m[0].length; }
  if (line[i] !== ':') return null;
  return [key, line.slice(i + 1)];
}
function parseYaml(text) {
  const root = {}; const stack = [{ indent: -1, obj: root, parent: null, key: null }];
  const lines = text.split(/\r?\n/);
  for (let raw of lines) {
    if (!raw.trim() || /^\s*#/.test(raw)) continue;
    const indent = raw.length - raw.trimStart().length; let line = raw.trim();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const top = stack[stack.length - 1];
    if (line.startsWith('- ') || line === '-') {
      if (!Array.isArray(top.obj)) { const arr = []; if (top.parent) top.parent[top.key] = arr; top.obj = arr; }
      const item = line.slice(1).trim(); const kv = item ? yamlSplitKey(item) : null;
      if (kv && kv[1].trim() === '') { const o = {}; top.obj.push(o); const child = { indent: indent + 2, obj: {}, parent: o, key: kv[0] }; o[kv[0]] = child.obj; stack.push({ indent, obj: o, parent: null, key: null }); stack.push(child); }
      else if (kv) { const o = { [kv[0]]: yamlScalar(kv[1]) }; top.obj.push(o); stack.push({ indent, obj: o, parent: null, key: null }); }
      else top.obj.push(yamlScalar(item));
      continue;
    }
    const kv = yamlSplitKey(line); if (!kv) continue;
    const [key, rest] = kv; const val = rest.replace(/\s+#.*$/, '').trim();
    if (Array.isArray(top.obj)) continue;
    if (val === '' ) { const o = {}; top.obj[key] = o; stack.push({ indent, obj: o, parent: top.obj, key }); }
    else if (val[0] === '{' || val[0] === '[') top.obj[key] = val; // flow collections kept raw
    else top.obj[key] = yamlScalar(val);
  }
  return root;
}

/* ---------- Yarn classic (v1) ---------- */
function yarnClassicNodes(text) {
  const nodes = new Map(); const get = mkGet(nodes);
  const blocks = text.split(/\n(?=\S)/);
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith('#'));
    if (!lines.length || !lines[0].trim().endsWith(':')) continue;
    const specs = lines[0].trim().slice(0, -1).split(',').map(x => x.trim().replace(/^"|"$/g, ''));
    const name = splitSpec(specs[0])[0]; if (!name) continue;
    const n = get(name); let section = null;
    for (const l of lines.slice(1)) {
      const ind = l.length - l.trimStart().length, t = l.trim();
      if (ind === 2) { section = null; const m = /^version "?([^"]+)"?$/.exec(t); if (m) addVersion(n, m[1]); else if (/^(optionalD|d)ependencies:$/.test(t)) section = t.startsWith('optional') ? 'optional' : 'dep'; }
      else if (ind >= 4 && section) { const m = /^"?([^"\s]+)"?\s/.exec(t); if (m) addEdge(n.deps, m[1], section === 'optional' ? 'optional' : undefined); }
    }
  }
  if (!nodes.size) throw new Error('No entries found in yarn.lock.');
  return syntheticRoot(nodes, 'project');
}
/* ---------- Yarn berry (v2+) ---------- */
function yarnBerryNodes(doc) {
  const nodes = new Map(); const get = mkGet(nodes);
  for (const [key, e] of Object.entries(doc)) {
    if (key === '__metadata' || !e || typeof e !== 'object') continue;
    const res = typeof e.resolution === 'string' ? e.resolution : key.split(',')[0].trim();
    const [name, ver] = splitSpec(res); if (!name) continue;
    const isWs = /^workspace:/.test(ver);
    const n = get(name, isWs ? 'root' : /^(git|github)/.test(ver) ? 'git' : 'registry'); if (isWs) n.kind = 'root';
    addVersion(n, isWs ? '' : ver.replace(/^npm:/, ''));
    for (const d of Object.keys(typeof e.dependencies === 'object' ? e.dependencies : {})) addEdge(n.deps, d);
  }
  if (!nodes.size) throw new Error('No entries found in yarn.lock.');
  return nodes;
}
/* ---------- pnpm ---------- */
function pnpmKey(key) { // '/express@4.19.2', '/express/4.19.2', 'express@4.19.2(peer@1)' → [name, version]
  let k = key.replace(/^\//, ''); const paren = k.indexOf('('); if (paren > 0) k = k.slice(0, paren); const us = k.indexOf('_'); if (us > 0) k = k.slice(0, us);
  const at = k.lastIndexOf('@'); if (at > 0) return [k.slice(0, at), k.slice(at + 1)];
  const sl = k.lastIndexOf('/'); if (sl > 0) return [k.slice(0, sl), k.slice(sl + 1)];
  return [k, ''];
}
function pnpmNodes(doc) {
  const nodes = new Map(); const get = mkGet(nodes);
  const importers = doc.importers && typeof doc.importers === 'object' ? doc.importers : { '.': doc };
  for (const [path, imp] of Object.entries(importers)) {
    if (!imp || typeof imp !== 'object') continue;
    const name = path === '.' ? 'project' : path.split('/').pop(); const n = get(name, 'root'); n.kind = 'root';
    const take = (map, tag) => { if (map && typeof map === 'object') for (const d of Object.keys(map)) { if (tag === 'dev:dev') { n.dev.dev = n.dev.dev || new Map(); addEdge(n.dev.dev, d, tag); } else addEdge(n.deps, d, tag); } };
    take(imp.dependencies); take(imp.optionalDependencies, 'optional'); take(imp.devDependencies, 'dev:dev');
  }
  const pkgs = doc.packages && typeof doc.packages === 'object' ? doc.packages : {};
  const snaps = doc.snapshots && typeof doc.snapshots === 'object' ? doc.snapshots : null;
  for (const [key, e] of Object.entries(snaps || pkgs)) {
    const [name, ver] = pnpmKey(key); if (!name) continue; const n = get(name); addVersion(n, ver);
    const info = e && typeof e === 'object' ? e : {};
    for (const d of Object.keys(info.dependencies && typeof info.dependencies === 'object' ? info.dependencies : {})) addEdge(n.deps, d);
    for (const d of Object.keys(info.optionalDependencies && typeof info.optionalDependencies === 'object' ? info.optionalDependencies : {})) addEdge(n.deps, d, 'optional');
  }
  if (snaps) for (const key of Object.keys(pkgs)) { const [name, ver] = pnpmKey(key); if (name) addVersion(get(name), ver); }
  if (!nodes.size) throw new Error('No packages found in pnpm-lock.yaml.');
  return nodes;
}
/* ---------- Poetry ---------- */
function poetryNodes(doc) {
  const nodes = new Map(); const get = mkGet(nodes); const dev = new Set();
  for (const p of doc.package || []) {
    if (!p || !p.name) continue; const name = String(p.name).toLowerCase(); const n = get(name, p.source && p.source.type === 'git' ? 'git' : p.source && (p.source.type === 'directory' || p.source.type === 'file') ? 'path' : 'registry'); addVersion(n, p.version);
    if (p.category === 'dev' || (Array.isArray(p.groups) && p.groups.length && !p.groups.includes('main'))) dev.add(name);
    for (const [d, spec] of Object.entries(p.dependencies || {})) { const opt = spec && typeof spec === 'object' && !Array.isArray(spec) && spec.optional; addEdge(n.deps, d.toLowerCase(), opt ? 'optional' : undefined); }
  }
  if (!nodes.size) throw new Error('No [[package]] tables found in poetry.lock.');
  return syntheticRoot(nodes, 'project', dev);
}
/* ---------- Pipfile.lock (flat: no dependency graph is recorded) ---------- */
function pipfileNodes(json) {
  const nodes = new Map(); const get = mkGet(nodes); const root = get('project', 'root'); root.kind = 'root';
  for (const [name, e] of Object.entries(json.default || {})) { const n = get(name.toLowerCase()); addVersion(n, e && e.version ? String(e.version).replace(/^==/, '') : ''); addEdge(root.deps, name.toLowerCase()); }
  for (const [name, e] of Object.entries(json.develop || {})) { const n = get(name.toLowerCase()); addVersion(n, e && e.version ? String(e.version).replace(/^==/, '') : ''); root.dev.dev = root.dev.dev || new Map(); addEdge(root.dev.dev, name.toLowerCase(), 'dev:dev'); }
  if (nodes.size < 2) throw new Error('No packages found in Pipfile.lock.');
  return nodes;
}
/* ---------- Cargo ---------- */
function cargoNodes(doc) {
  const nodes = new Map(); const get = mkGet(nodes);
  for (const p of doc.package || []) {
    if (!p || !p.name) continue; const n = get(p.name, p.source ? (/^git\+/.test(p.source) ? 'git' : 'registry') : 'root'); if (!p.source) n.kind = 'root'; addVersion(n, p.version);
    for (const d of p.dependencies || []) { const dn = String(d).split(' ')[0]; addEdge(n.deps, dn); }
  }
  if (!nodes.size) throw new Error('No [[package]] tables found in Cargo.lock.');
  if (![...nodes.values()].some(n => n.kind === 'root')) syntheticRoot(nodes, 'project');
  return nodes;
}
/* ---------- Bundler (Gemfile.lock) ---------- */
function gemfileNodes(text) {
  const nodes = new Map(); const get = mkGet(nodes); const root = get('Gemfile', 'root'); root.kind = 'root';
  let section = null, inSpecs = false, cur = null;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const ind = raw.length - raw.trimStart().length, t = raw.trim();
    if (ind === 0) { section = t; inSpecs = false; cur = null; continue; }
    if (section === 'DEPENDENCIES') { const m = /^([^\s(!]+)/.exec(t); if (m) addEdge(root.deps, m[1]); continue; }
    if (['GEM', 'GIT', 'PATH', 'PLUGIN SOURCE'].includes(section)) {
      if (ind === 2) { inSpecs = t === 'specs:'; cur = null; continue; }
      if (!inSpecs) continue;
      const m = /^([^\s(]+)(?:\s+\(([^)]*)\))?/.exec(t); if (!m) continue;
      if (ind === 4) { cur = get(m[1], section === 'GEM' ? 'registry' : section === 'GIT' ? 'git' : 'path'); addVersion(cur, m[2] ? m[2].split(/\s*-\s*/)[0] : ''); }
      else if (ind >= 6 && cur) addEdge(cur.deps, m[1]);
    }
  }
  if (nodes.size < 2) throw new Error('No gems found in Gemfile.lock.');
  return nodes;
}
/* ---------- Composer ---------- */
function composerNodes(json) {
  const nodes = new Map(); const get = mkGet(nodes); const dev = new Set();
  const platform = (k) => !k.includes('/') || /^(ext|lib)-/.test(k);
  const take = (list, isDev) => { for (const p of list || []) { if (!p || !p.name) continue; const n = get(p.name, p.source && p.source.type === 'git' && !p.dist ? 'git' : 'registry'); addVersion(n, p.version); if (isDev) dev.add(p.name);
    for (const d of Object.keys(p.require || {})) if (!platform(d)) addEdge(n.deps, d); } };
  take(json.packages, false); take(json['packages-dev'], true);
  if (!nodes.size) throw new Error('No packages found in composer.lock.');
  return syntheticRoot(nodes, 'project', dev);
}

export { parseToml, parseYaml, stripJsonc, buildGraph, detectFormat, FORMATS, ageFor, genLockText };
