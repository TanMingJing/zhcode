"use strict";
/**
 * Tokenizer / Lexer for ZhCode Language
 * Converts source code into a stream of tokens
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
exports.tokenize = tokenize;
const token_1 = require("./token");
const keywords_1 = require("./keywords");
class Tokenizer {
    constructor(source, options = {}) {
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
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
    tokenize() {
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
            this.tokens.push(new token_1.Token(token_1.TokenType.ERROR, char, this.line, this.column, this.position, this.position + 1));
            this.advance();
        }
        // Add EOF token
        this.tokens.push(new token_1.Token(token_1.TokenType.EOF, '', this.line, this.column, this.position, this.position));
        return this.tokens;
    }
    /**
     * Get current character without advancing
     */
    peek() {
        if (this.position >= this.source.length) {
            return '\0';
        }
        return this.source[this.position];
    }
    /**
     * Get next character without advancing
     */
    peekAhead(offset = 1) {
        const pos = this.position + offset;
        if (pos >= this.source.length) {
            return '\0';
        }
        return this.source[pos];
    }
    /**
     * Advance to next character
     */
    advance() {
        const char = this.peek();
        this.position++;
        if (char === '\n') {
            this.line++;
            this.column = 1;
        }
        else {
            this.column++;
        }
        return char;
    }
    /**
     * Skip whitespace characters
     */
    skipWhitespace() {
        while (this.position < this.source.length && /\s/.test(this.peek())) {
            this.advance();
        }
    }
    /**
     * Skip single-line comment
     */
    skipLineComment() {
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
    skipBlockComment() {
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
    isDigit(char) {
        return /[0-9]/.test(char);
    }
    /**
     * Check if character can start an identifier
     */
    isIdentifierStart(char) {
        return /[a-zA-Z_\u4E00-\u9FFF]/.test(char);
    }
    /**
     * Check if character can continue an identifier
     */
    isIdentifierPart(char) {
        return /[a-zA-Z0-9_\u4E00-\u9FFF]/.test(char);
    }
    /**
     * Read a string literal (supports English and Chinese quotes)
     */
    readString() {
        const startLine = this.line;
        const startColumn = this.column;
        const startPos = this.position;
        const openingQuote = this.peek();
        // Map Chinese quotes to their closing counterparts
        // \u201c = "  \u201d = "  \u2018 = '  \u2019 = '
        const quoteMap = {
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
            }
            else {
                value += this.peek();
                this.advance();
            }
        }
        if (this.peek() === closingQuote) {
            this.advance(); // Skip closing quote
        }
        return new token_1.Token(isTemplate ? token_1.TokenType.TEMPLATE_STRING : token_1.TokenType.STRING, value, startLine, startColumn, startPos, this.position);
    }
    /**
     * Get escape sequence character
     */
    getEscapeSequence(char) {
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
    readNumber() {
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
            }
            else if (this.peek() === 'b' || this.peek() === 'B') {
                value += this.advance();
                while (this.peek() === '0' || this.peek() === '1') {
                    value += this.advance();
                }
            }
            else if (this.peek() === 'o' || this.peek() === 'O') {
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
        return new token_1.Token(token_1.TokenType.NUMBER, value, startLine, startColumn, startPos, this.position);
    }
    /**
     * Check if character is hexadecimal digit
     */
    isHexDigit(char) {
        return /[0-9a-fA-F]/.test(char);
    }
    /**
     * Read an identifier or keyword
     */
    readIdentifierOrKeyword() {
        const startLine = this.line;
        const startColumn = this.column;
        const startPos = this.position;
        let value = '';
        while (this.isIdentifierPart(this.peek())) {
            value += this.advance();
        }
        // Check if it's a keyword
        let tokenType = token_1.TokenType.IDENTIFIER;
        if ((0, keywords_1.isKeyword)(value)) {
            tokenType = (0, keywords_1.getKeywordType)(value) || token_1.TokenType.IDENTIFIER;
        }
        else if (value === 'true' || value === 'True') {
            tokenType = token_1.TokenType.TRUE;
        }
        else if (value === 'false' || value === 'False') {
            tokenType = token_1.TokenType.FALSE;
        }
        else if (value === 'null' || value === 'Null') {
            tokenType = token_1.TokenType.NULL;
        }
        else if (value === 'undefined' || value === 'Undefined') {
            tokenType = token_1.TokenType.UNDEFINED;
        }
        return new token_1.Token(tokenType, value, startLine, startColumn, startPos, this.position);
    }
    /**
     * Read operators and punctuation
     */
    readOperatorOrPunctuation() {
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
            return new token_1.Token(token_1.TokenType.SPREAD, '...', startLine, startColumn, startPos, this.position);
        }
        // Strict equality operators (must be checked before == and !=)
        if (char === '=' && nextChar === '=' && nextNextChar === '=') {
            this.advance();
            this.advance();
            this.advance();
            return new token_1.Token(token_1.TokenType.STRICT_EQUALS, '===', startLine, startColumn, startPos, this.position);
        }
        if (char === '!' && nextChar === '=' && nextNextChar === '=') {
            this.advance();
            this.advance();
            this.advance();
            return new token_1.Token(token_1.TokenType.STRICT_NOT_EQUALS, '!==', startLine, startColumn, startPos, this.position);
        }
        if (char === '<' && nextChar === '/' && nextNextChar !== '>') {
            this.advance();
            this.advance();
            return new token_1.Token(token_1.TokenType.JSX_SLASH, '</', startLine, startColumn, startPos, this.position);
        }
        // JSX self-closing tag
        if (char === '/' && nextChar === '>') {
            this.advance();
            this.advance();
            return new token_1.Token(token_1.TokenType.JSX_SELF_CLOSING, '/>', startLine, startColumn, startPos, this.position);
        }
        // Two-character operators
        const twoCharOp = char + nextChar;
        const tokenType = this.getTwoCharOperatorType(twoCharOp);
        if (tokenType) {
            this.advance();
            this.advance();
            return new token_1.Token(tokenType, twoCharOp, startLine, startColumn, startPos, this.position);
        }
        // Single-character operators and punctuation
        const singleCharType = this.getSingleCharTokenType(char);
        if (singleCharType) {
            this.advance();
            return new token_1.Token(singleCharType, char, startLine, startColumn, startPos, this.position);
        }
        return null;
    }
    /**
     * Normalize Chinese punctuation to English equivalents
     */
    normalizePunctuation(char) {
        const punctuationMap = {
            '。': '.', // Chinese period to period
            '，': ',', // Chinese comma to comma
            '；': ';', // Chinese semicolon to semicolon
            '：': ':', // Chinese colon to colon
            '（': '(', // Chinese open paren to paren
            '）': ')', // Chinese close paren to paren
            '【': '[', // Chinese square bracket open
            '】': ']', // Chinese square bracket close
            '｛': '{', // Chinese curly brace open
            '｝': '}', // Chinese curly brace close
            '！': '!', // Chinese exclamation
            '？': '?', // Chinese question mark
            '·': ',', // Chinese middle dot to comma
            '、': ',', // Chinese enumeration comma to comma
        };
        return punctuationMap[char] || char;
    }
    /**
     * Get token type for two-character operator
     */
    getTwoCharOperatorType(op) {
        // Normalize Chinese punctuation in operators
        const normalized = this.normalizePunctuation(op[0]) + this.normalizePunctuation(op[1]);
        switch (normalized) {
            case '==':
                return token_1.TokenType.EQUALS;
            case '!=':
                return token_1.TokenType.NOT_EQUALS;
            case '<=':
                return token_1.TokenType.LESS_EQUAL;
            case '>=':
                return token_1.TokenType.GREATER_EQUAL;
            case '&&':
                return token_1.TokenType.LOGICAL_AND;
            case '||':
                return token_1.TokenType.LOGICAL_OR;
            case '+=':
                return token_1.TokenType.PLUS_ASSIGN;
            case '-=':
                return token_1.TokenType.MINUS_ASSIGN;
            case '*=':
                return token_1.TokenType.MULTIPLY_ASSIGN;
            case '/=':
                return token_1.TokenType.DIVIDE_ASSIGN;
            case '%=':
                return token_1.TokenType.MODULO_ASSIGN;
            case '=>':
                return token_1.TokenType.ARROW;
            case '**':
                return token_1.TokenType.POWER;
            case '?.':
                return token_1.TokenType.OPTIONAL_CHAIN;
            case '??':
                return token_1.TokenType.NULLISH_COALESCE;
            default:
                return null;
        }
    }
    /**
     * Get token type for single-character token
     */
    getSingleCharTokenType(char) {
        // Normalize Chinese punctuation
        const normalized = this.normalizePunctuation(char);
        switch (normalized) {
            case '+':
                return token_1.TokenType.PLUS;
            case '-':
                return token_1.TokenType.MINUS;
            case '*':
                return token_1.TokenType.MULTIPLY;
            case '/':
                return token_1.TokenType.DIVIDE;
            case '%':
                return token_1.TokenType.MODULO;
            case '!':
                return token_1.TokenType.LOGICAL_NOT;
            case '&':
                return token_1.TokenType.BITWISE_AND;
            case '|':
                return token_1.TokenType.BITWISE_OR;
            case '^':
                return token_1.TokenType.BITWISE_XOR;
            case '~':
                return token_1.TokenType.BITWISE_NOT;
            case '=':
                return token_1.TokenType.ASSIGN;
            case '?':
                return token_1.TokenType.QUESTION;
            case ':':
                return token_1.TokenType.COLON;
            case '(':
                return token_1.TokenType.LPAREN;
            case ')':
                return token_1.TokenType.RPAREN;
            case '{':
                return token_1.TokenType.LBRACE;
            case '}':
                return token_1.TokenType.RBRACE;
            case '[':
                return token_1.TokenType.LBRACKET;
            case ']':
                return token_1.TokenType.RBRACKET;
            case ';':
                return token_1.TokenType.SEMICOLON;
            case ',':
                return token_1.TokenType.COMMA;
            case '.':
                return token_1.TokenType.DOT;
            case '<':
                return token_1.TokenType.LESS_THAN;
            case '>':
                return token_1.TokenType.GREATER_THAN;
            default:
                return null;
        }
    }
}
exports.Tokenizer = Tokenizer;
/**
 * Tokenize a source string
 */
function tokenize(source, options) {
    const tokenizer = new Tokenizer(source, options);
    return tokenizer.tokenize();
}
