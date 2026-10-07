// Renders the sample gallery used by the README into docs/.
import { execFileSync } from 'node:child_process';
const jobs = [
  ['samples/orchard.uv.lock', 'oak', 'docs/gallery-oak.png'], ['samples/orchard.uv.lock', 'pine', 'docs/gallery-pine.png'], ['samples/orchard.uv.lock', 'willow', 'docs/gallery-willow.png'],
  ['samples/orchard.uv.lock', 'sakura', 'docs/gallery-sakura.png'], ['samples/orchard.uv.lock', 'bonsai', 'docs/gallery-bonsai.png'],
];
for (const [lock, style, out] of jobs) process.stdout.write(execFileSync('node', ['bin/lockwood.js', '--lock', lock, '--style', style, '--out', out, '--width', '300', '--height', '225', '--scale', '2']));
