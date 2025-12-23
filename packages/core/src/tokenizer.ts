/**
 * Tokenizer / Lexer for ZhCode Language
 * Converts source code into a stream of tokens
 */

import { Token, TokenType } from './token';
import { isKeyword, getKeywordType } from './keywords';

export interface TokenizerOptions {
  includeWhitespace?: boolean;
  includeNewlines?: boolean;
  trackSourceMap?: boolean;
}

export class Tokenizer {
  private source: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];
  private options: TokenizerOptions;

  constructor(source: string, options: TokenizerOptions = {}) {
    this.source = source;
    this.options = {
      includeWhitespace: false,
      includeNewlines: false,
      trackSourceMap: true,
      ...options,
    };
  }

  /**
   * Tokenize the entire source code
   */
  tokenize(): Token[] {
    while (this.position < this.source.length) {
      this.skipWhitespace();

      if (this.position >= this.source.length) {
        break;
      }

      const char = this.peek();

      // Comments
      if (char === '/' && this.peekAhead() === '/') {
        this.skipLineComment();
        continue;
      }

      if (char === '/' && this.peekAhead() === '*') {
        this.skipBlockComment();
        continue;
      }

      // Strings (including Chinese quotes)
      // Chinese quotes: \u201c = "  \u201d = "  \u2018 = '  \u2019 = '
      if (char === '"' || char === "'" || char === '`' || 
          char === '\u201c' || char === '\u201d' || 
          char === '\u2018' || char === '\u2019') {
        this.tokens.push(this.readString());
        continue;
      }

      // Numbers
      if (this.isDigit(char)) {
        this.tokens.push(this.readNumber());
        continue;
      }

      // Identifiers and Keywords
      if (this.isIdentifierStart(char)) {
        this.tokens.push(this.readIdentifierOrKeyword());
        continue;
      }

      // Operators and Punctuation
      const operatorToken = this.readOperatorOrPunctuation();
      if (operatorToken) {
        this.tokens.push(operatorToken);
        continue;
      }

      // Unknown character
      this.tokens.push(
        new Token(
          TokenType.ERROR,
          char,
          this.line,
          this.column,
          this.position,
          this.position + 1
        )
      );
      this.advance();
    }

    // Add EOF token
    this.tokens.push(
      new Token(TokenType.EOF, '', this.line, this.column, this.position, this.position)
    );

    return this.tokens;
  }

  /**
   * Get current character without advancing
   */
  private peek(): string {
    if (this.position >= this.source.length) {
      return '\0';
    }
    return this.source[this.position];
  }

  /**
   * Get next character without advancing
   */
  private peekAhead(offset: number = 1): string {
    const pos = this.position + offset;
    if (pos >= this.source.length) {
      return '\0';
    }
    return this.source[pos];
  }

  /**
   * Advance to next character
   */
  private advance(): string {
    const char = this.peek();
    this.position++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  /**
   * Skip whitespace characters
   */
  private skipWhitespace(): void {
    while (this.position < this.source.length && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  /**
   * Skip single-line comment
   */
  private skipLineComment(): void {
    // Skip //
    this.advance();
    this.advance();

    while (this.peek() !== '\n' && this.position < this.source.length) {
      this.advance();
    }
  }

  /**
   * Skip multi-line comment
   */
  private skipBlockComment(): void {
    // Skip /*
    this.advance();
    this.advance();

    while (this.position < this.source.length) {
      if (this.peek() === '*' && this.peekAhead() === '/') {
        this.advance();
        this.advance();
        break;
      }
      this.advance();
    }
  }

  /**
   * Check if character is digit
   */
  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  /**
   * Check if character can start an identifier
   */
  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_\u4E00-\u9FFF]/.test(char);
  }

  /**
   * Check if character can continue an identifier
   */
  private isIdentifierPart(char: string): boolean {
    return /[a-zA-Z0-9_\u4E00-\u9FFF]/.test(char);
  }

  /**
   * Read a string literal (supports English and Chinese quotes)
   */
  private readString(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    const startPos = this.position;
    const openingQuote = this.peek();

    // Map Chinese quotes to their closing counterparts
    // \u201c = "  \u201d = "  \u2018 = '  \u2019 = '
    const quoteMap: Record<string, string> = {
      '"': '"', // English double quote
      "'": "'", // English single quote
      '`': '`', // Backtick
      '\u201c': '\u201d', // Chinese left double quote → right double quote
      '\u201d': '\u201d', // Chinese right double quote (in case input is already closing)
      '\u2018': '\u2019', // Chinese left single quote → right single quote
      '\u2019': '\u2019', // Chinese right single quote (in case input is already closing)
    };

    const closingQuote = quoteMap[openingQuote] || openingQuote;
    this.advance(); // Skip opening quote

    let value = '';
    const isTemplate = openingQuote === '`';

    while (this.position < this.source.length && this.peek() !== closingQuote) {
      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.peek();
        value += this.getEscapeSequence(escaped);
        this.advance();
      } else {
        value += this.peek();
        this.advance();
      }
    }

    if (this.peek() === closingQuote) {
      this.advance(); // Skip closing quote
    }

    return new Token(
      isTemplate ? TokenType.TEMPLATE_STRING : TokenType.STRING,
      value,
      startLine,
      startColumn,
      startPos,
      this.position
    );
  }

  /**
   * Get escape sequence character
   */
  private getEscapeSequence(char: string): string {
    switch (char) {
      case 'n':
        return '\n';
      case 't':
        return '\t';
      case 'r':
        return '\r';
      case '\\':
        return '\\';
      case '"':
        return '"';
      case "'":
        return "'";
      case '`':
        return '`';
      default:
        return char;
    }
  }

  /**
   * Read a number literal
   */
  private readNumber(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    const startPos = this.position;
    let value = '';

    // Handle hex, binary, octal
    if (this.peek() === '0') {
      value += this.advance();
      if (this.peek() === 'x' || this.peek() === 'X') {
        value += this.advance();
        while (this.isHexDigit(this.peek())) {
          value += this.advance();
        }
      } else if (this.peek() === 'b' || this.peek() === 'B') {
        value += this.advance();
        while (this.peek() === '0' || this.peek() === '1') {
          value += this.advance();
        }
      } else if (this.peek() === 'o' || this.peek() === 'O') {
        value += this.advance();
        while (/[0-7]/.test(this.peek())) {
          value += this.advance();
        }
      }
    }

    // Regular number
    while (this.isDigit(this.peek())) {
      value += this.advance();
    }

    // Decimal part
    if (this.peek() === '.' && this.isDigit(this.peekAhead())) {
      value += this.advance(); // .
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    // Exponent part
    if (this.peek() === 'e' || this.peek() === 'E') {
      value += this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        value += this.advance();
      }
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    return new Token(TokenType.NUMBER, value, startLine, startColumn, startPos, this.position);
  }

  /**
   * Check if character is hexadecimal digit
   */
  private isHexDigit(char: string): boolean {
    return /[0-9a-fA-F]/.test(char);
  }

  /**
   * Read an identifier or keyword
   */
  private readIdentifierOrKeyword(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    const startPos = this.position;
    let value = '';

    while (this.isIdentifierPart(this.peek())) {
      value += this.advance();
    }

    // Check if it's a keyword
    let tokenType = TokenType.IDENTIFIER;
    if (isKeyword(value)) {
      tokenType = getKeywordType(value) || TokenType.IDENTIFIER;
    } else if (value === 'true' || value === 'True') {
      tokenType = TokenType.TRUE;
    } else if (value === 'false' || value === 'False') {
      tokenType = TokenType.FALSE;
    } else if (value === 'null' || value === 'Null') {
      tokenType = TokenType.NULL;
    } else if (value === 'undefined' || value === 'Undefined') {
      tokenType = TokenType.UNDEFINED;
    }

    return new Token(tokenType, value, startLine, startColumn, startPos, this.position);
  }

  /**
   * Read operators and punctuation
   */
  private readOperatorOrPunctuation(): Token | null {
    const startLine = this.line;
    const startColumn = this.column;
    const startPos = this.position;
    const char = this.peek();
    const nextChar = this.peekAhead();
    const nextNextChar = this.peekAhead(2);

    // Three-character operators
    if (char === '.' && nextChar === '.' && nextNextChar === '.') {
      this.advance();
      this.advance();
      this.advance();
      return new Token(TokenType.SPREAD, '...', startLine, startColumn, startPos, this.position);
    }

    // Strict equality operators (must be checked before == and !=)
    if (char === '=' && nextChar === '=' && nextNextChar === '=') {
      this.advance();
      this.advance();
      this.advance();
      return new Token(TokenType.STRICT_EQUALS, '===', startLine, startColumn, startPos, this.position);
    }

    if (char === '!' && nextChar === '=' && nextNextChar === '=') {
      this.advance();
      this.advance();
      this.advance();
      return new Token(TokenType.STRICT_NOT_EQUALS, '!==', startLine, startColumn, startPos, this.position);
    }

    if (char === '<' && nextChar === '/' && nextNextChar !== '>') {
      this.advance();
      this.advance();
      return new Token(TokenType.JSX_SLASH, '</', startLine, startColumn, startPos, this.position);
    }

    // JSX self-closing tag
    if (char === '/' && nextChar === '>') {
      this.advance();
      this.advance();
      return new Token(TokenType.JSX_SELF_CLOSING, '/>', startLine, startColumn, startPos, this.position);
    }

    // Two-character operators
    const twoCharOp = char + nextChar;
    const tokenType = this.getTwoCharOperatorType(twoCharOp);
    if (tokenType) {
      this.advance();
      this.advance();
      return new Token(tokenType, twoCharOp, startLine, startColumn, startPos, this.position);
    }

    // Single-character operators and punctuation
    const singleCharType = this.getSingleCharTokenType(char);
    if (singleCharType) {
      this.advance();
      return new Token(singleCharType, char, startLine, startColumn, startPos, this.position);
    }

    return null;
  }

  /**
   * Normalize Chinese punctuation to English equivalents
   */
  private normalizePunctuation(char: string): string {
    const punctuationMap: Record<string, string> = {
      '。': '.',  // Chinese period to period
      '，': ',',  // Chinese comma to comma
      '；': ';',  // Chinese semicolon to semicolon
      '：': ':',  // Chinese colon to colon
      '（': '(',  // Chinese open paren to paren
      '）': ')',  // Chinese close paren to paren
      '【': '[',  // Chinese square bracket open
      '】': ']',  // Chinese square bracket close
      '｛': '{',  // Chinese curly brace open
      '｝': '}',  // Chinese curly brace close
      '！': '!',  // Chinese exclamation
      '？': '?',  // Chinese question mark
      '·': ',',   // Chinese middle dot to comma
      '、': ',',  // Chinese enumeration comma to comma
    };
    return punctuationMap[char] || char;
  }

  /**
   * Get token type for two-character operator
   */
  private getTwoCharOperatorType(op: string): TokenType | null {
    // Normalize Chinese punctuation in operators
    const normalized = this.normalizePunctuation(op[0]) + this.normalizePunctuation(op[1]);
    
    switch (normalized) {
      case '==':
        return TokenType.EQUALS;
      case '!=':
        return TokenType.NOT_EQUALS;
      case '<=':
        return TokenType.LESS_EQUAL;
      case '>=':
        return TokenType.GREATER_EQUAL;
      case '&&':
        return TokenType.LOGICAL_AND;
      case '||':
        return TokenType.LOGICAL_OR;
      case '+=':
        return TokenType.PLUS_ASSIGN;
      case '-=':
        return TokenType.MINUS_ASSIGN;
      case '*=':
        return TokenType.MULTIPLY_ASSIGN;
      case '/=':
        return TokenType.DIVIDE_ASSIGN;
      case '%=':
        return TokenType.MODULO_ASSIGN;
      case '=>':
        return TokenType.ARROW;
      case '**':
        return TokenType.POWER;
      case '?.':
        return TokenType.OPTIONAL_CHAIN;
      case '??':
        return TokenType.NULLISH_COALESCE;
      default:
        return null;
    }
  }

  /**
   * Get token type for single-character token
   */
  private getSingleCharTokenType(char: string): TokenType | null {
    // Normalize Chinese punctuation
    const normalized = this.normalizePunctuation(char);
    
    switch (normalized) {
      case '+':
        return TokenType.PLUS;
      case '-':
        return TokenType.MINUS;
      case '*':
        return TokenType.MULTIPLY;
      case '/':
        return TokenType.DIVIDE;
      case '%':
        return TokenType.MODULO;
      case '!':
        return TokenType.LOGICAL_NOT;
      case '&':
        return TokenType.BITWISE_AND;
      case '|':
        return TokenType.BITWISE_OR;
      case '^':
        return TokenType.BITWISE_XOR;
      case '~':
        return TokenType.BITWISE_NOT;
      case '=':
        return TokenType.ASSIGN;
      case '?':
        return TokenType.QUESTION;
      case ':':
        return TokenType.COLON;
      case '(':
        return TokenType.LPAREN;
      case ')':
        return TokenType.RPAREN;
      case '{':
        return TokenType.LBRACE;
      case '}':
        return TokenType.RBRACE;
      case '[':
        return TokenType.LBRACKET;
      case ']':
        return TokenType.RBRACKET;
      case ';':
        return TokenType.SEMICOLON;
      case ',':
        return TokenType.COMMA;
      case '.':
        return TokenType.DOT;
      case '<':
        return TokenType.LESS_THAN;
      case '>':
        return TokenType.GREATER_THAN;
      default:
        return null;
    }
  }
}

/**
 * Tokenize a source string
 */
export function tokenize(source: string, options?: TokenizerOptions): Token[] {
  const tokenizer = new Tokenizer(source, options);
  return tokenizer.tokenize();
}
