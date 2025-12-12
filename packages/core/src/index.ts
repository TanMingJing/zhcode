// WenCode Core - Language Parser & Transpiler
// Main entry point for the language engine

export { Token, TokenType, IToken } from './token';
export { Tokenizer, tokenize, TokenizerOptions } from './tokenizer';
export { CHINESE_KEYWORDS, KEYWORD_TO_JS, isKeyword, getKeywordType, getJSEquivalent } from './keywords';
export { Parser, parse } from './parser';
export { Transpiler } from './transpiler';
export * from './ast';

export const VERSION = '0.1.0';

export function hello(): string {
  return 'Hello from WenCode Core!';
}
