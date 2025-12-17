#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { Tokenizer } from '../tokenizer.js';
import { Parser } from '../parser.js';
import { Transpiler } from '../transpiler.js';
import { startREPL } from '../repl.js';

const args = process.argv.slice(2);
const version = '0.1.0';

/**
 * Display help information
 */
function showHelp(): void {
  console.log(`
ZhCode - A Chinese Programming Language

Usage:
  zhcode [command] [options]

Commands:
  repl              Start interactive REPL (default)
  run <file>        Execute a .zhc file
  compile <file>    Compile to JavaScript (output to stdout)
  help              Show this help message
  version           Show version

Examples:
  zhcode repl
  zhcode run program.zhc
  zhcode compile program.zhc > program.js
  `);
}

/**
 * Display version information
 */
function showVersion(): void {
  console.log(`zhcode v${version}`);
}

/**
 * Execute a .zhc file
 */
function runFile(filePath: string): void {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    const code = fs.readFileSync(filePath, 'utf-8');

    try {
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();

      const parser = new Parser(tokens);
      const ast = parser.parse();

      const transpiler = new Transpiler();
      const jsCode = transpiler.transpile(ast);

      // Execute the generated JavaScript with global functions
      const func = new Function('输出', jsCode);
      const result = func(console.log);

      if (result !== undefined) {
        console.log(result);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Execution error: ${error.message}`);
      } else {
        console.error(`Execution error: ${error}`);
      }
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error reading file: ${error.message}`);
    } else {
      console.error(`Error reading file: ${error}`);
    }
    process.exit(1);
  }
}

/**
 * Compile a .zhc file to JavaScript
 */
function compileFile(filePath: string): void {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    const code = fs.readFileSync(filePath, 'utf-8');

    try {
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();

      const parser = new Parser(tokens);
      const ast = parser.parse();

      const transpiler = new Transpiler();
      const jsCode = transpiler.transpile(ast);

      console.log(jsCode);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Compilation error: ${error.message}`);
      } else {
        console.error(`Compilation error: ${error}`);
      }
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error reading file: ${error.message}`);
    } else {
      console.error(`Error reading file: ${error}`);
    }
    process.exit(1);
  }
}

/**
 * Main command router
 */
function main(): void {
  // Main command router
  if (args.length === 0 || args[0] === 'repl') {
    startREPL();
  } else if (args[0] === 'run') {
    if (!args[1]) {
      console.error('Error: Missing file path');
      console.error('Usage: zhcode run <file>');
      process.exit(1);
    }
    runFile(args[1]);
  } else if (args[0] === 'compile') {
    if (!args[1]) {
      console.error('Error: Missing file path');
      console.error('Usage: zhcode compile <file>');
      process.exit(1);
    }
    compileFile(args[1]);
  } else if (args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    showHelp();
  } else if (args[0] === 'version' || args[0] === '--version' || args[0] === '-v') {
    showVersion();
  } else {
    console.error(`Error: Unknown command '${args[0]}'`);
    console.error('Run "zhcode help" for usage information');
    process.exit(1);
  }
}

// Only run main if this is the entry point
if (require.main === module) {
  main();
}

export { main, showHelp, showVersion, runFile, compileFile };
