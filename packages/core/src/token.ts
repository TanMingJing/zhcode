/**
 * Token Types for WenCode Language
 * Defines all possible token types used by the lexer
 */

export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  TEMPLATE_STRING = 'TEMPLATE_STRING',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  NULL = 'NULL',
  UNDEFINED = 'UNDEFINED',

  // Identifiers
  IDENTIFIER = 'IDENTIFIER',

  // Keywords (Chinese)
  FUNCTION = 'FUNCTION', // 函数
  RETURN = 'RETURN', // 返回
  IF = 'IF', // 如果
  ELSE = 'ELSE', // 否则
  ELSE_IF = 'ELSE_IF', // 否则如果
  FOR = 'FOR', // 对于
  WHILE = 'WHILE', // 当
  IN = 'IN', // 属于
  LET = 'LET', // 令
  CONST = 'CONST', // 常量
  IMPORT = 'IMPORT', // 导入
  EXPORT = 'EXPORT', // 导出
  DEFAULT = 'DEFAULT', // 默认
  FROM = 'FROM', // 从
  COMPONENT = 'COMPONENT', // 组件
  ASYNC = 'ASYNC', // 异步
  AWAIT = 'AWAIT', // 等待
  TRY = 'TRY', // 尝试
  CATCH = 'CATCH', // 捕获
  FINALLY = 'FINALLY', // 最后
  THROW = 'THROW', // 抛出
  CLASS = 'CLASS', // 类
  EXTENDS = 'EXTENDS', // 扩展
  NEW = 'NEW', // 新建
  THIS = 'THIS', // 这个
  SUPER = 'SUPER', // 超级
  STATIC = 'STATIC', // 静态
  BREAK = 'BREAK', // 破
  CONTINUE = 'CONTINUE', // 续

  // Operators
  PLUS = 'PLUS', // +
  MINUS = 'MINUS', // -
  MULTIPLY = 'MULTIPLY', // *
  DIVIDE = 'DIVIDE', // /
  MODULO = 'MODULO', // %
  POWER = 'POWER', // **
  EQUALS = 'EQUALS', // ==
  STRICT_EQUALS = 'STRICT_EQUALS', // ===
  NOT_EQUALS = 'NOT_EQUALS', // !=
  STRICT_NOT_EQUALS = 'STRICT_NOT_EQUALS', // !==
  GREATER_THAN = 'GREATER_THAN', // >
  LESS_THAN = 'LESS_THAN', // <
  GREATER_EQUAL = 'GREATER_EQUAL', // >=
  LESS_EQUAL = 'LESS_EQUAL', // <=
  LOGICAL_AND = 'LOGICAL_AND', // &&
  LOGICAL_OR = 'LOGICAL_OR', // ||
  LOGICAL_NOT = 'LOGICAL_NOT', // !
  BITWISE_AND = 'BITWISE_AND', // &
  BITWISE_OR = 'BITWISE_OR', // |
  BITWISE_XOR = 'BITWISE_XOR', // ^
  BITWISE_NOT = 'BITWISE_NOT', // ~
  ASSIGN = 'ASSIGN', // =
  PLUS_ASSIGN = 'PLUS_ASSIGN', // +=
  MINUS_ASSIGN = 'MINUS_ASSIGN', // -=
  MULTIPLY_ASSIGN = 'MULTIPLY_ASSIGN', // *=
  DIVIDE_ASSIGN = 'DIVIDE_ASSIGN', // /=
  MODULO_ASSIGN = 'MODULO_ASSIGN', // %=
  ARROW = 'ARROW', // =>
  QUESTION = 'QUESTION', // ?
  COLON = 'COLON', // :
  OPTIONAL_CHAIN = 'OPTIONAL_CHAIN', // ?.
  NULLISH_COALESCE = 'NULLISH_COALESCE', // ??

  // Punctuation
  LPAREN = 'LPAREN', // (
  RPAREN = 'RPAREN', // )
  LBRACE = 'LBRACE', // {
  RBRACE = 'RBRACE', // }
  LBRACKET = 'LBRACKET', // [
  RBRACKET = 'RBRACKET', // ]
  SEMICOLON = 'SEMICOLON', // ;
  COMMA = 'COMMA', // ,
  DOT = 'DOT', // .
  SPREAD = 'SPREAD', // ...
  LESS_THAN_JSX = 'LESS_THAN_JSX', // < (in JSX context)
  GREATER_THAN_JSX = 'GREATER_THAN_JSX', // > (in JSX context)
  JSX_SLASH = 'JSX_SLASH', // </ (JSX closing tag)
  JSX_SELF_CLOSING = 'JSX_SELF_CLOSING', // /> (JSX self-closing tag)

  // Special
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
  ERROR = 'ERROR',
}

export interface IToken {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  start: number;
  end: number;
}

export class Token implements IToken {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  start: number;
  end: number;

  constructor(
    type: TokenType,
    value: string,
    line: number,
    column: number,
    start: number,
    end: number
  ) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
    this.start = start;
    this.end = end;
  }

  toString(): string {
    return `Token(${this.type}, "${this.value}", ${this.line}:${this.column})`;
  }
}
