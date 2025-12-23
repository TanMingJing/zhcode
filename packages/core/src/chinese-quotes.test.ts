/**
 * Tests for Chinese quotes support
 */

import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Transpiler } from './transpiler';
import { TokenType } from './token';

describe('Chinese Quotes Support', () => {
  describe('Tokenizer - Chinese Quotes', () => {
    it('should recognize left double quote (U+201C)', () => {
      const tokenizer = new Tokenizer('"你好"');
      const tokens = tokenizer.tokenize();
      
      // Should have STRING token with content "你好"
      const stringToken = tokens.find(t => t.type === TokenType.STRING);
      expect(stringToken).toBeDefined();
      expect(stringToken?.value).toBe('你好');
    });

    it('should recognize left single quote (U+2018)', () => {
      const tokenizer = new Tokenizer(''hello'');
      const tokens = tokenizer.tokenize();
      
      const stringToken = tokens.find(t => t.type === TokenType.STRING);
      expect(stringToken).toBeDefined();
      expect(stringToken?.value).toBe('hello');
    });

    it('should handle mixed English and Chinese quotes', () => {
      const code = `"English" 和 "Chinese"`;
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();
      
      const stringTokens = tokens.filter(t => t.type === TokenType.STRING);
      expect(stringTokens.length).toBe(2);
      expect(stringTokens[0].value).toBe('English');
      expect(stringTokens[1].value).toBe('Chinese');
    });

    it('should handle Chinese text inside Chinese quotes', () => {
      const tokenizer = new Tokenizer('"打印消息"');
      const tokens = tokenizer.tokenize();
      
      const stringToken = tokens.find(t => t.type === TokenType.STRING);
      expect(stringToken?.value).toBe('打印消息');
    });

    it('should preserve escaped quotes', () => {
      const tokenizer = new Tokenizer('"say \\"hello\\""');
      const tokens = tokenizer.tokenize();
      
      const stringToken = tokens.find(t => t.type === TokenType.STRING);
      expect(stringToken?.value).toContain('hello');
    });
  });

  describe('Parser - Chinese Quotes in String Literals', () => {
    it('should parse string literal with Chinese quotes', () => {
      const code = '令 x = "你好"';
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      expect(ast).toBeDefined();
      expect(ast.type).toBe('Program');
      expect(ast.body.length).toBeGreaterThan(0);
    });

    it('should parse function with Chinese quoted string', () => {
      const code = `函数 greet() {
        打印("你好")
      }`;
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      
      expect(ast).toBeDefined();
      expect(ast.body.length).toBeGreaterThan(0);
    });
  });

  describe('Transpiler - Chinese Quotes to JavaScript', () => {
    it('should transpile Chinese quotes to JavaScript quotes', () => {
      const code = '打印("你好")';
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const transpiler = new Transpiler();
      const output = transpiler.transpile(ast);
      
      expect(output).toContain('你好');
      expect(output).toContain('console.log');
    });

    it('should handle multiple Chinese quoted strings', () => {
      const code = `令 a = "第一个"
令 b = "第二个"`;
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const transpiler = new Transpiler();
      const output = transpiler.transpile(ast);
      
      expect(output).toContain('第一个');
      expect(output).toContain('第二个');
      expect(output).toContain('let');
      expect(output).toContain('const');
    });

    it('should transpile correctly with single Chinese quotes', () => {
      const code = "打印('中文文本')";
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const transpiler = new Transpiler();
      const output = transpiler.transpile(ast);
      
      expect(output).toContain('中文文本');
    });
  });

  describe('Integration - End to End', () => {
    it('should handle complete program with Chinese quotes', () => {
      const code = `函数 sayHello(name) {
        打印("你好，" + name)
      }
      
      sayHello("世界")`;
      
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const transpiler = new Transpiler();
      const output = transpiler.transpile(ast);
      
      expect(output).toBeDefined();
      expect(output).toContain('你好');
      expect(output).toContain('世界');
      expect(output).toContain('function');
      expect(output).toContain('sayHello');
    });

    it('should handle mixed quote styles in same program', () => {
      const code = `令 english = "Hello"
令 chinese = "你好"
令 single = 'World'`;
      
      const tokenizer = new Tokenizer(code);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const transpiler = new Transpiler();
      const output = transpiler.transpile(ast);
      
      expect(output).toContain('Hello');
      expect(output).toContain('你好');
      expect(output).toContain('World');
    });
  });
});
