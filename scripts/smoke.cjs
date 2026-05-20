#!/usr/bin/env node
/*
 * Dev-only headless test runner for the in-app smoke-test suites.
 *
 * Why this exists: the app source uses extensionless ESM imports (e.g.
 * `from './Student'`) plus an internal CommonJS `require()` in User.fromRow.
 * Node's native ESM loader can't resolve extensionless specifiers, so we
 * transpile our own source (not node_modules) ESM -> CJS on require. Under
 * CommonJS, extensionless `require()` resolves fine and the model layer runs
 * in plain Node — no Metro/web boot needed for the pure-logic suites.
 *
 * Usage: node scripts/smoke.cjs [model|auth|all]   (default: all)
 * Exit code 0 = all green, 1 = any failure.
 */
const fs = require('fs');
const path = require('path');
const Module = require('module');
const babel = require('@babel/core');

const root = path.resolve(__dirname, '..');
const NM = path.sep + 'node_modules' + path.sep;

const origCompile = Module._extensions['.js'];
Module._extensions['.js'] = function (module, filename) {
  if (filename.includes(NM)) return origCompile(module, filename);
  const src = fs.readFileSync(filename, 'utf8');
  const out = babel.transformSync(src, {
    filename,
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  module._compile(out.code, filename);
};

const which = process.argv[2] || 'all';
const suites = [];
if (which === 'model' || which === 'all') {
  suites.push(['OOP model', () => require(path.join(root, 'src/models/__smoketest.js')).runModelSmokeTest()]);
}
if (which === 'auth' || which === 'all') {
  suites.push(['Auth', () => require(path.join(root, 'src/auth/__regtest.js')).runAuthSmokeTest()]);
}

let allOk = true;
for (const [label, run] of suites) {
  let rep;
  try {
    rep = run();
  } catch (err) {
    console.log(`✗ ${label}: suite failed to load — ${err.message}`);
    allOk = false;
    continue;
  }
  const pass = rep.results.filter((r) => r.ok).length;
  const total = rep.results.length;
  console.log(`${rep.ok ? '✓' : '✗'} ${label}: ${pass}/${total} passing`);
  for (const f of rep.results.filter((r) => !r.ok)) {
    console.log(`   • ${f.name} — ${f.error}`);
  }
  allOk = allOk && rep.ok;
}
process.exit(allOk ? 0 : 1);
