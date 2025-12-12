#!/usr/bin/env node

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { startREPL, Tokenizer, Parser, Transpiler } from '@wencode/core';

/**
 * WenCode CLI - 华语代码语言命令行工具
 */

const version = '0.1.0';

function showVersion(): void {
  console.log(`WenCode CLI v${version}`);
}

function showHelp(): void {
  console.log(`
╔════════════════════════════════════════════════╗
║         WenCode - 华语代码语言 CLI 工具        ║
╚════════════════════════════════════════════════╝

用法：
  wencode [命令] [选项]

命令：
  repl              启动交互式 REPL（默认）
  run <file>        运行 .wen 文件
  compile <file>    编译 .wen 文件为 JavaScript
  version, -v       显示版本号
  help, -h          显示帮助信息

示例：
  wencode                 # 启动 REPL
  wencode run program.wen # 运行程序
  wencode compile app.wen # 编译程序

`);
}

function runFile(filePath: string): void {
  try {
    const fullPath = resolve(filePath);
    const code = readFileSync(fullPath, 'utf-8');

    // 编译和执行
    const tokenizer = new Tokenizer(code);
    const tokens = tokenizer.tokenize();

    const parser = new Parser();
    const ast = parser.parse(tokens);

    const transpiler = new Transpiler();
    const jsCode = transpiler.transpile(ast);

    // 执行 JavaScript 代码
    eval(jsCode);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ 错误: ${error.message}`);
    } else {
      console.error(`❌ 未知错误: ${String(error)}`);
    }
    process.exit(1);
  }
}

function compileFile(filePath: string): void {
  try {
    const fullPath = resolve(filePath);
    const code = readFileSync(fullPath, 'utf-8');

    // 编译
    const tokenizer = new Tokenizer(code);
    const tokens = tokenizer.tokenize();

    const parser = new Parser();
    const ast = parser.parse(tokens);

    const transpiler = new Transpiler();
    const jsCode = transpiler.transpile(ast);

    // 输出编译结果
    console.log(jsCode);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ 编译错误: ${error.message}`);
    } else {
      console.error(`❌ 未知错误: ${String(error)}`);
    }
    process.exit(1);
  }
}

function main(): void {
  const args = process.argv.slice(2);

  // 没有参数或 repl 命令 -> 启动 REPL
  if (args.length === 0 || args[0] === 'repl') {
    startREPL();
    return;
  }

  // 处理各种命令
  const command = args[0];

  switch (command) {
    case 'run':
      if (args.length < 2) {
        console.error('❌ 错误: run 命令需要指定文件路径');
        console.error('用法: wencode run <file>');
        process.exit(1);
      }
      runFile(args[1]);
      break;

    case 'compile':
      if (args.length < 2) {
        console.error('❌ 错误: compile 命令需要指定文件路径');
        console.error('用法: wencode compile <file>');
        process.exit(1);
      }
      compileFile(args[1]);
      break;

    case 'version':
    case '-v':
    case '--version':
      showVersion();
      break;

    case 'help':
    case '-h':
    case '--help':
      showHelp();
      break;

    default:
      console.error(`❌ 未知命令: ${command}`);
      console.error('使用 "wencode help" 获取帮助信息');
      process.exit(1);
  }
}

// 执行主程序
main();
