"use strict";
/**
 * Token Types for ZhCode Language
 * Defines all possible token types used by the lexer
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    // Literals
    TokenType["NUMBER"] = "NUMBER";
    TokenType["STRING"] = "STRING";
    TokenType["TEMPLATE_STRING"] = "TEMPLATE_STRING";
    TokenType["TRUE"] = "TRUE";
    TokenType["FALSE"] = "FALSE";
    TokenType["NULL"] = "NULL";
    TokenType["UNDEFINED"] = "UNDEFINED";
    // Identifiers
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    // Keywords (Chinese)
    TokenType["FUNCTION"] = "FUNCTION";
    TokenType["RETURN"] = "RETURN";
    TokenType["IF"] = "IF";
    TokenType["ELSE"] = "ELSE";
    TokenType["ELSE_IF"] = "ELSE_IF";
    TokenType["FOR"] = "FOR";
    TokenType["WHILE"] = "WHILE";
    TokenType["IN"] = "IN";
    TokenType["LET"] = "LET";
    TokenType["CONST"] = "CONST";
    TokenType["IMPORT"] = "IMPORT";
    TokenType["EXPORT"] = "EXPORT";
    TokenType["DEFAULT"] = "DEFAULT";
    TokenType["FROM"] = "FROM";
    TokenType["COMPONENT"] = "COMPONENT";
    TokenType["ASYNC"] = "ASYNC";
    TokenType["AWAIT"] = "AWAIT";
    TokenType["TRY"] = "TRY";
    TokenType["CATCH"] = "CATCH";
    TokenType["FINALLY"] = "FINALLY";
    TokenType["THROW"] = "THROW";
    TokenType["CLASS"] = "CLASS";
    TokenType["EXTENDS"] = "EXTENDS";
    TokenType["NEW"] = "NEW";
    TokenType["THIS"] = "THIS";
    TokenType["SUPER"] = "SUPER";
    TokenType["STATIC"] = "STATIC";
    TokenType["BREAK"] = "BREAK";
    TokenType["CONTINUE"] = "CONTINUE";
    // Operators
    TokenType["PLUS"] = "PLUS";
    TokenType["MINUS"] = "MINUS";
    TokenType["MULTIPLY"] = "MULTIPLY";
    TokenType["DIVIDE"] = "DIVIDE";
    TokenType["MODULO"] = "MODULO";
    TokenType["POWER"] = "POWER";
    TokenType["EQUALS"] = "EQUALS";
    TokenType["STRICT_EQUALS"] = "STRICT_EQUALS";
    TokenType["NOT_EQUALS"] = "NOT_EQUALS";
    TokenType["STRICT_NOT_EQUALS"] = "STRICT_NOT_EQUALS";
    TokenType["GREATER_THAN"] = "GREATER_THAN";
    TokenType["LESS_THAN"] = "LESS_THAN";
    TokenType["GREATER_EQUAL"] = "GREATER_EQUAL";
    TokenType["LESS_EQUAL"] = "LESS_EQUAL";
    TokenType["LOGICAL_AND"] = "LOGICAL_AND";
    TokenType["LOGICAL_OR"] = "LOGICAL_OR";
    TokenType["LOGICAL_NOT"] = "LOGICAL_NOT";
    TokenType["BITWISE_AND"] = "BITWISE_AND";
    TokenType["BITWISE_OR"] = "BITWISE_OR";
    TokenType["BITWISE_XOR"] = "BITWISE_XOR";
    TokenType["BITWISE_NOT"] = "BITWISE_NOT";
    TokenType["ASSIGN"] = "ASSIGN";
    TokenType["PLUS_ASSIGN"] = "PLUS_ASSIGN";
    TokenType["MINUS_ASSIGN"] = "MINUS_ASSIGN";
    TokenType["MULTIPLY_ASSIGN"] = "MULTIPLY_ASSIGN";
    TokenType["DIVIDE_ASSIGN"] = "DIVIDE_ASSIGN";
    TokenType["MODULO_ASSIGN"] = "MODULO_ASSIGN";
    TokenType["ARROW"] = "ARROW";
    TokenType["QUESTION"] = "QUESTION";
    TokenType["COLON"] = "COLON";
    TokenType["OPTIONAL_CHAIN"] = "OPTIONAL_CHAIN";
    TokenType["NULLISH_COALESCE"] = "NULLISH_COALESCE";
    // Punctuation
    TokenType["LPAREN"] = "LPAREN";
    TokenType["RPAREN"] = "RPAREN";
    TokenType["LBRACE"] = "LBRACE";
    TokenType["RBRACE"] = "RBRACE";
    TokenType["LBRACKET"] = "LBRACKET";
    TokenType["RBRACKET"] = "RBRACKET";
    TokenType["SEMICOLON"] = "SEMICOLON";
    TokenType["COMMA"] = "COMMA";
    TokenType["DOT"] = "DOT";
    TokenType["SPREAD"] = "SPREAD";
    TokenType["LESS_THAN_JSX"] = "LESS_THAN_JSX";
    TokenType["GREATER_THAN_JSX"] = "GREATER_THAN_JSX";
    TokenType["JSX_SLASH"] = "JSX_SLASH";
    TokenType["JSX_SELF_CLOSING"] = "JSX_SELF_CLOSING";
    // Special
    TokenType["NEWLINE"] = "NEWLINE";
    TokenType["EOF"] = "EOF";
    TokenType["ERROR"] = "ERROR";
})(TokenType || (exports.TokenType = TokenType = {}));
class Token {
    constructor(type, value, line, column, start, end) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
        this.start = start;
        this.end = end;
    }
    toString() {
        return `Token(${this.type}, "${this.value}", ${this.line}:${this.column})`;
    }
}
exports.Token = Token;
