#!/usr/bin/env node
// Copy the tsconfig JSON and CJS files to node_modules/@repo/typescript-config
// so that tsc (and Next.js's internal TS resolver) can resolve `extends` package
// subpaths like "@repo/typescript-config/nextjs.json" or "@repo/typescript-config/nextjs".

import fs from 'fs';
import path from 'path';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const srcPkg = path.join(repoRoot, 'packages', 'typescript-config');
const destPkg = path.join(repoRoot, 'node_modules', '@repo', 'typescript-config');

ensureDir(destPkg);

const files = ['base.json', 'nextjs.json', 'node.json', 'react-library.json', 'package.json'];
for (const f of files) {
  const src = path.join(srcPkg, f);
  const dest = path.join(destPkg, f);
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      // eslint-disable-next-line no-console
      console.log(`Copied ${f} -> ${dest}`);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Failed to copy ${f}:`, e.message || e);
    process.exitCode = 1;
  }
}

// Remove any previously-copied .cjs wrapper to avoid tools treating it as JSON
try {
  const strayCjs = path.join(destPkg, 'nextjs.cjs');
  if (fs.existsSync(strayCjs)) {
    fs.unlinkSync(strayCjs);
    // eslint-disable-next-line no-console
    console.log('Removed stray nextjs.cjs from node_modules');
  }
} catch (e) {
  // ignore
}

// Also write/overwrite package.json in the dest to ensure resolution
try {
  const srcPkgJson = path.join(srcPkg, 'package.json');
  const destPkgJson = path.join(destPkg, 'package.json');
  if (fs.existsSync(srcPkgJson)) {
    fs.copyFileSync(srcPkgJson, destPkgJson);
    // eslint-disable-next-line no-console
    console.log('Copied package.json to node_modules entry');
  }
} catch (e) {
  // ignore
}
