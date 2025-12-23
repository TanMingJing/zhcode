"use strict";
/**
 * Keywords Mapping
 * Maps Chinese keywords to their corresponding token types and JS equivalents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYWORD_TO_JS = exports.CHINESE_KEYWORDS = void 0;
exports.isKeyword = isKeyword;
exports.getKeywordType = getKeywordType;
exports.getJSEquivalent = getJSEquivalent;
const token_1 = require("./token");
exports.CHINESE_KEYWORDS = {
    // Control flow
    函数: token_1.TokenType.FUNCTION,
    返回: token_1.TokenType.RETURN,
    如果: token_1.TokenType.IF,
    否则: token_1.TokenType.ELSE,
    否则如果: token_1.TokenType.ELSE_IF,
    对于: token_1.TokenType.FOR,
    当: token_1.TokenType.WHILE,
    属于: token_1.TokenType.IN,
    // Variables
    令: token_1.TokenType.LET,
    常量: token_1.TokenType.CONST,
    // Modules
    导入: token_1.TokenType.IMPORT,
    导出: token_1.TokenType.EXPORT,
    默认: token_1.TokenType.DEFAULT,
    从: token_1.TokenType.FROM,
    // React
    组件: token_1.TokenType.COMPONENT,
    // Async
    异步: token_1.TokenType.ASYNC,
    等待: token_1.TokenType.AWAIT,
    // Error handling
    尝试: token_1.TokenType.TRY,
    捕获: token_1.TokenType.CATCH,
    最后: token_1.TokenType.FINALLY,
    抛出: token_1.TokenType.THROW,
    // Classes
    类: token_1.TokenType.CLASS,
    扩展: token_1.TokenType.EXTENDS,
    新建: token_1.TokenType.NEW,
    这个: token_1.TokenType.THIS,
    超级: token_1.TokenType.SUPER,
    静态: token_1.TokenType.STATIC,
    // Loop control
    破: token_1.TokenType.BREAK,
    续: token_1.TokenType.CONTINUE,
    // Literals
    真: token_1.TokenType.TRUE,
    假: token_1.TokenType.FALSE,
    空: token_1.TokenType.NULL,
    未定义: token_1.TokenType.UNDEFINED,
};
exports.KEYWORD_TO_JS = {
    函数: 'function',
    返回: 'return',
    如果: 'if',
    否则: 'else',
    否则如果: 'else if',
    对于: 'for',
    当: 'while',
    属于: 'in',
    令: 'let',
    常量: 'const',
    导入: 'import',
    导出: 'export',
    默认: 'default',
    从: 'from',
    组件: 'function', // Converts to function
    异步: 'async',
    等待: 'await',
    尝试: 'try',
    捕获: 'catch',
    最后: 'finally',
    抛出: 'throw',
    类: 'class',
    扩展: 'extends',
    新建: 'new',
    这个: 'this',
    超级: 'super',
    静态: 'static',
    破: 'break',
    续: 'continue',
    真: 'true',
    假: 'false',
    空: 'null',
    未定义: 'undefined',
};
function isKeyword(word) {
    return word in exports.CHINESE_KEYWORDS;
}
function getKeywordType(word) {
    return exports.CHINESE_KEYWORDS[word];
}
function getJSEquivalent(keyword) {
    return exports.KEYWORD_TO_JS[keyword];
}
