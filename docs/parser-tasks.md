# Phase 1.3: Parser Implementation - Task Breakdown

## Overview
Convert token stream into Abstract Syntax Tree (AST) using recursive descent parsing.

**Total estimated time**: 3-4 weeks (can be parallelized)

---

## Task 1: Setup AST Type Definitions
**Status**: Ready to start  
**Estimated time**: 2-3 hours  
**Dependencies**: ast-design.md (✅ completed)

### What to do:
1. Create `packages/core/src/ast.ts`
2. Copy all TypeScript interface definitions from ast-design.md
3. Export all node types and union types
4. Add JSDoc comments for documentation

### Files to create:
```
packages/core/src/ast.ts (350-400 lines)
```

### Validation:
- [ ] TypeScript compilation: 0 errors
- [ ] All interfaces properly exported
- [ ] Union types (Statement, Expression) available

---

## Task 2: Create Parser Class Structure
**Status**: Depends on Task 1  
**Estimated time**: 2-3 hours  
**Dependencies**: Task 1, tokenizer.ts, ast.ts

### What to do:
1. Create `packages/core/src/parser.ts`
2. Implement Parser class with:
   - Constructor: accepts token array
   - Position tracking: current token index
   - Utility methods: peek(), advance(), eat(), match()
   - Error handling: parseError() method

### Code skeleton:
```typescript
export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) { ... }
  private peek(): Token { ... }
  private advance(): Token { ... }
  private eat(type: TokenType): Token { ... }
  private match(...types: TokenType[]): boolean { ... }
  private parseError(message: string): Error { ... }

  parse(): Program { ... }
}

export function parse(tokens: Token[]): Program {
  return new Parser(tokens).parse();
}
```

### Validation:
- [ ] TypeScript compilation: 0 errors
- [ ] All utility methods working
- [ ] Error handling functional

---

## Task 3: Implement Expression Parsing (Precedence Levels)
**Status**: Depends on Task 2  
**Estimated time**: 6-8 hours  
**Dependencies**: Task 2

### What to do:
Implement expression parsing with operator precedence (14 levels):

#### Level 1: Primary Expressions (parseAtom)
- Numbers: `123`, `1.23e5`, `0xFF`
- Strings: `"hello"`, `'hello'`, `` `hello` ``
- Identifiers: `x`, `名字`
- Keywords: `真` (true), `假` (false), `空` (null), `未定义` (undefined)
- Parentheses: `(expr)`
- Arrays: `[1, 2, 3]`
- Objects: `{ key: value }`

```typescript
private parseAtom(): Expression { ... }
```

#### Level 2: Unary Expressions (parseUnary)
- Prefix: `-x`, `+x`, `!x`, `~x`, `非 x`

```typescript
private parseUnary(): Expression { ... }
```

#### Level 3: Exponentiation (parsePower)
- `**` operator: `2 ** 3`

```typescript
private parsePower(): Expression { ... }
```

#### Level 4: Multiplicative (parseMultiplicative)
- `*`, `/`, `%`: `a * b`, `a / b`, `a % b`

```typescript
private parseMultiplicative(): Expression { ... }
```

#### Level 5: Additive (parseAdditive)
- `+`, `-`: `a + b`, `a - b`

```typescript
private parseAdditive(): Expression { ... }
```

#### Level 6: Comparison (parseComparison)
- `<`, `<=`, `>`, `>=`: `a > b`, `x <= 10`

```typescript
private parseComparison(): Expression { ... }
```

#### Level 7: Equality (parseEquality)
- `==`, `!=`, `===`, `!==`: `a == b`, `x !== y`

```typescript
private parseEquality(): Expression { ... }
```

#### Level 8: Logical AND (parseLogicalAnd)
- `&&`: `a && b`, `x > 0 && y < 10`

```typescript
private parseLogicalAnd(): Expression { ... }
```

#### Level 9: Logical OR (parseLogicalOr)
- `||`: `a || b`, `x == null || y == undefined`

```typescript
private parseLogicalOr(): Expression { ... }
```

#### Level 10: Conditional (parseTernary)
- `? :`: `condition ? trueValue : falseValue`

```typescript
private parseTernary(): Expression { ... }
```

#### Level 11: Assignment (parseAssignment)
- `=`, `+=`, `-=`, `*=`, `/=`, `%=`: `x = 5`, `count += 1`

```typescript
private parseAssignment(): Expression { ... }
```

#### Level 12: Call & Member Access (parseCallMember)
- Function call: `func()`, `func(a, b)`
- Member access: `obj.prop`, `arr[0]`, `obj['key']`

```typescript
private parseCallMember(expr: Expression): Expression { ... }
```

### Validation:
- [ ] All precedence levels implemented
- [ ] Expression parsing tests passing
- [ ] Complex expressions work: `2 + 3 * 4 == 14`, `a && b || c`

---

## Task 4: Implement Statement Parsing
**Status**: Depends on Task 3  
**Estimated time**: 6-8 hours  
**Dependencies**: Task 3

### What to do:
Implement statement parsing:

1. **Variable Declarations** (parseVariableDeclaration)
   - `令 x = 10;` → VariableDeclaration (kind: 'let')
   - `常量 y = 20;` → VariableDeclaration (kind: 'const')

2. **Function Declarations** (parseFunctionDeclaration)
   - `函数 add(a, b) { 返回 a + b; }`

3. **Block Statements** (parseBlock)
   - `{ statement1; statement2; }`

4. **If Statements** (parseIfStatement)
   - `如果 (condition) { ... } 否则 { ... }`
   - `如果 (condition) { ... } 否则如果 (condition2) { ... } 否则 { ... }`

5. **While Loops** (parseWhileStatement)
   - `当 (condition) { ... }`

6. **For Loops** (parseForStatement)
   - `对于 (init; test; update) { ... }`

7. **Return Statements** (parseReturnStatement)
   - `返回 value;`, `返回;`

8. **Break/Continue** (parseBreakStatement, parseContinueStatement)
   - `破;` (break)
   - `续;` (continue)

9. **Import/Export** (parseImportDeclaration, parseExportDeclaration)
   - `导入 { func } 从 './module';`
   - `导出 函数 func() { ... }`

10. **Expression Statements** (parseExpressionStatement)
    - Any expression followed by `;`

### Code structure:
```typescript
private parseStatement(): Statement {
  if (this.match(TokenType.LET, TokenType.CONST)) 
    return this.parseVariableDeclaration();
  if (this.match(TokenType.FUNCTION))
    return this.parseFunctionDeclaration();
  if (this.match(TokenType.LBRACE))
    return this.parseBlock();
  if (this.match(TokenType.IF))
    return this.parseIfStatement();
  // ... more statement types
  return this.parseExpressionStatement();
}
```

### Validation:
- [ ] All statement types implemented
- [ ] Statement parsing tests passing
- [ ] Nested structures work: function inside if statement, etc.

---

## Task 5: Implement Program Parsing & Error Handling
**Status**: Depends on Task 4  
**Estimated time**: 3-4 hours  
**Dependencies**: Task 4

### What to do:
1. Implement `parse()` main entry point
   ```typescript
   public parse(): Program {
     const body: Statement[] = [];
     while (!this.isAtEnd()) {
       body.push(this.parseStatement());
     }
     return {
       type: 'Program',
       body,
       line: 1,
       column: 1,
       start: 0,
       end: this.getLastToken().end
     };
   }
   ```

2. Implement error recovery
   - Skip tokens on parse error
   - Continue parsing to find more errors
   - Report multiple errors at once

3. Create error formatter
   - Show source line with error
   - Show error position with caret
   - Provide helpful error messages

### Example error message:
```
Parse Error at line 5, column 12:
    令 x = ;
           ^
Expected expression but found SEMICOLON
```

### Validation:
- [ ] parse() method works
- [ ] Error handling functional
- [ ] Multiple errors reported
- [ ] Source locations accurate

---

## Task 6: Write 30+ Parser Unit Tests
**Status**: Depends on Task 5  
**Estimated time**: 8-10 hours  
**Dependencies**: Task 5

### Test categories (5-6 tests each):

1. **Expressions** (6 tests)
   - Literals: numbers, strings, booleans
   - Binary operators: `a + b`, `a * b`
   - Unary operators: `-x`, `!flag`
   - Precedence: `2 + 3 * 4 == 14`
   - Parentheses: `(a + b) * c`
   - Member access: `obj.prop`, `arr[0]`

2. **Function Declarations** (5 tests)
   - Simple function: `函数 f() { }`
   - With parameters: `函数 f(a, b) { }`
   - With return: `函数 f() { 返回 10; }`
   - Nested: functions inside functions
   - Complex body: multiple statements

3. **Variable Declarations** (4 tests)
   - Let binding: `令 x = 10;`
   - Const binding: `常量 y = 20;`
   - Multiple declarations: `令 a = 1, b = 2;`
   - No initialization: `令 x;`

4. **Control Flow** (6 tests)
   - If statement: `如果 (x > 0) { ... }`
   - If-else: `如果 (...) { ... } 否则 { ... }`
   - If-else-if: chains of conditions
   - While loop: `当 (...) { ... }`
   - For loop: `对于 (...; ...; ...) { ... }`
   - Break/Continue: `破;` `续;`

5. **Complex Programs** (5 tests)
   - Multi-statement program
   - Nested functions and blocks
   - Real-world patterns (calculator, fibonacci)
   - Edge cases (empty blocks, single expressions)
   - Import/Export statements

6. **Error Cases** (4 tests)
   - Missing semicolon (recovery)
   - Unexpected token (skip and continue)
   - Mismatched braces
   - Invalid syntax

### Validation:
- [ ] 30+ tests written
- [ ] All tests passing
- [ ] Code coverage > 85%
- [ ] Edge cases covered

---

## Task 7: Integration & Documentation
**Status**: Depends on Task 6  
**Estimated time**: 3-4 hours  
**Dependencies**: Task 6

### What to do:
1. Export parser in `packages/core/src/index.ts`
   ```typescript
   export { Parser, parse } from './parser';
   export * from './ast';
   ```

2. Create integration tests
   - Tokenizer → Parser → AST flow
   - End-to-end examples

3. Create documentation
   - API documentation in JSDoc
   - Usage examples
   - Troubleshooting guide

4. Commit to GitHub

### Files to update:
```
packages/core/src/index.ts (add exports)
docs/parser-guide.md (create new)
```

### Validation:
- [ ] All exports working
- [ ] Integration tests passing
- [ ] Documentation complete
- [ ] GitHub commit successful

---

## Task 8: Performance Optimization & Polish
**Status**: Depends on Task 7  
**Estimated time**: 2-3 hours  
**Dependencies**: Task 7

### What to do:
1. Benchmark parser performance
   - Parse large files (10k+ lines)
   - Measure memory usage
   - Identify bottlenecks

2. Optimize hot paths
   - Cache token type checks
   - Reduce allocations
   - Optimize recursion

3. Code cleanup
   - Remove console.log statements
   - Add missing JSDoc comments
   - Fix linting issues

4. Final testing
   - Run full test suite
   - Type checking: 0 errors
   - Linting: 0 errors

### Validation:
- [ ] Performance benchmarks recorded
- [ ] No memory leaks
- [ ] Clean code passing all checks
- [ ] Ready for Phase 1.4

---

## Implementation Order

### Recommended sequence:
1. ✅ Task 1: AST Types (2-3h)
2. ✅ Task 2: Parser Class (2-3h)
3. ✅ Task 3: Expression Parsing (6-8h) ← **Longest**
4. ✅ Task 4: Statement Parsing (6-8h) ← **Longest**
5. ✅ Task 5: Program & Error Handling (3-4h)
6. ✅ Task 6: Unit Tests (8-10h) ← **Longest**
7. ✅ Task 7: Integration & Docs (3-4h)
8. ✅ Task 8: Polish (2-3h)

**Total**: 32-43 hours (can be done in 1-2 weeks with 4h/day)

---

## Parallel work possible:
- Tasks 3 & 4 can be worked on together
- Task 6 can start once Task 5 is done
- Task 7 & 8 can overlap

---

## Success Criteria

When complete, you should have:
- ✅ 450+ line parser.ts file
- ✅ 350+ line ast.ts file
- ✅ 30+ passing parser tests
- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors
- ✅ Parse real ZhCode programs correctly
- ✅ Accurate position tracking (line/column)
- ✅ Helpful error messages on parse failures

---

## Next Phase (Phase 1.4: Transpiler)

Once parser is complete, you'll use the AST to generate JavaScript code:

```
ZhCode Source
    ↓
Tokenizer (Phase 1.2) ✅
    ↓
Tokens
    ↓
Parser (Phase 1.3) ← **YOU ARE HERE**
    ↓
AST
    ↓
Transpiler (Phase 1.4)
    ↓
JavaScript
```

The Transpiler will have:
- `transpile(ast: Program): string` - converts AST to JavaScript code
- 30+ transpilation tests
- Support for all language features
- Optional: Source map generation

