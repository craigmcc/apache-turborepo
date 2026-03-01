// CommonJS bridge so tools that import the package subpath can get the
// JSON tsconfig when requiring the package in CommonJS contexts.
// This file is intentionally a small wrapper that delegates to the JSON file.
module.exports = require('./nextjs.json');
