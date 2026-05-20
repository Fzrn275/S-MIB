#!/usr/bin/env node
/*
 * Dev-only: fast syntax/JSX parse-check for source files, without booting Metro.
 * Catches typos and malformed JSX before the slower web-bundle verification.
 * Usage: node scripts/parsecheck.cjs <file...>
 */
const babel = require('@babel/core');

let bad = 0;
for (const f of process.argv.slice(2)) {
  try {
    babel.transformFileSync(f, {
      babelrc: false,
      configFile: false,
      plugins: ['@babel/plugin-syntax-jsx', '@babel/plugin-transform-modules-commonjs'],
    });
    console.log('OK  ' + f);
  } catch (e) {
    bad++;
    console.log('ERR ' + f + ' — ' + String(e.message).split('\n')[0]);
  }
}
process.exit(bad ? 1 : 0);
