import { describe, it, expect } from 'vitest';
import { tokenize } from './tokenizer';
import { TokenType } from './token';

describe('Tokenizer', () => {
  describe('Basic tokens', () => {
    it('should tokenize numbers', () => {
      const tokens = tokenize('123 456.78');
      expect(tokens[0].type).toBe(TokenType.NUMBER);
      expect(tokens[0].value).toBe('123');
      expect(tokens[1].type).toBe(TokenType.NUMBER);
      expect(tokens[1].value).toBe('456.78');
    });

    it('should tokenize strings', () => {
      const tokens = tokenize('"hello world"');
      expect(tokens[0].type).toBe(TokenType.STRING);
      expect(tokens[0].value).toBe('hello world');
    });

    it('should tokenize identifiers', () => {
      const tokens = tokenize('变量名 identifier _private');
      expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('变量名');
      expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1].value).toBe('identifier');
    });
  });

  describe('Chinese keywords', () => {
    it('should recognize function keyword', () => {
      const tokens = tokenize('函数 名字() {}');
      expect(tokens[0].type).toBe(TokenType.FUNCTION);
      expect(tokens[0].value).toBe('函数');
    });

    it('should recognize variable keywords', () => {
      const tokens = tokenize('令 x = 10; 常量 y = 20;');
      expect(tokens[0].type).toBe(TokenType.LET);
      expect(tokens[3].type).toBe(TokenType.NUMBER);
      expect(tokens[5].type).toBe(TokenType.CONST);
    });

    it('should recognize control flow keywords', () => {
      const tokens = tokenize('如果 (条件) { } 否则 { }');
      expect(tokens[0].type).toBe(TokenType.IF);
      // tokens: [IF, LPAREN, IDENTIFIER(条件), RPAREN, LBRACE, RBRACE, ELSE, ...]
      expect(tokens[6].type).toBe(TokenType.ELSE);
    });

    it('should recognize loop keywords', () => {
      const tokens = tokenize('对于 (令 i = 0) { } 当 (真) { }');
      expect(tokens[0].type).toBe(TokenType.FOR);
      expect(tokens[9].type).toBe(TokenType.WHILE);
      expect(tokens[10].type).toBe(TokenType.LPAREN);
      expect(tokens[11].type).toBe(TokenType.TRUE);
    });
  });

  describe('Operators', () => {
    it('should tokenize arithmetic operators', () => {
      const tokens = tokenize('a + b - c * d / e % f ** g');
      expect(tokens[1].type).toBe(TokenType.PLUS);
      expect(tokens[3].type).toBe(TokenType.MINUS);
      expect(tokens[5].type).toBe(TokenType.MULTIPLY);
      expect(tokens[7].type).toBe(TokenType.DIVIDE);
      expect(tokens[9].type).toBe(TokenType.MODULO);
      expect(tokens[11].type).toBe(TokenType.POWER);
    });

    it('should tokenize comparison operators', () => {
      const tokens = tokenize('a == b != c < d > e <= f >= g === h !== i');
      expect(tokens[1].type).toBe(TokenType.EQUALS);
      expect(tokens[3].type).toBe(TokenType.NOT_EQUALS);
      expect(tokens[5].type).toBe(TokenType.LESS_THAN);
      expect(tokens[7].type).toBe(TokenType.GREATER_THAN);
      expect(tokens[9].type).toBe(TokenType.LESS_EQUAL);
      expect(tokens[11].type).toBe(TokenType.GREATER_EQUAL);
    });

    it('should tokenize logical operators', () => {
      const tokens = tokenize('a && b || c ! d');
      expect(tokens[1].type).toBe(TokenType.LOGICAL_AND);
      expect(tokens[3].type).toBe(TokenType.LOGICAL_OR);
      expect(tokens[5].type).toBe(TokenType.LOGICAL_NOT);
    });

    it('should tokenize assignment operators', () => {
      const tokens = tokenize('a = b += c -= d');
      expect(tokens[1].type).toBe(TokenType.ASSIGN);
      expect(tokens[3].type).toBe(TokenType.PLUS_ASSIGN);
      expect(tokens[5].type).toBe(TokenType.MINUS_ASSIGN);
    });

    it('should tokenize arrow function', () => {
      const tokens = tokenize('x => x * 2');
      expect(tokens[1].type).toBe(TokenType.ARROW);
    });
  });

  describe('Punctuation', () => {
    it('should tokenize parentheses and braces', () => {
      const tokens = tokenize('( ) { } [ ]');
      expect(tokens[0].type).toBe(TokenType.LPAREN);
      expect(tokens[1].type).toBe(TokenType.RPAREN);
      expect(tokens[2].type).toBe(TokenType.LBRACE);
      expect(tokens[3].type).toBe(TokenType.RBRACE);
      expect(tokens[4].type).toBe(TokenType.LBRACKET);
      expect(tokens[5].type).toBe(TokenType.RBRACKET);
    });

    it('should tokenize separators', () => {
      const tokens = tokenize('a, b; c . d');
      expect(tokens[1].type).toBe(TokenType.COMMA);
      expect(tokens[3].type).toBe(TokenType.SEMICOLON);
      expect(tokens[5].type).toBe(TokenType.DOT);
    });

    it('should tokenize spread operator', () => {
      const tokens = tokenize('[...array]');
      expect(tokens[1].type).toBe(TokenType.SPREAD);
    });
  });

  describe('Comments', () => {
    it('should skip line comments', () => {
      const tokens = tokenize('a // comment\nb');
      expect(tokens.length).toBe(3); // a, b, EOF
      expect(tokens[0].value).toBe('a');
      expect(tokens[1].value).toBe('b');
    });

    it('should skip block comments', () => {
      const tokens = tokenize('a /* comment */ b');
      expect(tokens.length).toBe(3); // a, b, EOF
      expect(tokens[0].value).toBe('a');
      expect(tokens[1].value).toBe('b');
    });
  });

  describe('Position tracking', () => {
    it('should track line and column numbers', () => {
      const tokens = tokenize('a b\nc');
      expect(tokens[0].line).toBe(1);
      expect(tokens[0].column).toBe(1);
      expect(tokens[2].line).toBe(2);
      expect(tokens[2].column).toBe(1);
    });
  });

  describe('Complex expressions', () => {
    it('should tokenize function declaration', () => {
      const tokens = tokenize('函数 加法(a, b) { 返回 a + b; }');
      const tokenTypes = tokens.map(t => t.type);
      expect(tokenTypes).toContain(TokenType.FUNCTION);
      expect(tokenTypes).toContain(TokenType.RETURN);
      expect(tokenTypes).toContain(TokenType.PLUS);
    });

    it('should tokenize variable declaration', () => {
      const tokens = tokenize('令 x = 10;');
      expect(tokens[0].type).toBe(TokenType.LET);
      expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[2].type).toBe(TokenType.ASSIGN);
      expect(tokens[3].type).toBe(TokenType.NUMBER);
      expect(tokens[4].type).toBe(TokenType.SEMICOLON);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input', () => {
      const tokens = tokenize('');
      expect(tokens.length).toBe(1); // EOF only
      expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it('should handle whitespace-only input', () => {
      const tokens = tokenize('   \n   ');
      expect(tokens.length).toBe(1); // EOF only
    });

    it('should tokenize scientific notation', () => {
      const tokens = tokenize('1.23e5 1.23E-5');
      expect(tokens[0].type).toBe(TokenType.NUMBER);
      expect(tokens[0].value).toBe('1.23e5');
      expect(tokens[1].type).toBe(TokenType.NUMBER);
      expect(tokens[1].value).toBe('1.23E-5');
    });

    it('should tokenize hexadecimal numbers', () => {
      const tokens = tokenize('0xFF 0x123');
      expect(tokens[0].type).toBe(TokenType.NUMBER);
      expect(tokens[0].value).toBe('0xFF');
    });
  });
});
