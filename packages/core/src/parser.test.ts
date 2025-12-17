import { describe, it, expect } from 'vitest';
import { tokenize } from './tokenizer';
import { parse } from './parser';
import * as AST from './ast';

/**
 * Parser Unit Tests
 * Tests the recursive descent parser with 30+ test cases
 */

describe('Parser', () => {
  // Helper function to parse code
  const parseCode = (code: string): AST.Program => {
    const tokens = tokenize(code);
    return parse(tokens);
  };

  // ============================================================================
  // EXPRESSION TESTS (6 tests)
  // ============================================================================

  describe('Expressions', () => {
    it('should parse numeric literal', () => {
      const ast = parseCode('123;');
      expect(ast.body).toHaveLength(1);
      const stmt = ast.body[0] as AST.ExpressionStatement;
      expect(stmt.type).toBe('ExpressionStatement');
      const literal = stmt.expression as AST.Literal;
      expect(literal.type).toBe('Literal');
      expect(literal.value).toBe(123);
    });

    it('should parse string literal', () => {
      const ast = parseCode('"hello";');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const literal = stmt.expression as AST.Literal;
      expect(literal.type).toBe('Literal');
      expect(literal.value).toBe('hello');
    });

    it('should parse binary expression with correct precedence', () => {
      const ast = parseCode('2 + 3 * 4;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const expr = stmt.expression as AST.BinaryExpression;
      
      // Should be (2 + (3 * 4)), not ((2 + 3) * 4)
      expect(expr.operator).toBe('+');
      expect((expr.left as AST.Literal).value).toBe(2);
      
      const right = expr.right as AST.BinaryExpression;
      expect(right.operator).toBe('*');
      expect((right.left as AST.Literal).value).toBe(3);
      expect((right.right as AST.Literal).value).toBe(4);
    });

    it('should parse unary expression', () => {
      const ast = parseCode('-x;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const expr = stmt.expression as AST.UnaryExpression;
      expect(expr.type).toBe('UnaryExpression');
      expect(expr.operator).toBe('-');
      expect(expr.prefix).toBe(true);
      expect(((expr.argument as AST.Identifier).name)).toBe('x');
    });

    it('should parse function call expression', () => {
      const ast = parseCode('add(1, 2);');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const expr = stmt.expression as AST.CallExpression;
      expect(expr.type).toBe('CallExpression');
      expect((expr.callee as AST.Identifier).name).toBe('add');
      expect(expr.arguments).toHaveLength(2);
      expect(((expr.arguments[0] as AST.Literal).value)).toBe(1);
      expect(((expr.arguments[1] as AST.Literal).value)).toBe(2);
    });

    it('should parse member access expression', () => {
      const ast = parseCode('obj.prop;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const expr = stmt.expression as AST.MemberExpression;
      expect(expr.type).toBe('MemberExpression');
      expect((expr.object as AST.Identifier).name).toBe('obj');
      expect((expr.property as AST.Identifier).name).toBe('prop');
      expect(expr.computed).toBe(false);
    });

    it('should parse computed member access', () => {
      const ast = parseCode('arr[0];');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const expr = stmt.expression as AST.MemberExpression;
      expect(expr.computed).toBe(true);
      expect(((expr.property as AST.Literal).value)).toBe(0);
    });

    it('should parse logical operators correctly', () => {
      const ast = parseCode('a && b || c;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const expr = stmt.expression as AST.BinaryExpression;
      
      // Should be ((a && b) || c)
      expect(expr.operator).toBe('||');
      const left = expr.left as AST.BinaryExpression;
      expect(left.operator).toBe('&&');
    });

    it('should parse ternary/conditional expression', () => {
      const ast = parseCode('x > 0 ? 1 : 2;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const expr = stmt.expression as AST.ConditionalExpression;
      expect(expr.type).toBe('ConditionalExpression');
      expect(((expr.consequent as AST.Literal).value)).toBe(1);
      expect(((expr.alternate as AST.Literal).value)).toBe(2);
    });
  });

  // ============================================================================
  // VARIABLE DECLARATION TESTS (4 tests)
  // ============================================================================

  describe('Variable Declarations', () => {
    it('should parse let declaration with initialization', () => {
      const ast = parseCode('令 x = 10;');
      expect(ast.body).toHaveLength(1);
      const decl = ast.body[0] as AST.VariableDeclaration;
      expect(decl.type).toBe('VariableDeclaration');
      expect(decl.kind).toBe('let');
      expect(decl.declarations).toHaveLength(1);
      expect(decl.declarations[0].id.name).toBe('x');
      expect((decl.declarations[0].init as AST.Literal).value).toBe(10);
    });

    it('should parse const declaration', () => {
      const ast = parseCode('常量 PI = 3.14159;');
      const decl = ast.body[0] as AST.VariableDeclaration;
      expect(decl.kind).toBe('const');
      expect(decl.declarations[0].id.name).toBe('PI');
    });

    it('should parse let declaration without initialization', () => {
      const ast = parseCode('令 x;');
      const decl = ast.body[0] as AST.VariableDeclaration;
      expect(decl.declarations[0].init).toBe(null);
    });

    it('should parse multiple variable declarations', () => {
      const ast = parseCode('令 a = 1, b = 2, c = 3;');
      const decl = ast.body[0] as AST.VariableDeclaration;
      expect(decl.declarations).toHaveLength(3);
      expect(decl.declarations[0].id.name).toBe('a');
      expect(decl.declarations[1].id.name).toBe('b');
      expect(decl.declarations[2].id.name).toBe('c');
    });
  });

  // ============================================================================
  // FUNCTION DECLARATION TESTS (5 tests)
  // ============================================================================

  describe('Function Declarations', () => {
    it('should parse simple function declaration', () => {
      const ast = parseCode('函数 greet() { }');
      expect(ast.body).toHaveLength(1);
      const func = ast.body[0] as AST.FunctionDeclaration;
      expect(func.type).toBe('FunctionDeclaration');
      expect(func.id.name).toBe('greet');
      expect(func.params).toHaveLength(0);
      expect(func.body.body).toHaveLength(0);
    });

    it('should parse function with parameters', () => {
      const ast = parseCode('函数 add(a, b) { }');
      const func = ast.body[0] as AST.FunctionDeclaration;
      expect(func.params).toHaveLength(2);
      expect(func.params[0].name).toBe('a');
      expect(func.params[1].name).toBe('b');
    });

    it('should parse function with return statement', () => {
      const ast = parseCode('函数 add(a, b) { 返回 a + b; }');
      const func = ast.body[0] as AST.FunctionDeclaration;
      expect(func.body.body).toHaveLength(1);
      const returnStmt = func.body.body[0] as AST.ReturnStatement;
      expect(returnStmt.type).toBe('ReturnStatement');
      expect((returnStmt.argument as AST.BinaryExpression).operator).toBe('+');
    });

    it('should parse function with multiple statements', () => {
      const ast = parseCode(`
        函数 calculate() {
          令 x = 10;
          令 y = 20;
          返回 x + y;
        }
      `);
      const func = ast.body[0] as AST.FunctionDeclaration;
      expect(func.body.body).toHaveLength(3);
      expect((func.body.body[0] as AST.VariableDeclaration).type).toBe('VariableDeclaration');
      expect((func.body.body[1] as AST.VariableDeclaration).type).toBe('VariableDeclaration');
      expect((func.body.body[2] as AST.ReturnStatement).type).toBe('ReturnStatement');
    });

    it('should parse nested function calls', () => {
      const ast = parseCode('函数 outer() { 返回 inner(value); }');
      const func = ast.body[0] as AST.FunctionDeclaration;
      const returnStmt = func.body.body[0] as AST.ReturnStatement;
      const call = returnStmt.argument as AST.CallExpression;
      expect(call.type).toBe('CallExpression');
      expect((call.callee as AST.Identifier).name).toBe('inner');
    });
  });

  // ============================================================================
  // CONTROL FLOW TESTS (6 tests)
  // ============================================================================

  describe('Control Flow', () => {
    it('should parse if statement', () => {
      const ast = parseCode('如果 (x > 0) { }');
      expect(ast.body).toHaveLength(1);
      const ifStmt = ast.body[0] as AST.IfStatement;
      expect(ifStmt.type).toBe('IfStatement');
      expect((ifStmt.test as AST.BinaryExpression).operator).toBe('>');
      expect(ifStmt.alternate).toBe(null);
    });

    it('should parse if-else statement', () => {
      const ast = parseCode('如果 (x > 0) { } 否则 { }');
      const ifStmt = ast.body[0] as AST.IfStatement;
      expect(ifStmt.alternate).not.toBe(null);
      expect((ifStmt.alternate as AST.BlockStatement).type).toBe('BlockStatement');
    });

    it('should parse nested if-else-if', () => {
      const ast = parseCode(`
        如果 (x > 0) { }
        否则 如果 (x < 0) { }
        否则 { }
      `);
      const ifStmt = ast.body[0] as AST.IfStatement;
      const elseIf = ifStmt.alternate as AST.IfStatement;
      expect(elseIf.type).toBe('IfStatement');
      expect(elseIf.alternate).not.toBe(null);
    });

    it('should parse while loop', () => {
      const ast = parseCode('当 (x < 10) { 令 x = x + 1; }');
      expect(ast.body).toHaveLength(1);
      const whileStmt = ast.body[0] as AST.WhileStatement;
      expect(whileStmt.type).toBe('WhileStatement');
      expect((whileStmt.test as AST.BinaryExpression).operator).toBe('<');
      expect((whileStmt.body as AST.BlockStatement).body).toHaveLength(1);
    });

    it('should parse for loop with all parts', () => {
      const ast = parseCode('对于 (令 i = 0; i < 10; i = i + 1) { }');
      expect(ast.body).toHaveLength(1);
      const forStmt = ast.body[0] as AST.ForStatement;
      expect(forStmt.type).toBe('ForStatement');
      expect(forStmt.init).not.toBe(null);
      expect(forStmt.test).not.toBe(null);
      expect(forStmt.update).not.toBe(null);
    });

    it('should parse break statement', () => {
      const ast = parseCode('当 (真) { 破; }');
      const whileStmt = ast.body[0] as AST.WhileStatement;
      const breakStmt = (whileStmt.body as AST.BlockStatement).body[0] as AST.BreakStatement;
      expect(breakStmt.type).toBe('BreakStatement');
    });

    it('should parse continue statement', () => {
      const ast = parseCode('当 (真) { 续; }');
      const whileStmt = ast.body[0] as AST.WhileStatement;
      const continueStmt = (whileStmt.body as AST.BlockStatement).body[0] as AST.ContinueStatement;
      expect(continueStmt.type).toBe('ContinueStatement');
    });
  });

  // ============================================================================
  // ARRAY AND OBJECT TESTS (3 tests)
  // ============================================================================

  describe('Arrays and Objects', () => {
    it('should parse array literal', () => {
      const ast = parseCode('[1, 2, 3];');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const arr = stmt.expression as AST.ArrayExpression;
      expect(arr.type).toBe('ArrayExpression');
      expect(arr.elements).toHaveLength(3);
      expect((arr.elements[0] as AST.Literal).value).toBe(1);
    });

    it('should parse object literal', () => {
      const ast = parseCode('令 obj = { 名字: "张三", 年龄: 25 };');
      const decl = ast.body[0] as AST.VariableDeclaration;
      const obj = decl.declarations[0].init as AST.ObjectExpression;
      expect(obj.type).toBe('ObjectExpression');
      expect(obj.properties).toHaveLength(2);
      expect((obj.properties[0].key as AST.Identifier).name).toBe('名字');
      expect((obj.properties[0].value as AST.Literal).value).toBe('张三');
    });

    it('should parse nested array', () => {
      const ast = parseCode('[[1, 2], [3, 4]];');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const arr = stmt.expression as AST.ArrayExpression;
      expect(arr.elements).toHaveLength(2);
      const firstNested = arr.elements[0] as AST.ArrayExpression;
      expect(firstNested.elements).toHaveLength(2);
    });
  });

  // ============================================================================
  // COMPLEX PROGRAM TESTS (5 tests)
  // ============================================================================

  describe('Complex Programs', () => {
    it('should parse multi-statement program', () => {
      const ast = parseCode(`
        令 x = 10;
        令 y = 20;
        函数 add(a, b) { 返回 a + b; }
        x = add(x, y);
      `);
      expect(ast.body).toHaveLength(4);
      expect((ast.body[0] as AST.VariableDeclaration).type).toBe('VariableDeclaration');
      expect((ast.body[1] as AST.VariableDeclaration).type).toBe('VariableDeclaration');
      expect((ast.body[2] as AST.FunctionDeclaration).type).toBe('FunctionDeclaration');
      expect((ast.body[3] as AST.ExpressionStatement).type).toBe('ExpressionStatement');
    });

    it('should parse function with nested control flow', () => {
      const ast = parseCode(`
        函数 fibonacci(n) {
          如果 (n <= 1) {
            返回 n;
          } 否则 {
            返回 fibonacci(n - 1) + fibonacci(n - 2);
          }
        }
      `);
      const func = ast.body[0] as AST.FunctionDeclaration;
      expect(func.body.body).toHaveLength(1);
      const ifStmt = func.body.body[0] as AST.IfStatement;
      expect(ifStmt.type).toBe('IfStatement');
    });

    it('should parse function with loop and conditions', () => {
      const ast = parseCode(`
        函数 sumUntil(max) {
          令 sum = 0;
          对于 (令 i = 0; i < max; i = i + 1) {
            如果 (i % 2 == 0) {
              sum = sum + i;
            }
          }
          返回 sum;
        }
      `);
      const func = ast.body[0] as AST.FunctionDeclaration;
      expect(func.body.body).toHaveLength(3);
    });

    it('should parse real-world calculator pattern', () => {
      const ast = parseCode(`
        函数 calculate(a, op, b) {
          如果 (op == "+") { 返回 a + b; }
          否则 如果 (op == "-") { 返回 a - b; }
          否则 如果 (op == "*") { 返回 a * b; }
          否则 { 返回 a / b; }
        }
      `);
      expect(ast.body).toHaveLength(1);
    });

    it('should parse chained member and call expressions', () => {
      const ast = parseCode('obj.method().value[0];');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const expr = stmt.expression as AST.MemberExpression;
      
      // Outermost: [0] access
      expect(expr.type).toBe('MemberExpression');
      expect(expr.computed).toBe(true);
      
      // Next level: .value
      const valueAccess = expr.object as AST.MemberExpression;
      expect(valueAccess.type).toBe('MemberExpression');
      expect((valueAccess.property as AST.Identifier).name).toBe('value');
      expect(valueAccess.computed).toBe(false);
      
      // Innermost: obj.method()
      const callExpr = valueAccess.object as AST.CallExpression;
      expect(callExpr.type).toBe('CallExpression');
    });
  });

  // ============================================================================
  // BOOLEAN AND NULL TESTS (3 tests)
  // ============================================================================

  describe('Boolean and Null Literals', () => {
    it('should parse true literal', () => {
      const ast = parseCode('真;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const literal = stmt.expression as AST.Literal;
      expect(literal.value).toBe(true);
    });

    it('should parse false literal', () => {
      const ast = parseCode('假;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const literal = stmt.expression as AST.Literal;
      expect(literal.value).toBe(false);
    });

    it('should parse null literal', () => {
      const ast = parseCode('空;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const literal = stmt.expression as AST.Literal;
      expect(literal.value).toBe(null);
    });
  });

  // ============================================================================
  // ASSIGNMENT OPERATOR TESTS (3 tests)
  // ============================================================================

  describe('Assignment Expressions', () => {
    it('should parse simple assignment', () => {
      const ast = parseCode('x = 5;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const assign = stmt.expression as AST.AssignmentExpression;
      expect(assign.type).toBe('AssignmentExpression');
      expect(assign.operator).toBe('=');
      expect((assign.left as AST.Identifier).name).toBe('x');
      expect((assign.right as AST.Literal).value).toBe(5);
    });

    it('should parse compound assignment operators', () => {
      const ast = parseCode('x += 1;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const assign = stmt.expression as AST.AssignmentExpression;
      expect(assign.operator).toBe('+=');
    });

    it('should parse chained assignment', () => {
      const ast = parseCode('a = b = c = 0;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const assign = stmt.expression as AST.AssignmentExpression;
      expect(assign.type).toBe('AssignmentExpression');
      expect((assign.right as AST.AssignmentExpression).type).toBe('AssignmentExpression');
    });
  });

  // ============================================================================
  // COMPARISON OPERATOR TESTS (3 tests)
  // ============================================================================

  describe('Comparison Operators', () => {
    it('should parse all comparison operators', () => {
      const operators = ['>', '<', '>=', '<=', '==', '!='];
      
      for (const op of operators) {
        const ast = parseCode(`x ${op} y;`);
        const stmt = ast.body[0] as AST.ExpressionStatement;
        const expr = stmt.expression as AST.BinaryExpression;
        expect(expr.operator).toBe(op);
      }
    });

    it('should parse strict equality operators', () => {
      const ast1 = parseCode('x === y;');
      const stmt1 = ast1.body[0] as AST.ExpressionStatement;
      const expr1 = stmt1.expression as AST.BinaryExpression;
      expect(expr1.operator).toBe('===');
      
      const ast2 = parseCode('x !== y;');
      const stmt2 = ast2.body[0] as AST.ExpressionStatement;
      const expr2 = stmt2.expression as AST.BinaryExpression;
      expect(expr2.operator).toBe('!==');
    });

    it('should parse complex logical expressions', () => {
      const ast = parseCode('(a > 0 && b < 10) || (c == 5);');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const expr = stmt.expression as AST.BinaryExpression;
      expect(expr.operator).toBe('||');
    });

    it('should parse comparison in function call', () => {
      const ast = parseCode('check(x > 5, y <= 10);');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const call = stmt.expression as AST.CallExpression;
      expect(call.arguments).toHaveLength(2);
      expect(((call.arguments[0] as AST.BinaryExpression).operator)).toBe('>');
    });
  });

  // ============================================================================
  // EDGE CASES (3 tests)
  // ============================================================================

  describe('Edge Cases', () => {
    it('should parse empty block statement', () => {
      const ast = parseCode('{ }');
      expect(ast.body).toHaveLength(1);
      const block = ast.body[0] as AST.BlockStatement;
      expect(block.type).toBe('BlockStatement');
      expect(block.body).toHaveLength(0);
    });

    it('should parse parenthesized expression', () => {
      const ast = parseCode('(1 + 2) * 3;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      const expr = stmt.expression as AST.BinaryExpression;
      expect(expr.operator).toBe('*');
      const left = expr.left as AST.BinaryExpression;
      expect(left.operator).toBe('+');
    });

    it('should parse expressions with mixed operators', () => {
      const ast = parseCode('a + b * c - d / e % f;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      expect((stmt.expression as AST.BinaryExpression).type).toBe('BinaryExpression');
    });
  });

  // ============================================================================
  // POSITION TRACKING TESTS (2 tests)
  // ============================================================================

  describe('Position Tracking', () => {
    it('should track line and column numbers', () => {
      const ast = parseCode('令 x = 10;');
      const decl = ast.body[0] as AST.VariableDeclaration;
      expect(decl.line).toBeGreaterThan(0);
      expect(decl.column).toBeGreaterThan(0);
    });

    it('should track start and end positions', () => {
      const ast = parseCode('x = 5;');
      const stmt = ast.body[0] as AST.ExpressionStatement;
      expect(stmt.start).toBeGreaterThanOrEqual(0);
      expect(stmt.end).toBeGreaterThan(stmt.start);
    });
  });
});
