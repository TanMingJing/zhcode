#!/usr/bin/env node

/**
 * Wencode CLI Wrapper
 * Forwards commands to the compiled CLI in packages/core
 */

const path = require('path');
const { execSync } = require('child_process');

const cliPath = path.join(__dirname, 'packages', 'core', 'dist', 'bin', 'wencode.js');
const args = process.argv.slice(2);

try {
  execSync(`node "${cliPath}" ${args.map(arg => `"${arg}"`).join(' ')}`, {
    stdio: 'inherit',
    cwd: process.cwd()
  });
} catch (error) {
  process.exit(error.status || 1);
}
