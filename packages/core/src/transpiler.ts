/**
 * WenCode Transpiler
 * Converts AST to JavaScript code
 * Supports both Chinese and English punctuation marks
 */

import * as AST from './ast';

export class Transpiler {
  private indentLevel: number = 0;
  private readonly INDENT_SIZE = 2;

  /**
   * Main transpilation entry point
   */
  transpile(program: AST.Program): string {
    const statements = program.body
      .map((stmt) => this.transpileStatement(stmt))
      .filter((s) => s.length > 0);

    return statements.join('\n');
  }

  /**
   * Transpile a single statement
   */
  private transpileStatement(stmt: AST.Statement): string {
    switch (stmt.type) {
      case 'VariableDeclaration':
        return this.transpileVariableDeclaration(stmt as AST.VariableDeclaration);
      case 'FunctionDeclaration':
        return this.transpileFunctionDeclaration(stmt as AST.FunctionDeclaration);
      case 'IfStatement':
        return this.transpileIfStatement(stmt as AST.IfStatement);
      case 'WhileStatement':
        return this.transpileWhileStatement(stmt as AST.WhileStatement);
      case 'ForStatement':
        return this.transpileForStatement(stmt as AST.ForStatement);
      case 'BlockStatement':
        return this.transpileBlockStatement(stmt as AST.BlockStatement);
      case 'ReturnStatement':
        return this.transpileReturnStatement(stmt as AST.ReturnStatement);
      case 'BreakStatement':
        return this.transpileBreakStatement();
      case 'ContinueStatement':
        return this.transpilelContinueStatement();
      case 'ExpressionStatement':
        return this.transpileExpressionStatement(stmt as AST.ExpressionStatement);
      default:
        return '';
    }
  }

  /**
   * Transpile variable declaration (令 x = 10;)
   */
  private transpileVariableDeclaration(decl: AST.VariableDeclaration): string {
    const declarations = decl.declarations
      .map((d) => {
        const id = this.transpileIdentifier(d.id as AST.Identifier);
        const init = d.init ? ` = ${this.transpileExpression(d.init)}` : '';
        return `${id}${init}`;
      })
      .join(', ');

    return `${this.indent()}${decl.kind} ${declarations};`;
  }

  /**
   * Transpile function declaration
   */
  private transpileFunctionDeclaration(decl: AST.FunctionDeclaration): string {
    const name = this.transpileIdentifier(decl.id as AST.Identifier);
    const params = (decl.params as AST.Identifier[])
      .map((p) => this.transpileIdentifier(p))
      .join(', ');

    const body = this.transpileBlockStatement(decl.body as AST.BlockStatement);

    return `${this.indent()}function ${name}(${params}) ${body}`;
  }

  /**
   * Transpile if statement
   */
  private transpileIfStatement(stmt: AST.IfStatement): string {
    const condition = this.transpileExpression(stmt.test as AST.Expression);
    const consequent = this.transpileStatement(stmt.consequent as AST.Statement);

    let result = `${this.indent()}if (${condition}) ${consequent}`;

    if (stmt.alternate) {
      const alternate = this.transpileStatement(stmt.alternate as AST.Statement);
      result += ` else ${alternate}`;
    }

    return result;
  }

  /**
   * Transpile while statement
   */
  private transpileWhileStatement(stmt: AST.WhileStatement): string {
    const condition = this.transpileExpression(stmt.test as AST.Expression);
    const body = this.transpileStatement(stmt.body as AST.Statement);

    return `${this.indent()}while (${condition}) ${body}`;
  }

  /**
   * Transpile for statement
   */
  private transpileForStatement(stmt: AST.ForStatement): string {
    let init = '';
    if (stmt.init) {
      if (stmt.init.type === 'VariableDeclaration') {
        // For variable declarations in init, omit the semicolon
        const decl = stmt.init as AST.VariableDeclaration;
        const declarations = decl.declarations
          .map((d) => {
            const id = this.transpileIdentifier(d.id as AST.Identifier);
            const initVal = d.init ? ` = ${this.transpileExpression(d.init)}` : '';
            return `${id}${initVal}`;
          })
          .join(', ');
        init = `${decl.kind} ${declarations}`;
      } else {
        init = this.transpileExpression(stmt.init as AST.Expression);
      }
    }

    const test = stmt.test ? this.transpileExpression(stmt.test as AST.Expression) : '';
    const update = stmt.update ? this.transpileExpression(stmt.update as AST.Expression) : '';

    const body = this.transpileStatement(stmt.body as AST.Statement);

    return `${this.indent()}for (${init}; ${test}; ${update}) ${body}`;
  }

  /**
   * Transpile block statement ({ ... })
   */
  private transpileBlockStatement(stmt: AST.BlockStatement): string {
    this.indentLevel++;

    const statements = (stmt.body as AST.Statement[])
      .map((s) => this.transpileStatement(s))
      .filter((s) => s.length > 0)
      .join('\n');

    this.indentLevel--;

    if (statements) {
      return `{\n${statements}\n${this.indent()}}`;
    }

    return '{}';
  }

  /**
   * Transpile return statement
   */
  private transpileReturnStatement(stmt: AST.ReturnStatement): string {
    const value = stmt.argument ? ` ${this.transpileExpression(stmt.argument as AST.Expression)}` : '';
    return `${this.indent()}return${value};`;
  }

  /**
   * Transpile break statement
   */
  private transpileBreakStatement(): string {
    return `${this.indent()}break;`;
  }

  /**
   * Transpile continue statement
   */
  private transpilelContinueStatement(): string {
    return `${this.indent()}continue;`;
  }

  /**
   * Transpile expression statement
   */
  private transpileExpressionStatement(stmt: AST.ExpressionStatement): string {
    return `${this.indent()}${this.transpileExpression(stmt.expression as AST.Expression)};`;
  }

  /**
   * Transpile an expression
   */
  private transpileExpression(expr: AST.Expression): string {
    switch (expr.type) {
      case 'BinaryExpression':
        return this.transpileBinaryExpression(expr as AST.BinaryExpression);
      case 'UnaryExpression':
        return this.transpileUnaryExpression(expr as AST.UnaryExpression);
      case 'AssignmentExpression':
        return this.transpileAssignmentExpression(expr as AST.AssignmentExpression);
      case 'CallExpression':
        return this.transpileCallExpression(expr as AST.CallExpression);
      case 'MemberExpression':
        return this.transpileMemberExpression(expr as AST.MemberExpression);
      case 'ConditionalExpression':
        return this.transpileConditionalExpression(expr as AST.ConditionalExpression);
      case 'ArrayExpression':
        return this.transpileArrayExpression(expr as AST.ArrayExpression);
      case 'ObjectExpression':
        return this.transpileObjectExpression(expr as AST.ObjectExpression);
      case 'Identifier':
        return this.transpileIdentifier(expr as AST.Identifier);
      case 'Literal':
        return this.transpileLiteral(expr as AST.Literal);
      default:
        return '';
    }
  }

  /**
   * Transpile binary expression (a + b)
   */
  private transpileBinaryExpression(expr: AST.BinaryExpression): string {
    const left = this.transpileExpression(expr.left as AST.Expression);
    const right = this.transpileExpression(expr.right as AST.Expression);
    return `${left} ${expr.operator} ${right}`;
  }

  /**
   * Transpile unary expression (!x, -y)
   */
  private transpileUnaryExpression(expr: AST.UnaryExpression): string {
    const arg = this.transpileExpression(expr.argument as AST.Expression);
    return expr.prefix ? `${expr.operator}${arg}` : `${arg}${expr.operator}`;
  }

  /**
   * Transpile assignment expression (x = 10)
   */
  private transpileAssignmentExpression(expr: AST.AssignmentExpression): string {
    const left = this.transpileExpression(expr.left as AST.Expression);
    const right = this.transpileExpression(expr.right as AST.Expression);
    return `${left} ${expr.operator} ${right}`;
  }

  /**
   * Transpile function call (add(1, 2))
   */
  private transpileCallExpression(expr: AST.CallExpression): string {
    const callee = this.transpileExpression(expr.callee as AST.Expression);
    const args = (expr.arguments as AST.Expression[])
      .map((arg) => this.transpileExpression(arg))
      .join(', ');

    return `${callee}(${args})`;
  }

  /**
   * Transpile member expression (obj.prop or arr[0])
   */
  private transpileMemberExpression(expr: AST.MemberExpression): string {
    const object = this.transpileExpression(expr.object as AST.Expression);
    const property = this.transpileExpression(expr.property as AST.Expression);

    if (expr.computed) {
      return `${object}[${property}]`;
    }

    return `${object}.${property}`;
  }

  /**
   * Transpile conditional expression (x > 0 ? 1 : -1)
   */
  private transpileConditionalExpression(expr: AST.ConditionalExpression): string {
    const test = this.transpileExpression(expr.test as AST.Expression);
    const consequent = this.transpileExpression(expr.consequent as AST.Expression);
    const alternate = this.transpileExpression(expr.alternate as AST.Expression);

    return `${test} ? ${consequent} : ${alternate}`;
  }

  /**
   * Transpile array expression ([1, 2, 3])
   */
  private transpileArrayExpression(expr: AST.ArrayExpression): string {
    const elements = (expr.elements as AST.Expression[])
      .map((elem) => this.transpileExpression(elem))
      .join(', ');

    return `[${elements}]`;
  }

  /**
   * Transpile object expression ({ key: value })
   */
  private transpileObjectExpression(expr: AST.ObjectExpression): string {
    const properties = (expr.properties as AST.Property[])
      .map((prop) => {
        const key = this.transpileExpression(prop.key as AST.Expression);
        const value = this.transpileExpression(prop.value as AST.Expression);
        return `${key}: ${value}`;
      })
      .join(', ');

    return `{ ${properties} }`;
  }

  /**
   * Transpile identifier (variable name)
   */
  private transpileIdentifier(expr: AST.Identifier): string {
    return expr.name;
  }

  /**
   * Transpile literal (number, string, boolean)
   */
  private transpileLiteral(expr: AST.Literal): string {
    if (typeof expr.value === 'string') {
      return `"${expr.value.replace(/"/g, '\\"')}"`;
    }

    if (expr.value === null) {
      return 'null';
    }

    if (typeof expr.value === 'boolean') {
      return expr.value ? 'true' : 'false';
    }

    return String(expr.value);
  }

  /**
   * Get indentation string based on current level
   */
  private indent(): string {
    return ' '.repeat(this.indentLevel * this.INDENT_SIZE);
  }
}
