import * as readline from 'readline';
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Transpiler } from './transpiler';

/**
 * 华语代码语言 REPL（Read-Eval-Print-Loop）
 * 用户可以在命令行中交互式地编写和执行华语代码
 */
export class REPL {
  private tokenizer: Tokenizer;
  private parser: Parser;
  private transpiler: Transpiler;
  private rl: readline.Interface | null = null;
  private isRunning = false;

  constructor() {
    this.tokenizer = new Tokenizer('');
    this.parser = new Parser([]);
    this.transpiler = new Transpiler();
  }

  /**
   * 启动 REPL 交互式环境
   */
  start(): void {
    this.isRunning = true;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n欢迎使用华语代码语言 REPL!');
    console.log('输入 "帮助" 获取命令列表，或 "退出" 离开\n');

    this.prompt();
  }

  /**
   * 显示提示符并获取用户输入
   */
  private prompt(): void {
    if (!this.rl || !this.isRunning) return;

    this.rl.question('> ', (line: string) => {
      if (!this.isRunning) return;

      const input = line.trim();

      // 处理特殊命令
      if (this.handleCommand(input)) {
        this.prompt();
        return;
      }

      // 如果输入为空，继续提示
      if (!input) {
        this.prompt();
        return;
      }

      // 执行代码
      this.execute(input);
      this.prompt();
    });
  }

  /**
   * 处理特殊命令
   * @returns 如果是特殊命令返回 true，否则返回 false
   */
  private handleCommand(input: string): boolean {
    const cmd = input.toLowerCase();

    if (cmd === '退出' || cmd === 'exit' || cmd === ':q') {
      this.exit();
      return true;
    }

    if (cmd === '清空' || cmd === 'clear' || cmd === ':c') {
      console.clear();
      console.log('屏幕已清空\n');
      return true;
    }

    if (cmd === '帮助' || cmd === 'help' || cmd === ':h') {
      this.showHelp();
      return true;
    }

    return false;
  }

  /**
   * 执行华语代码
   */
  private execute(code: string): void {
    try {
      // 步骤 1：词法分析
      this.tokenizer = new Tokenizer(code);
      const tokens = this.tokenizer.tokenize();

      // 步骤 2：语法分析
      this.parser = new Parser(tokens);
      const ast = this.parser.parse();

      // 步骤 3：代码转译
      const jsCode = this.transpiler.transpile(ast);

      // 步骤 4：代码执行
      const result = this.evaluateCode(jsCode);

      // 显示结果
      if (result !== undefined && result !== null) {
        console.log(`=> ${this.formatResult(result)}\n`);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 评估并执行 JavaScript 代码
   */
  private evaluateCode(jsCode: string): unknown {
    const func = new Function('输出', jsCode);
    return func(console.log);
  }

  /**
   * 格式化输出结果
   */
  private formatResult(result: unknown): string {
    if (result === null) return 'null';
    if (result === undefined) return 'undefined';
    if (typeof result === 'string') return `"${result}"`;
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    }
    return String(result);
  }

  /**
   * 处理错误
   */
  private handleError(error: unknown): void {
    if (error instanceof Error) {
      console.error(`\n❌ 错误: ${error.message}\n`);
    } else {
      console.error(`\n❌ 未知错误: ${String(error)}\n`);
    }
  }

  /**
   * 显示帮助信息
   */
  private showHelp(): void {
    console.log(`
╔════════════════════════════════════════╗
║       华语代码语言 REPL - 命令帮助      ║
╚════════════════════════════════════════╝

📝 基本用法：
  直接输入华语代码即可执行，例如：
  > 令 x = 10
  > 返回 x + 5

🎮 特殊命令：
  帮助 (help, :h)       - 显示此帮助信息
  退出 (exit, :q)       - 退出 REPL
  清空 (clear, :c)      - 清空屏幕

📚 示例：
  > 42
  => 42

  > 10 + 5
  => 15

  > 如果 (真) { 返回 "条件成立" }
  => "条件成立"

`);
  }

  /**
   * 关闭 REPL
   */
  private exit(): void {
    this.isRunning = false;
    if (this.rl) {
      this.rl.close();
    }
    console.log('\n👋 再见！\n');
    process.exit(0);
  }

  /**
   * 执行代码并返回结果（用于测试）
   */
  executeSync(code: string): unknown {
    this.tokenizer = new Tokenizer(code);
    const tokens = this.tokenizer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const jsCode = this.transpiler.transpile(ast);
    return this.evaluateCode(jsCode);
  }
}

/**
 * 启动 REPL 的快捷函数
 */
export function startREPL(): void {
  const repl = new REPL();
  repl.start();
}
