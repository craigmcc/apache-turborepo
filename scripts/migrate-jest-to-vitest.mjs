import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
const scanDirs = ['packages', 'apps'];
const skip = new Set(['vitest-config', 'qbo-api', 'shared-utils', 'jest-presets']);

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function updatePackageJson(pkgPath) {
  const raw = await fs.readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(raw);
  const name = pkg.name || path.basename(path.dirname(pkgPath));

  const hasJest = (
    (pkg.devDependencies && (pkg.devDependencies.jest || pkg.devDependencies['@repo/jest-presets'])) ||
    (pkg.jest) ||
    (pkg.scripts && Object.values(pkg.scripts).some(s => typeof s === 'string' && s.includes('jest')))
  );
  if (!hasJest) return false;

  // remove known jest packages from devDependencies
  const dev = pkg.devDependencies || {};
  const removeKeys = ['jest','ts-jest','@types/jest','jest-environment-jsdom','@repo/jest-presets','jest-cli'];
  for (const k of removeKeys) delete dev[k];

  // add vitest deps
  dev['@repo/vitest-config'] = 'workspace:*';
  dev['vitest'] = 'catalog:vitest';
  pkg.devDependencies = dev;

  // remove top-level jest config
  if (pkg.jest) delete pkg.jest;

  // update scripts
  pkg.scripts = pkg.scripts || {};
  const existingTest = pkg.scripts.test || '';
  if (existingTest.includes('jest')) {
    pkg.scripts.test = 'vitest';
  } else if (!pkg.scripts.test) {
    // leave absent test script alone (some packages may not have tests)
  }
  // ci script
  pkg.scripts['test:ci'] = 'vitest --run';

  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`Updated ${name} -> use vitest`);
  return true;
}

async function addVitestConfig(pkgDir) {
  const cfgPath = path.join(pkgDir, 'vitest.config.ts');
  if (await fileExists(cfgPath)) return false;
  const content = `import base from '@repo/vitest-config';\nimport { defineConfig } from 'vitest/config';\n\nexport default defineConfig({\n  ...base,\n  test: {\n    ...base.test,\n    include: ['src/**/*.test.{ts,tsx}'],\n  },\n});\n`;
  await fs.writeFile(cfgPath, content, 'utf8');
  console.log(`Created vitest.config.ts in ${pkgDir}`);
  return true;
}

async function run() {
  for (const d of scanDirs) {
    const dir = path.join(root, d);
    let children = [];
    try { children = await fs.readdir(dir); } catch { continue; }
    for (const name of children) {
      if (skip.has(name)) continue;
      const pkgDir = path.join(dir, name);
      const pkgPath = path.join(pkgDir, 'package.json');
      if (!(await fileExists(pkgPath))) continue;
      try {
        const changed = await updatePackageJson(pkgPath);
        if (changed) {
          await addVitestConfig(pkgDir);
        }
      } catch (err) {
        console.error(`Error processing ${pkgPath}:`, err);
      }
    }
  }
  console.log('Migration script finished. Run `pnpm install` then `pnpm test:ci` to validate.');
}

run().catch(err => { console.error(err); process.exit(1); });

