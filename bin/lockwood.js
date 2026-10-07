#!/usr/bin/env node
// Lockwood CLI: render a pixel-art dependency tree from a lockfile to PNG or SVG, without a browser.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { buildGraph, FORMATS } from '../src/lockfile.js';
import { layoutTree, layoutDecor, STYLES } from '../src/layout.js';
import { render, toSvg } from '../src/raster.js';
import { encodePng } from '../src/png.js';

const HELP = `lockwood — grow a pixel-art tree from a lockfile

Usage: lockwood [options]

  -l, --lock <file>     lockfile to read (default: first of ${Object.keys(FORMATS).join(', ')} found in the current folder)
  -o, --out <file>      output image, .png or .svg (default: lockwood.png)
  -s, --style <name>    ${Object.keys(STYLES).join(' | ')} (default: oak)
      --width <px>      pixel-grid width (default: 400)
      --height <px>     pixel-grid height (default: 300)
      --scale <n>       upscale factor for the output (default: 2)
      --bg <value>      transparent | sky | #rrggbb (default: transparent)
      --seed <n>        layout seed; 0 is the canonical tree (default: 0)
      --badge <file>    also write a shields-style SVG badge with the tree's age and size
      --no-outline      skip the inked outline
      --json            print the tree stats as JSON instead of a summary line
  -h, --help            show this help
`;

function parseArgs(argv) {
  const o = { lock: '', out: 'lockwood.png', style: 'oak', width: 400, height: 300, scale: 2, bg: 'transparent', seed: 0, badge: '', outline: true, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], next = () => { if (i + 1 >= argv.length) throw new Error(`${a} needs a value`); return argv[++i]; };
    if (a === '-h' || a === '--help') { process.stdout.write(HELP); process.exit(0); }
    else if (a === '-l' || a === '--lock') o.lock = next();
    else if (a === '-o' || a === '--out') o.out = next();
    else if (a === '-s' || a === '--style') o.style = next();
    else if (a === '--width') o.width = +next(); else if (a === '--height') o.height = +next(); else if (a === '--scale') o.scale = +next();
    else if (a === '--bg') o.bg = next(); else if (a === '--seed') o.seed = +next(); else if (a === '--badge') o.badge = next();
    else if (a === '--no-outline') o.outline = false; else if (a === '--json') o.json = true;
    else if (a.startsWith('--') && a.includes('=')) { argv.splice(i + 1, 0, a.slice(a.indexOf('=') + 1)); argv[i] = a.slice(0, a.indexOf('=')); i--; }
    else throw new Error(`Unknown option ${a}. Try --help.`);
  }
  return o;
}

function badgeSvg(stats) {
  const stage = stats.age.stage[0].toUpperCase() + stats.age.stage.slice(1);
  const left = 'lockwood', right = `${stage.toLowerCase()} ${stats.style.name} · ${stats.count} pkgs · ${stats.age.years} yrs`;
  const tw = (s) => Math.round(s.length * 6.4 + 10);
  const lw = tw(left), rw = tw(right), color = { sapling: '#97ca00', young: '#4c1', mature: '#2f8a3a', old: '#8b5a2b', ancient: '#5a3b26' }[stats.age.stage] || '#4c1';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lw + rw}" height="20" role="img" aria-label="${left}: ${right}">
<title>${left}: ${right}</title>
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
<clipPath id="r"><rect width="${lw + rw}" height="20" rx="3" fill="#fff"/></clipPath>
<g clip-path="url(#r)"><rect width="${lw}" height="20" fill="#555"/><rect x="${lw}" width="${rw}" height="20" fill="${color}"/><rect width="${lw + rw}" height="20" fill="url(#s)"/></g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
<text x="${lw / 2}" y="15" fill="#010101" fill-opacity=".3">${left}</text><text x="${lw / 2}" y="14">${left}</text>
<text x="${lw + rw / 2}" y="15" fill="#010101" fill-opacity=".3">${right}</text><text x="${lw + rw / 2}" y="14">${right}</text>
</g></svg>
`;
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  if (!o.lock) { o.lock = Object.keys(FORMATS).find(f => existsSync(f)) || ''; if (!o.lock) throw new Error(`No lockfile found here. Pass one with --lock. Supported: ${Object.keys(FORMATS).join(', ')}.`); }
  if (!STYLES[o.style]) throw new Error(`Unknown style "${o.style}". Use one of ${Object.keys(STYLES).join(', ')}.`);
  const text = readFileSync(o.lock, 'utf8');
  const graph = buildGraph(text);
  const stats = layoutTree(graph, o.style, { flat: true, seed: o.seed });
  const decor = layoutDecor(stats);
  const bg = o.bg === 'transparent' ? null : o.bg === 'sky' ? 'sky' : parseInt(o.bg.replace('#', ''), 16);
  if (bg !== null && bg !== 'sky' && Number.isNaN(bg)) throw new Error(`--bg must be transparent, sky or #rrggbb (got ${o.bg}).`);
  const img = render(stats, decor, { width: o.width, height: o.height, bg, outline: o.outline });
  const outPath = resolve(o.out); mkdirSync(dirname(outPath), { recursive: true });
  const ext = extname(outPath).toLowerCase();
  if (ext === '.svg') writeFileSync(outPath, toSvg(img, o.scale, `Dependency tree of ${stats.rootName}: ${stats.count} packages`));
  else if (ext === '.png') writeFileSync(outPath, encodePng(img, o.scale));
  else throw new Error(`--out must end in .png or .svg (got ${o.out}).`);
  if (o.badge) { mkdirSync(dirname(resolve(o.badge)), { recursive: true }); writeFileSync(resolve(o.badge), badgeSvg(stats)); }
  const summary = { format: graph.format, ecosystem: graph.ecosystem, root: stats.rootName, packages: stats.count, depth: stats.depth, stage: stats.age.stage, years: stats.age.years, style: o.style, seed: o.seed, out: o.out, width: o.width * o.scale, height: o.height * o.scale, badge: o.badge || undefined };
  if (o.json) process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  else process.stdout.write(`${summary.stage[0].toUpperCase() + summary.stage.slice(1)} ${o.style} from ${graph.format}: ${stats.count} packages, ${stats.depth} levels deep, ${stats.age.years} years old -> ${o.out} (${summary.width}x${summary.height})${o.badge ? `, badge -> ${o.badge}` : ''}\n`);
}

try { main(); } catch (e) { process.stderr.write(`lockwood: ${e.message}\n`); process.exit(1); }
