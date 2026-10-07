// Smoke tests: every sample lockfile parses to the expected shape, and the rasterizer draws something for each.
import { readdirSync, readFileSync } from 'node:fs';
import { buildGraph } from '../src/lockfile.js';
import { layoutTree, layoutDecor, STYLES } from '../src/layout.js';
import { render } from '../src/raster.js';
import { encodePng } from '../src/png.js';

const expected = {
  'orchard.uv.lock': ['uv.lock', 50, 3], 'tiny-cli.uv.lock': ['uv.lock', 4, 2], 'ledger-api.package-lock.json': ['package-lock.json', 37, 4], 'ledger-api.bun.lock': ['bun.lock', 37, 4],
  'yarn-classic.yarn.lock': ['yarn.lock', 9, 5], 'yarn-berry.yarn.lock': ['yarn.lock', 4, 2], 'pnpm-lock.yaml': ['pnpm-lock.yaml', 4, 1], 'poetry.lock': ['poetry.lock', 9, 2],
  'Pipfile.lock': ['Pipfile.lock', 5, 1], 'Cargo.lock': ['Cargo.lock', 9, 3], 'Gemfile.lock': ['Gemfile.lock', 12, 3], 'composer.lock': ['composer.lock', 11, 3],
};
let failed = 0;
const check = (name, ok, detail) => { if (!ok) failed++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ' ' + detail : ''}`); };
for (const file of readdirSync(new URL('../samples/', import.meta.url)).sort()) {
  const text = readFileSync(new URL('../samples/' + file, import.meta.url), 'utf8');
  let graph; try { graph = buildGraph(text); } catch (e) { check(file, false, e.message); continue; }
  const exp = expected[file];
  check(file, !exp || (graph.format === exp[0] && graph.count === exp[1] && graph.maxDepth === exp[2]), `${graph.format} ${graph.count} packages, depth ${graph.maxDepth}`);
  const stats = layoutTree(graph, 'oak', { flat: true, seed: 0 });
  const img = render(stats, layoutDecor(stats), { width: 120, height: 90 });
  let drawn = 0; for (let i = 3; i < img.rgba.length; i += 4) if (img.rgba[i]) drawn++;
  check(file + ' render', drawn > 500, `${drawn} pixels`);
}
for (const style of Object.keys(STYLES)) {
  const graph = buildGraph(readFileSync(new URL('../samples/orchard.uv.lock', import.meta.url), 'utf8'));
  const a = layoutTree(graph, style, { flat: true, seed: 0 }), b = layoutTree(graph, style, { flat: true, seed: 0 }), c = layoutTree(graph, style, { flat: true, seed: 7 });
  check(`style ${style} deterministic`, a.items[1].tipPos.x === b.items[1].tipPos.x && a.items[1].tipPos.x !== c.items[1].tipPos.x);
}
const png = encodePng(render(layoutTree(buildGraph(readFileSync(new URL('../samples/tiny-cli.uv.lock', import.meta.url), 'utf8')), 'oak', { flat: true }), layoutDecor(layoutTree(buildGraph(readFileSync(new URL('../samples/tiny-cli.uv.lock', import.meta.url), 'utf8')), 'oak', { flat: true })), { width: 40, height: 30 }), 1);
check('png signature', png[0] === 137 && png[1] === 80 && png[2] === 78 && png[3] === 71);
for (const bad of ['', '{"foo": 1}', 'hello = world']) { let threw = false; try { buildGraph(bad); } catch { threw = true; } check(`rejects ${JSON.stringify(bad)}`, threw); }
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
