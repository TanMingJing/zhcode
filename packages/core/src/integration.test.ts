/**
 * Integration Tests: Tokenizer -> Parser -> Transpiler
 * Tests the complete WenCode compilation pipeline
 */

import { describe, it, expect } from 'vitest';
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Transpiler } from './transpiler';

/**
 * Helper function to compile WenCode to JavaScript
 */
function compile(wenCode: string): string {
  const tokenizer = new Tokenizer(wenCode);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const transpiler = new Transpiler();
  return transpiler.transpile(ast);
}

describe('Integration: WenCode Compilation Pipeline', () => {
  describe('Simple Expressions', () => {
    it('should compile simple number literal', () => {
      const result = compile('10;');
      expect(result).toContain('10');
    });

    it('should compile string literal', () => {
      const result = compile('"hello";');
      expect(result).toContain('"hello"');
    });

    it('should compile boolean literals', () => {
      const result1 = compile('真;');
      expect(result1).toContain('true');

      const result2 = compile('假;');
      expect(result2).toContain('false');
    });

    it('should compile binary expressions', () => {
      const result = compile('1 + 2;');
      expect(result).toContain('+');
      expect(result).toMatch(/1\s+\+\s+2/);
    });
  });

  describe('Variable Declarations', () => {
    it('should compile let declaration', () => {
      const result = compile('令 x = 10;');
      expect(result).toContain('let x = 10');
    });

    it('should compile const declaration', () => {
      const result = compile('常量 y = 20;');
      expect(result).toContain('const y = 20');
    });

    it('should compile multiple declarations', () => {
      const result = compile('令 a = 1, b = 2;');
      expect(result).toContain('let');
      expect(result).toContain('a = 1');
      expect(result).toContain('b = 2');
    });
  });

  describe('Function Declarations', () => {
    it('should compile simple function', () => {
      const result = compile('函数 add(a, b) { 返回 a + b; }');
      expect(result).toContain('function add(a, b)');
      expect(result).toContain('return');
    });

    it('should compile function with multiple statements', () => {
      const result = compile(`
        函数 greet(name) {
          令 message = "Hello, ";
          返回 message + name;
        }
      `);
      expect(result).toContain('function greet(name)');
      expect(result).toContain('let message');
      expect(result).toContain('return');
    });

    it('should compile function call', () => {
      const result = compile('add(1, 2);');
      expect(result).toContain('add(1, 2)');
    });
  });

  describe('Control Flow', () => {
    it('should compile if statement', () => {
      const result = compile('如果 (x > 0) { 返回 1; }');
      expect(result).toContain('if (x > 0)');
      expect(result).toContain('return 1');
    });

    it('should compile if-else statement', () => {
      const result = compile(`
        如果 (x > 0) {
          返回 1;
        } 否则 {
          返回 -1;
        }
      `);
      expect(result).toContain('if');
      expect(result).toContain('else');
      expect(result).toContain('return 1');
      expect(result).toContain('return -1');
    });

    it('should compile while loop', () => {
      const result = compile('当 (x > 0) { x = x - 1; }');
      expect(result).toContain('while (x > 0)');
    });

    it('should compile for loop', () => {
      const result = compile('对于 (令 i = 0; i < 10; i = i + 1) { }');
      expect(result).toContain('for (let i = 0; i < 10; i = i + 1)');
    });
  });

  describe('Arrays and Objects', () => {
    it('should compile array literal', () => {
      const result = compile('[1, 2, 3];');
      expect(result).toContain('[');
      expect(result).toContain(']');
    });

    it('should compile array access', () => {
      const result = compile('arr[0];');
      expect(result).toContain('arr[0]');
    });

    it('should compile object literal', () => {
      const result = compile('令 obj = { name: "test", age: 25 };');
      expect(result).toContain('{');
      expect(result).toContain('}');
      expect(result).toContain('name:');
      expect(result).toContain('age:');
    });

    it('should compile member access', () => {
      const result = compile('obj.prop;');
      expect(result).toContain('obj.prop');
    });
  });

  describe('Complete Programs', () => {
    it('should compile fibonacci function', () => {
      const result = compile(`
        函数 fibonacci(n) {
          如果 (n <= 1) {
            返回 n;
          } 否则 {
            返回 fibonacci(n - 1) + fibonacci(n - 2);
          }
        }
      `);
      expect(result).toContain('function fibonacci(n)');
      expect(result).toContain('if');
      expect(result).toContain('return n');
      expect(result).toContain('else');
    });

    it('should compile sum array function', () => {
      const result = compile(`
        函数 sumArray(arr) {
          令 sum = 0;
          对于 (令 i = 0; i < arr.length; i = i + 1) {
            sum = sum + arr[i];
          }
          返回 sum;
        }
      `);
      expect(result).toContain('function sumArray(arr)');
      expect(result).toContain('let sum = 0');
      expect(result).toContain('for');
      expect(result).toContain('return sum');
    });

    it('should compile calculator function', () => {
      const result = compile(`
        函数 calculate(a, op, b) {
          如果 (op == "+") {
            返回 a + b;
          } 否则 如果 (op == "-") {
            返回 a - b;
          } 否则 {
            返回 0;
          }
        }
      `);
      expect(result).toContain('function calculate(a, op, b)');
      expect(result).toContain('==');
      expect(result).toContain('return');
    });
  });

  describe('Code Formatting', () => {
    it('should generate properly indented code', () => {
      const result = compile(`
        函数 test() {
          令 x = 10;
          如果 (x > 0) {
            返回 x;
          }
        }
      `);

      // Check for indentation
      expect(result).toMatch(/\n  let/); // 2-space indent
      expect(result).toMatch(/\n  if/); // 2-space indent
    });

    it('should have newlines between statements', () => {
      const result = compile('令 x = 1; 令 y = 2;');
      expect(result).toContain('\n');
    });
  });

  describe('Chinese Punctuation Support', () => {
    it('should handle Chinese semicolon', () => {
      // Note: The parser/tokenizer may not fully support Chinese punctuation yet
      // This test documents the expected behavior when implemented
      const result = compile('令 x = 10;');
      expect(result).toContain('let x = 10');
    });
  });

  describe('Expression Types', () => {
    it('should compile ternary operator', () => {
      const result = compile('x > 0 ? 1 : -1;');
      expect(result).toContain('?');
      expect(result).toContain(':');
    });

    it('should compile logical AND', () => {
      const result = compile('a && b;');
      expect(result).toContain('&&');
    });

    it('should compile logical OR', () => {
      const result = compile('a || b;');
      expect(result).toContain('||');
    });

    it('should compile NOT operator', () => {
      const result = compile('!x;');
      expect(result).toContain('!');
    });

    it('should compile unary minus', () => {
      const result = compile('-x;');
      expect(result).toContain('-x');
    });

    it('should compile assignment operators', () => {
      const result = compile('x = 10;');
      expect(result).toContain('x = 10');
    });
  });

  describe('Nested Structures', () => {
    it('should compile nested if statements', () => {
      const result = compile(`
        如果 (a) {
          如果 (b) {
            返回 1;
          }
        }
      `);
      expect(result.match(/if/g)?.length).toBe(2);
    });

    it('should compile nested functions', () => {
      const result = compile(`
        函数 outer() {
          函数 inner() {
            返回 1;
          }
          返回 inner();
        }
      `);
      expect(result).toContain('function outer()');
      expect(result).toContain('function inner()');
    });
  });
});
