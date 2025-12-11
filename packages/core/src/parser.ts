/**
 * Recursive Descent Parser for WenCode Language
 * Converts token stream into Abstract Syntax Tree (AST)
 */

import { Token, TokenType } from './token';
import * as AST from './ast';

/**
 * WenCode Parser - converts tokens to AST
 */
export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Main entry point - parse entire program
   */
  public parse(): AST.Program {
    const body: AST.Statement[] = [];
    const startToken = this.peek();

    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        body.push(stmt);
      }
    }

    return {
      type: 'Program',
      body,
      line: startToken.line,
      column: startToken.column,
      start: startToken.start,
      end: this.getLastToken().end,
    };
  }

  /**
   * Parse a statement
   */
  private parseStatement(): AST.Statement {
    // Variable declarations: 令 x = 10; or 常量 x = 10;
    if (this.match(TokenType.LET, TokenType.CONST)) {
      return this.parseVariableDeclaration();
    }

    // Function declaration: 函数 name(params) { body }
    if (this.match(TokenType.FUNCTION)) {
      return this.parseFunctionDeclaration();
    }

    // Block statement: { statements }
    if (this.check(TokenType.LBRACE)) {
      return this.parseBlock();
    }

    // If statement: 如果 (test) { consequent } 否则 { alternate }
    if (this.match(TokenType.IF)) {
      return this.parseIfStatement();
    }

    // While loop: 当 (test) { body }
    if (this.match(TokenType.WHILE)) {
      return this.parseWhileStatement();
    }

    // For loop: 对于 (init; test; update) { body }
    if (this.match(TokenType.FOR)) {
      return this.parseForStatement();
    }

    // Return statement: 返回 value;
    if (this.match(TokenType.RETURN)) {
      return this.parseReturnStatement();
    }

    // Break statement: 破;
    if (this.match(TokenType.BREAK)) {
      return this.parseBreakStatement();
    }

    // Continue statement: 续;
    if (this.match(TokenType.CONTINUE)) {
      return this.parseContinueStatement();
    }

    // Import declaration: 导入 { specifiers } 从 './module';
    if (this.match(TokenType.IMPORT)) {
      return this.parseImportDeclaration();
    }

    // Export declaration: 导出 statement;
    if (this.match(TokenType.EXPORT)) {
      return this.parseExportDeclaration();
    }

    // Default: expression statement (expr;)
    return this.parseExpressionStatement();
  }

  /**
   * Parse variable declaration (令 or 常量)
   */
  private parseVariableDeclaration(): AST.VariableDeclaration {
    const kindToken = this.previous();
    const kind = kindToken.type === TokenType.LET ? 'let' : 'const';
    const declarations: AST.VariableDeclarator[] = [];

    // Parse first declarator
    declarations.push(this.parseVariableDeclarator());

    // Parse additional declarators (comma-separated)
    while (this.match(TokenType.COMMA)) {
      declarations.push(this.parseVariableDeclarator());
    }

    this.eat(TokenType.SEMICOLON);

    return {
      type: 'VariableDeclaration',
      kind,
      declarations,
      line: kindToken.line,
      column: kindToken.column,
      start: kindToken.start,
      end: this.previous().end,
    };
  }

  /**
   * Parse variable declarator (x = 10 or just x)
   */
  private parseVariableDeclarator(): AST.VariableDeclarator {
    const nameToken = this.eat(TokenType.IDENTIFIER);
    const id: AST.Identifier = {
      type: 'Identifier',
      name: nameToken.value,
      line: nameToken.line,
      column: nameToken.column,
      start: nameToken.start,
      end: nameToken.end,
    };

    let init: AST.Expression | null = null;

    if (this.match(TokenType.ASSIGN)) {
      init = this.parseAssignment();
    }

    return {
      type: 'VariableDeclarator',
      id,
      init,
      line: nameToken.line,
      column: nameToken.column,
      start: nameToken.start,
      end: init ? init.end : nameToken.end,
    };
  }

  /**
   * Parse function declaration
   */
  private parseFunctionDeclaration(): AST.FunctionDeclaration {
    const funcToken = this.previous();
    const idToken = this.eat(TokenType.IDENTIFIER);
    const id: AST.Identifier = {
      type: 'Identifier',
      name: idToken.value,
      line: idToken.line,
      column: idToken.column,
      start: idToken.start,
      end: idToken.end,
    };

    this.eat(TokenType.LPAREN);
    const params: AST.Identifier[] = [];

    if (!this.check(TokenType.RPAREN)) {
      do {
        const paramToken = this.eat(TokenType.IDENTIFIER);
        params.push({
          type: 'Identifier',
          name: paramToken.value,
          line: paramToken.line,
          column: paramToken.column,
          start: paramToken.start,
          end: paramToken.end,
        });
      } while (this.match(TokenType.COMMA));
    }

    this.eat(TokenType.RPAREN);
    const body = this.parseBlock();

    return {
      type: 'FunctionDeclaration',
      id,
      params,
      body,
      line: funcToken.line,
      column: funcToken.column,
      start: funcToken.start,
      end: body.end,
    };
  }

  /**
   * Parse block statement { statements }
   */
  private parseBlock(): AST.BlockStatement {
    const startToken = this.eat(TokenType.LBRACE);
    const body: AST.Statement[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        body.push(stmt);
      }
    }

    const endToken = this.eat(TokenType.RBRACE);

    return {
      type: 'BlockStatement',
      body,
      line: startToken.line,
      column: startToken.column,
      start: startToken.start,
      end: endToken.end,
    };
  }

  /**
   * Parse if statement
   */
  private parseIfStatement(): AST.IfStatement {
    const ifToken = this.previous();
    this.eat(TokenType.LPAREN);
    const test = this.parseExpression();
    this.eat(TokenType.RPAREN);

    const consequent = this.parseStatement();
    let alternate: AST.Statement | null = null;

    if (this.match(TokenType.ELSE)) {
      alternate = this.parseStatement();
    }

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternate,
      line: ifToken.line,
      column: ifToken.column,
      start: ifToken.start,
      end: alternate ? alternate.end : consequent.end,
    };
  }

  /**
   * Parse while loop
   */
  private parseWhileStatement(): AST.WhileStatement {
    const whileToken = this.previous();
    this.eat(TokenType.LPAREN);
    const test = this.parseExpression();
    this.eat(TokenType.RPAREN);
    const body = this.parseStatement();

    return {
      type: 'WhileStatement',
      test,
      body,
      line: whileToken.line,
      column: whileToken.column,
      start: whileToken.start,
      end: body.end,
    };
  }

  /**
   * Parse for loop
   */
  private parseForStatement(): AST.ForStatement {
    const forToken = this.previous();
    this.eat(TokenType.LPAREN);

    let init: AST.VariableDeclaration | AST.Expression | null = null;
    if (this.match(TokenType.LET, TokenType.CONST)) {
      init = this.parseVariableDeclaration();
      // Remove the semicolon handling since parseVariableDeclaration eats it
    } else if (!this.check(TokenType.SEMICOLON)) {
      init = this.parseExpression();
      this.eat(TokenType.SEMICOLON);
    } else {
      this.eat(TokenType.SEMICOLON);
    }

    let test: AST.Expression | null = null;
    if (!this.check(TokenType.SEMICOLON)) {
      test = this.parseExpression();
    }
    this.eat(TokenType.SEMICOLON);

    let update: AST.Expression | null = null;
    if (!this.check(TokenType.RPAREN)) {
      update = this.parseExpression();
    }
    this.eat(TokenType.RPAREN);

    const body = this.parseStatement();

    return {
      type: 'ForStatement',
      init,
      test,
      update,
      body,
      line: forToken.line,
      column: forToken.column,
      start: forToken.start,
      end: body.end,
    };
  }

  /**
   * Parse return statement
   */
  private parseReturnStatement(): AST.ReturnStatement {
    const returnToken = this.previous();
    let argument: AST.Expression | null = null;

    if (!this.check(TokenType.SEMICOLON) && !this.isAtEnd()) {
      argument = this.parseExpression();
    }

    this.eat(TokenType.SEMICOLON);

    return {
      type: 'ReturnStatement',
      argument,
      line: returnToken.line,
      column: returnToken.column,
      start: returnToken.start,
      end: this.previous().end,
    };
  }

  /**
   * Parse break statement
   */
  private parseBreakStatement(): AST.BreakStatement {
    const breakToken = this.previous();
    this.eat(TokenType.SEMICOLON);

    return {
      type: 'BreakStatement',
      line: breakToken.line,
      column: breakToken.column,
      start: breakToken.start,
      end: breakToken.end,
    };
  }

  /**
   * Parse continue statement
   */
  private parseContinueStatement(): AST.ContinueStatement {
    const continueToken = this.previous();
    this.eat(TokenType.SEMICOLON);

    return {
      type: 'ContinueStatement',
      line: continueToken.line,
      column: continueToken.column,
      start: continueToken.start,
      end: continueToken.end,
    };
  }

  /**
   * Parse import declaration
   */
  private parseImportDeclaration(): AST.ImportDeclaration {
    const importToken = this.previous();
    const specifiers: AST.ImportSpecifier[] = [];

    this.eat(TokenType.LBRACE);

    if (!this.check(TokenType.RBRACE)) {
      do {
        const importedToken = this.eat(TokenType.IDENTIFIER);
        const imported: AST.Identifier = {
          type: 'Identifier',
          name: importedToken.value,
          line: importedToken.line,
          column: importedToken.column,
          start: importedToken.start,
          end: importedToken.end,
        };

        const local = imported;
        // TODO: Support 'as' alias if needed

        specifiers.push({
          type: 'ImportSpecifier',
          imported,
          local,
          line: importedToken.line,
          column: importedToken.column,
          start: importedToken.start,
          end: importedToken.end,
        });
      } while (this.match(TokenType.COMMA));
    }

    this.eat(TokenType.RBRACE);
    this.eat(TokenType.FROM);

    const sourceToken = this.eat(TokenType.STRING);
    const source: AST.Literal = {
      type: 'Literal',
      value: sourceToken.value,
      raw: sourceToken.value,
      line: sourceToken.line,
      column: sourceToken.column,
      start: sourceToken.start,
      end: sourceToken.end,
    };

    this.eat(TokenType.SEMICOLON);

    return {
      type: 'ImportDeclaration',
      specifiers,
      source,
      line: importToken.line,
      column: importToken.column,
      start: importToken.start,
      end: this.previous().end,
    };
  }

  /**
   * Parse export declaration
   */
  private parseExportDeclaration(): AST.ExportDeclaration {
    const exportToken = this.previous();
    const isDefault = this.match(TokenType.DEFAULT);

    const declaration = this.parseStatement();

    return {
      type: 'ExportDeclaration',
      declaration,
      isDefault,
      line: exportToken.line,
      column: exportToken.column,
      start: exportToken.start,
      end: declaration.end,
    };
  }

  /**
   * Parse expression statement
   */
  private parseExpressionStatement(): AST.ExpressionStatement {
    const expr = this.parseExpression();
    this.eat(TokenType.SEMICOLON);

    return {
      type: 'ExpressionStatement',
      expression: expr,
      line: expr.line,
      column: expr.column,
      start: expr.start,
      end: this.previous().end,
    };
  }

  /**
   * Parse expression (entry point for expression parsing)
   */
  private parseExpression(): AST.Expression {
    return this.parseAssignment();
  }

  /**
   * Parse assignment expression (x = 5, count += 1)
   * Lowest precedence
   */
  private parseAssignment(): AST.Expression {
    let expr = this.parseTernary();

    if (
      this.match(
        TokenType.ASSIGN,
        TokenType.PLUS_ASSIGN,
        TokenType.MINUS_ASSIGN,
        TokenType.MULTIPLY_ASSIGN,
        TokenType.DIVIDE_ASSIGN,
        TokenType.MODULO_ASSIGN
      )
    ) {
      const operator = this.previous().value as AST.AssignmentExpression['operator'];
      const right = this.parseAssignment();

      expr = {
        type: 'AssignmentExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
        start: expr.start,
        end: right.end,
      };
    }

    return expr;
  }

  /**
   * Parse ternary/conditional expression (test ? consequent : alternate)
   */
  private parseTernary(): AST.Expression {
    let expr = this.parseLogicalOr();

    if (this.match(TokenType.QUESTION)) {
      const consequent = this.parseAssignment();
      this.eat(TokenType.COLON);
      const alternate = this.parseAssignment();

      expr = {
        type: 'ConditionalExpression',
        test: expr,
        consequent,
        alternate,
        line: expr.line,
        column: expr.column,
        start: expr.start,
        end: alternate.end,
      };
    }

    return expr;
  }

  /**
   * Parse logical OR expression (a || b)
   */
  private parseLogicalOr(): AST.Expression {
    let expr = this.parseLogicalAnd();

    while (this.match(TokenType.LOGICAL_OR)) {
      const operator = '||' as const;
      const right = this.parseLogicalAnd();

      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
        start: expr.start,
        end: right.end,
      };
    }

    return expr;
  }

  /**
   * Parse logical AND expression (a && b)
   */
  private parseLogicalAnd(): AST.Expression {
    let expr = this.parseEquality();

    while (this.match(TokenType.LOGICAL_AND)) {
      const operator = '&&' as const;
      const right = this.parseEquality();

      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
        start: expr.start,
        end: right.end,
      };
    }

    return expr;
  }

  /**
   * Parse equality expression (a == b, x !== y)
   */
  private parseEquality(): AST.Expression {
    let expr = this.parseComparison();

    while (
      this.match(
        TokenType.EQUALS,
        TokenType.NOT_EQUALS,
        TokenType.STRICT_EQUALS,
        TokenType.STRICT_NOT_EQUALS
      )
    ) {
      const operator = this.previous().value as AST.BinaryExpression['operator'];
      const right = this.parseComparison();

      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
        start: expr.start,
        end: right.end,
      };
    }

    return expr;
  }

  /**
   * Parse comparison expression (a > b, x <= 10)
   */
  private parseComparison(): AST.Expression {
    let expr = this.parseAdditive();

    while (
      this.match(
        TokenType.GREATER_THAN,
        TokenType.GREATER_EQUAL,
        TokenType.LESS_THAN,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous().value as AST.BinaryExpression['operator'];
      const right = this.parseAdditive();

      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
        start: expr.start,
        end: right.end,
      };
    }

    return expr;
  }

  /**
   * Parse additive expression (a + b, x - y)
   */
  private parseAdditive(): AST.Expression {
    let expr = this.parseMultiplicative();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().value as '+' | '-';
      const right = this.parseMultiplicative();

      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
        start: expr.start,
        end: right.end,
      };
    }

    return expr;
  }

  /**
   * Parse multiplicative expression (a * b, x / y, z % w)
   */
  private parseMultiplicative(): AST.Expression {
    let expr = this.parsePower();

    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
      const operator = this.previous().value as '*' | '/' | '%';
      const right = this.parsePower();

      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
        start: expr.start,
        end: right.end,
      };
    }

    return expr;
  }

  /**
   * Parse power expression (a ** b)
   */
  private parsePower(): AST.Expression {
    let expr = this.parseUnary();

    if (this.match(TokenType.POWER)) {
      const operator = '**' as const;
      const right = this.parsePower(); // Right associative
      expr = {
        type: 'BinaryExpression',
        operator,
        left: expr,
        right,
        line: expr.line,
        column: expr.column,
        start: expr.start,
        end: right.end,
      };
    }

    return expr;
  }

  /**
   * Parse unary expression (-x, !flag, 非 condition)
   */
  private parseUnary(): AST.Expression {
    if (this.match(TokenType.MINUS, TokenType.PLUS, TokenType.LOGICAL_NOT)) {
      const operator = this.previous().value as '-' | '+' | '!';
      const argument = this.parseUnary();

      return {
        type: 'UnaryExpression',
        operator,
        prefix: true,
        argument,
        line: this.previous().line,
        column: this.previous().column,
        start: this.previous().start,
        end: argument.end,
      };
    }

    return this.parseCallMember();
  }

  /**
   * Parse call and member access expressions
   */
  private parseCallMember(): AST.Expression {
    let expr = this.parseAtom();

    while (this.check(TokenType.LPAREN) || this.check(TokenType.DOT) || this.check(TokenType.LBRACKET)) {
      if (this.match(TokenType.LPAREN)) {
        // Function call: expr()
        const args: AST.Expression[] = [];

        if (!this.check(TokenType.RPAREN)) {
          do {
            args.push(this.parseAssignment());
          } while (this.match(TokenType.COMMA));
        }

        const endToken = this.eat(TokenType.RPAREN);

        expr = {
          type: 'CallExpression',
          callee: expr,
          arguments: args,
          line: expr.line,
          column: expr.column,
          start: expr.start,
          end: endToken.end,
        };
      } else if (this.match(TokenType.DOT)) {
        // Member access: expr.prop
        const propToken = this.eat(TokenType.IDENTIFIER);
        const property: AST.Identifier = {
          type: 'Identifier',
          name: propToken.value,
          line: propToken.line,
          column: propToken.column,
          start: propToken.start,
          end: propToken.end,
        };

        expr = {
          type: 'MemberExpression',
          object: expr,
          property,
          computed: false,
          line: expr.line,
          column: expr.column,
          start: expr.start,
          end: propToken.end,
        };
      } else if (this.match(TokenType.LBRACKET)) {
        // Member access: expr[prop]
        const property = this.parseExpression();
        const endToken = this.eat(TokenType.RBRACKET);

        expr = {
          type: 'MemberExpression',
          object: expr,
          property,
          computed: true,
          line: expr.line,
          column: expr.column,
          start: expr.start,
          end: endToken.end,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  /**
   * Parse primary/atom expression (numbers, strings, identifiers, etc.)
   */
  private parseAtom(): AST.Expression {
    // Literals: numbers, strings, booleans
    if (this.match(TokenType.NUMBER)) {
      const token = this.previous();
      return {
        type: 'Literal',
        value: parseFloat(token.value),
        raw: token.value,
        line: token.line,
        column: token.column,
        start: token.start,
        end: token.end,
      };
    }

    if (this.match(TokenType.STRING)) {
      const token = this.previous();
      return {
        type: 'Literal',
        value: token.value,
        raw: token.value,
        line: token.line,
        column: token.column,
        start: token.start,
        end: token.end,
      };
    }

    if (this.match(TokenType.TRUE)) {
      const token = this.previous();
      return {
        type: 'Literal',
        value: true,
        raw: '真',
        line: token.line,
        column: token.column,
        start: token.start,
        end: token.end,
      };
    }

    if (this.match(TokenType.FALSE)) {
      const token = this.previous();
      return {
        type: 'Literal',
        value: false,
        raw: '假',
        line: token.line,
        column: token.column,
        start: token.start,
        end: token.end,
      };
    }

    if (this.match(TokenType.NULL)) {
      const token = this.previous();
      return {
        type: 'Literal',
        value: null,
        raw: '空',
        line: token.line,
        column: token.column,
        start: token.start,
        end: token.end,
      };
    }

    // Identifier
    if (this.match(TokenType.IDENTIFIER)) {
      const token = this.previous();
      return {
        type: 'Identifier',
        name: token.value,
        line: token.line,
        column: token.column,
        start: token.start,
        end: token.end,
      };
    }

    // Array literal: [1, 2, 3]
    if (this.match(TokenType.LBRACKET)) {
      const startToken = this.previous();
      const elements: (AST.Expression | null)[] = [];

      if (!this.check(TokenType.RBRACKET)) {
        do {
          if (this.check(TokenType.COMMA)) {
            elements.push(null); // Hole in array
          } else {
            elements.push(this.parseAssignment());
          }
        } while (this.match(TokenType.COMMA) && !this.check(TokenType.RBRACKET));
      }

      const endToken = this.eat(TokenType.RBRACKET);

      return {
        type: 'ArrayExpression',
        elements,
        line: startToken.line,
        column: startToken.column,
        start: startToken.start,
        end: endToken.end,
      };
    }

    // Object literal: { key: value }
    if (this.match(TokenType.LBRACE)) {
      const startToken = this.previous();
      const properties: AST.Property[] = [];

      if (!this.check(TokenType.RBRACE)) {
        do {
          const keyToken = this.eat(TokenType.IDENTIFIER);
          const key: AST.Identifier = {
            type: 'Identifier',
            name: keyToken.value,
            line: keyToken.line,
            column: keyToken.column,
            start: keyToken.start,
            end: keyToken.end,
          };

          this.eat(TokenType.COLON);
          const value = this.parseAssignment();

          properties.push({
            type: 'Property',
            key,
            value,
            computed: false,
            shorthand: false,
            line: keyToken.line,
            column: keyToken.column,
            start: keyToken.start,
            end: value.end,
          });
        } while (this.match(TokenType.COMMA) && !this.check(TokenType.RBRACE));
      }

      const endToken = this.eat(TokenType.RBRACE);

      return {
        type: 'ObjectExpression',
        properties,
        line: startToken.line,
        column: startToken.column,
        start: startToken.start,
        end: endToken.end,
      };
    }

    // Parenthesized expression: (expr)
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      this.eat(TokenType.RPAREN);
      return expr;
    }

    // Arrow function: x => x * 2
    // TODO: Implement arrow function parsing

    throw this.parseError(`Unexpected token: ${this.peek().value}`);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if current token matches any of given types
   */
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  /**
   * Check if current token is of given type (without advancing)
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  /**
   * Get current token and advance
   */
  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  /**
   * Get current token without advancing
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * Get previous token
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  /**
   * Check if at end of tokens
   */
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  /**
   * Expect specific token type and advance, or throw error
   */
  private eat(type: TokenType): Token {
    if (this.check(type)) return this.advance();

    const current = this.peek();
    throw new Error(
      `Parse Error at line ${current.line}, column ${current.column}: ` +
        `Expected ${type} but found ${current.type}`
    );
  }

  /**
   * Get last token
   */
  private getLastToken(): Token {
    return this.tokens[this.tokens.length - 1];
  }

  /**
   * Throw parse error with location info
   */
  private parseError(message: string): Error {
    const current = this.peek();
    return new Error(
      `Parse Error at line ${current.line}, column ${current.column}: ${message}`
    );
  }
}

/**
 * Convenience function to parse tokens
 */
export function parse(tokens: Token[]): AST.Program {
  return new Parser(tokens).parse();
}
