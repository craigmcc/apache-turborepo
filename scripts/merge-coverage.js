const fg = require('fast-glob');
const fs = require('fs');
const path = require('path');
const { createCoverageMap } = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');

async function main() {
  const patterns = [
    'packages/**/coverage/coverage-final.json',
    'apps/**/coverage/coverage-final.json',
  ];

  // Ignore any coverage files that are coming from nested node_modules
  const files = await fg(patterns, { onlyFiles: true, ignore: ['**/node_modules/**'] });
  // Safety: also filter out any paths containing node_modules
  const filtered = files.filter((f) => !f.includes(`${path.sep}node_modules${path.sep}`));

  if (!filtered || filtered.length === 0) {
    console.log('No coverage files found to merge.');
    process.exit(0);
  }

  const map = createCoverageMap({});

  for (const file of filtered) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const json = JSON.parse(raw);
      map.merge(json);
      console.log('Merged', file);
    } catch (err) {
      console.error('Failed to read/merge', file, err);
    }
  }

  const outDir = path.resolve(process.cwd(), 'coverage');
  fs.mkdirSync(outDir, { recursive: true });

  const outJson = path.join(outDir, 'coverage-final.json');
  fs.writeFileSync(outJson, JSON.stringify(map), 'utf8');
  console.log('Wrote combined coverage JSON to', outJson);

  const context = libReport.createContext({ dir: outDir, coverageMap: map });

  // produce lcov and html reports
  const lcovReport = reports.create('lcovonly', {});
  const htmlReport = reports.create('html', {});

  lcovReport.execute(context);
  htmlReport.execute(context);

  console.log('Generated lcov and html reports in', outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
