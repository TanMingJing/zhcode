/**
 * Keywords Mapping
 * Maps Chinese keywords to their corresponding token types and JS equivalents
 */

import { TokenType } from './token';

export const CHINESE_KEYWORDS: Record<string, TokenType> = {
  // Control flow
  函数: TokenType.FUNCTION,
  返回: TokenType.RETURN,
  如果: TokenType.IF,
  否则: TokenType.ELSE,
  否则如果: TokenType.ELSE_IF,
  对于: TokenType.FOR,
  当: TokenType.WHILE,
  属于: TokenType.IN,

  // Variables
  令: TokenType.LET,
  常量: TokenType.CONST,

  // Modules
  导入: TokenType.IMPORT,
  导出: TokenType.EXPORT,
  默认: TokenType.DEFAULT,
  从: TokenType.FROM,

  // React
  组件: TokenType.COMPONENT,

  // Async
  异步: TokenType.ASYNC,
  等待: TokenType.AWAIT,

  // Error handling
  尝试: TokenType.TRY,
  捕获: TokenType.CATCH,
  最后: TokenType.FINALLY,
  抛出: TokenType.THROW,

  // Classes
  类: TokenType.CLASS,
  扩展: TokenType.EXTENDS,
  新建: TokenType.NEW,
  这个: TokenType.THIS,
  超级: TokenType.SUPER,
  静态: TokenType.STATIC,

  // Loop control
  破: TokenType.BREAK,
  续: TokenType.CONTINUE,

  // Literals
  真: TokenType.TRUE,
  假: TokenType.FALSE,
  空: TokenType.NULL,
  未定义: TokenType.UNDEFINED,
};

export const KEYWORD_TO_JS: Record<string, string> = {
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

export function isKeyword(word: string): boolean {
  return word in CHINESE_KEYWORDS;
}

export function getKeywordType(word: string): TokenType | undefined {
  return CHINESE_KEYWORDS[word];
}

export function getJSEquivalent(keyword: string): string | undefined {
  return KEYWORD_TO_JS[keyword];
}
