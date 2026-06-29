/**
 * Build script for sriflow browse daemon
 *
 * Compiles server.ts into a single Bun binary.
 */

import { $ } from 'bun';

const SRC_DIR = import.meta.dir + '/src';
const DIST_DIR = import.meta.dir + '/dist';

// Ensure dist directory exists
await $`mkdir -p ${DIST_DIR}`;

// Build the server binary
console.log('Building sriflow browse daemon...');

await Bun.build({
  entrypoints: [`${SRC_DIR}/server.ts`],
  outdir: DIST_DIR,
  target: 'bun',
  splitting: false,
  minify: false,
  sourcemap: 'external',
  external: ['playwright', 'playwright-core', 'diff'],
});

console.log(`Build complete: ${DIST_DIR}/server.js`);
