/**
 * ZhCode Formatter - Code formatting and beautification utility
 * Supports ZhCode (Chinese), JavaScript, JSX, TypeScript, and JSON
 */

export interface FormatOptions {
  indent: number;
  lineWidth: number;
  useTabs: boolean;
  singleQuote: boolean;
  trailingComma: boolean;
  semicolons: boolean;
  arrowParens: boolean;
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  indent: 2,
  lineWidth: 80,
  useTabs: false,
  singleQuote: true,
  trailingComma: true,
  semicolons: true,
  arrowParens: true
};

/**
 * Format code with proper indentation and spacing
 */
export function formatCode(code: string, options: Partial<FormatOptions> = {}): string {
  const opts = { ...DEFAULT_FORMAT_OPTIONS, ...options };
  const indent = opts.useTabs ? '\t' : ' '.repeat(opts.indent);

  // Detect language
  const language = detectLanguage(code);

  switch (language) {
    case 'zhcode':
      return formatZhCode(code, indent);
    case 'javascript':
    case 'typescript':
      return formatJavaScript(code, indent, opts);
    case 'json':
      return formatJSON(code, opts);
    default:
      return formatGeneric(code, indent);
  }
}

/**
 * Detect programming language from code content
 */
function detectLanguage(code: string): string {
  // ZhCode keywords
  if (/函数|变量|循环|如果|返回/.test(code)) {
    return 'zhcode';
  }
  
  // JSON
  if (code.trim().startsWith('{') || code.trim().startsWith('[')) {
    try {
      JSON.parse(code);
      return 'json';
    } catch (e) {
      // Not JSON
    }
  }

  // TypeScript/JavaScript
  if (/^(import|export|const|let|var|function|class|interface|type)/m.test(code)) {
    return code.includes('interface ') || code.includes('type ') ? 'typescript' : 'javascript';
  }

  return 'generic';
}

/**
 * Format ZhCode (Chinese programming language)
 */
function formatZhCode(code: string, indent: string): string {
  let formatted = code;
  let indentLevel = 0;
  const lines = code.split('\n');
  const result: string[] = [];

  for (let line of lines) {
    line = line.trim();
    
    if (!line) {
      result.push('');
      continue;
    }

    // Decrease indent for closing blocks
    if (/^(结束|）)/.test(line)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add formatted line
    if (line) {
      result.push(indent.repeat(indentLevel) + line);
    }

    // Increase indent for opening blocks
    if (/(函数|循环|如果|类|接口)[\s(:]/.test(line) && !line.includes('结束')) {
      indentLevel++;
    }
  }

  // Add spacing around operators and punctuation
  formatted = result.join('\n');
  formatted = formatted.replace(/\s*(=|==|!=|<|>|<=|>=|&&|\|\|)\s*/g, ' $1 ');
  formatted = formatted.replace(/\s*(,|;)\s*/g, '$1 ');

  return formatted;
}

/**
 * Format JavaScript/TypeScript code
 */
function formatJavaScript(code: string, indent: string, opts: FormatOptions): string {
  let indentLevel = 0;
  const lines = code.split('\n');
  const result: string[] = [];

  for (let line of lines) {
    line = line.trim();

    if (!line) {
      result.push('');
      continue;
    }

    // Count braces
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;

    // Decrease indent for closing braces
    if (closeBraces > openBraces) {
      indentLevel = Math.max(0, indentLevel - (closeBraces - openBraces));
    }

    // Add formatted line
    result.push(indent.repeat(indentLevel) + line);

    // Increase indent for opening braces
    if (openBraces > closeBraces) {
      indentLevel += (openBraces - closeBraces);
    }
  }

  let formatted = result.join('\n');

  // Add semicolons if needed
  if (opts.semicolons) {
    formatted = formatted.replace(/([^;{}\s])\n(?![\s}])/g, '$1;\n');
  }

  // Normalize quotes
  const quoteChar = opts.singleQuote ? "'" : '"';
  const otherQuote = opts.singleQuote ? '"' : "'";
  formatted = formatted.replace(new RegExp(otherQuote + '([^' + otherQuote + ']*?)' + otherQuote, 'g'), quoteChar + '$1' + quoteChar);

  // Add spacing around operators
  formatted = formatted.replace(/\s*(=|==|===|!=|!==|<|>|<=|>=|&&|\|\||=>)\s*/g, ' $1 ');
  formatted = formatted.replace(/\s*(,)\s*/g, '$1 ');

  return formatted;
}

/**
 * Format JSON code
 */
function formatJSON(code: string, opts: FormatOptions): string {
  try {
    const parsed = JSON.parse(code);
    const indent = opts.useTabs ? '\t' : ' '.repeat(opts.indent);
    return JSON.stringify(parsed, null, indent);
  } catch (e) {
    return code;
  }
}

/**
 * Generic code formatting (basic indentation)
 */
function formatGeneric(code: string, indent: string): string {
  let indentLevel = 0;
  const lines = code.split('\n');
  const result: string[] = [];

  for (let line of lines) {
    line = line.trim();

    if (!line) {
      result.push('');
      continue;
    }

    // Simple brace counting
    const open = (line.match(/[{(]/g) || []).length;
    const close = (line.match(/[})]/g) || []).length;

    if (close > open) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    result.push(indent.repeat(indentLevel) + line);

    if (open > close) {
      indentLevel++;
    }
  }

  return result.join('\n');
}

/**
 * Minify code (remove unnecessary whitespace)
 */
export function minifyCode(code: string): string {
  return code
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

/**
 * Check if code has syntax issues (basic validation)
 */
export function validateSyntax(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check braces balance
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Brace mismatch: ${openBraces} opening, ${closeBraces} closing`);
  }

  // Check parentheses balance
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Parenthesis mismatch: ${openParens} opening, ${closeParens} closing`);
  }

  // Check brackets balance
  const openBrackets = (code.match(/\[/g) || []).length;
  const closeBrackets = (code.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push(`Bracket mismatch: ${openBrackets} opening, ${closeBrackets} closing`);
  }

  // Check quotes balance
  const singleQuotes = (code.match(/'/g) || []).length;
  const doubleQuotes = (code.match(/"/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    errors.push('Unmatched single quotes');
  }
  if (doubleQuotes % 2 !== 0) {
    errors.push('Unmatched double quotes');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
