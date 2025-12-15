# zhcode AST (Abstract Syntax Tree) Design

## Overview

The AST represents the syntactic structure of zhcode source code in a tree format. The parser converts the token stream (from Tokenizer) into this AST, which the Transpiler then converts to JavaScript.

**Flow**: `Source Code` → `Tokenizer` → `Tokens` → `Parser` → `AST` → `Transpiler` → `JavaScript`

---

## 1. Core AST Node Types

### 1.1 Base Node Interface
```typescript
interface ASTNode {
  type: string;                    // Node type name
  line: number;                    // Line number in source
  column: number;                  // Column number in source
  start: number;                   // Absolute start position
  end: number;                     // Absolute end position
}
```

### 1.2 Program (Root Node)
```typescript
interface Program extends ASTNode {
  type: 'Program';
  body: Statement[];               // Array of statements
}

// Example AST:
{
  type: 'Program',
  body: [
    { type: 'VariableDeclaration', ... },
    { type: 'FunctionDeclaration', ... },
    { type: 'ExpressionStatement', ... }
  ]
}
```

---

## 2. Statement Nodes

### 2.1 VariableDeclaration
```typescript
interface VariableDeclaration extends ASTNode {
  type: 'VariableDeclaration';
  kind: 'let' | 'const';           // 令 | 常量
  declarations: VariableDeclarator[];
}

interface VariableDeclarator extends ASTNode {
  type: 'VariableDeclarator';
  id: Identifier;                  // Variable name
  init: Expression | null;         // Initialization value
}

// Example: 令 x = 10;
{
  type: 'VariableDeclaration',
  kind: 'let',
  declarations: [{
    type: 'VariableDeclarator',
    id: { type: 'Identifier', name: 'x' },
    init: { type: 'Literal', value: 10, raw: '10' }
  }]
}
```

### 2.2 FunctionDeclaration
```typescript
interface FunctionDeclaration extends ASTNode {
  type: 'FunctionDeclaration';
  id: Identifier;                  // Function name
  params: Identifier[];            // Parameters
  body: BlockStatement;            // Function body
}

// Example: 函数 add(a, b) { 返回 a + b; }
{
  type: 'FunctionDeclaration',
  id: { type: 'Identifier', name: 'add' },
  params: [
    { type: 'Identifier', name: 'a' },
    { type: 'Identifier', name: 'b' }
  ],
  body: {
    type: 'BlockStatement',
    body: [{
      type: 'ReturnStatement',
      argument: {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' }
      }
    }]
  }
}
```

### 2.3 BlockStatement
```typescript
interface BlockStatement extends ASTNode {
  type: 'BlockStatement';
  body: Statement[];               // Statements inside block
}
```

### 2.4 ExpressionStatement
```typescript
interface ExpressionStatement extends ASTNode {
  type: 'ExpressionStatement';
  expression: Expression;          // The expression
}

// Example: x = 5;
{
  type: 'ExpressionStatement',
  expression: {
    type: 'AssignmentExpression',
    operator: '=',
    left: { type: 'Identifier', name: 'x' },
    right: { type: 'Literal', value: 5 }
  }
}
```

### 2.5 IfStatement
```typescript
interface IfStatement extends ASTNode {
  type: 'IfStatement';
  test: Expression;                // Condition
  consequent: Statement;           // Then branch
  alternate: Statement | null;     // Else branch
}

// Example: 如果 (x > 0) { ... } 否则 { ... }
{
  type: 'IfStatement',
  test: {
    type: 'BinaryExpression',
    operator: '>',
    left: { type: 'Identifier', name: 'x' },
    right: { type: 'Literal', value: 0 }
  },
  consequent: { type: 'BlockStatement', body: [...] },
  alternate: { type: 'BlockStatement', body: [...] }
}
```

### 2.6 WhileStatement
```typescript
interface WhileStatement extends ASTNode {
  type: 'WhileStatement';
  test: Expression;                // Loop condition
  body: Statement;                 // Loop body
}

// Example: 当 (x < 10) { x = x + 1; }
{
  type: 'WhileStatement',
  test: {
    type: 'BinaryExpression',
    operator: '<',
    left: { type: 'Identifier', name: 'x' },
    right: { type: 'Literal', value: 10 }
  },
  body: { type: 'BlockStatement', body: [...] }
}
```

### 2.7 ForStatement
```typescript
interface ForStatement extends ASTNode {
  type: 'ForStatement';
  init: VariableDeclaration | Expression | null;  // Initialization
  test: Expression | null;         // Loop condition
  update: Expression | null;       // Update expression
  body: Statement;                 // Loop body
}

// Example: 对于 (令 i = 0; i < 10; i = i + 1) { ... }
{
  type: 'ForStatement',
  init: {
    type: 'VariableDeclaration',
    kind: 'let',
    declarations: [...]
  },
  test: { type: 'BinaryExpression', ... },
  update: { type: 'AssignmentExpression', ... },
  body: { type: 'BlockStatement', body: [...] }
}
```

### 2.8 ReturnStatement
```typescript
interface ReturnStatement extends ASTNode {
  type: 'ReturnStatement';
  argument: Expression | null;     // Return value (null if no value)
}

// Example: 返回 x + 1;
{
  type: 'ReturnStatement',
  argument: {
    type: 'BinaryExpression',
    operator: '+',
    left: { type: 'Identifier', name: 'x' },
    right: { type: 'Literal', value: 1 }
  }
}
```

### 2.9 BreakStatement & ContinueStatement
```typescript
interface BreakStatement extends ASTNode {
  type: 'BreakStatement';
}

interface ContinueStatement extends ASTNode {
  type: 'ContinueStatement';
}
```

### 2.10 ImportDeclaration & ExportDeclaration
```typescript
interface ImportDeclaration extends ASTNode {
  type: 'ImportDeclaration';
  specifiers: ImportSpecifier[];   // What to import
  source: Literal;                 // From where (module name)
}

interface ImportSpecifier extends ASTNode {
  type: 'ImportSpecifier';
  imported: Identifier;            // Original name
  local: Identifier;               // Local alias
}

// Example: 导入 { 函数 } 从 './module.js';
{
  type: 'ImportDeclaration',
  specifiers: [{
    type: 'ImportSpecifier',
    imported: { type: 'Identifier', name: '函数' },
    local: { type: 'Identifier', name: '函数' }
  }],
  source: { type: 'Literal', value: './module.js' }
}

interface ExportDeclaration extends ASTNode {
  type: 'ExportDeclaration';
  declaration: Statement;          // What to export
  isDefault: boolean;              // 默认 export?
}
```

---

## 3. Expression Nodes

### 3.1 BinaryExpression
```typescript
interface BinaryExpression extends ASTNode {
  type: 'BinaryExpression';
  operator: '+' | '-' | '*' | '/' | '%' | '>' | '<' | '>=' | '<=' | '==' | '!=' | '===' | '!==' | '&&' | '||';
  left: Expression;                // Left operand
  right: Expression;               // Right operand
}

// Example: a + b
{
  type: 'BinaryExpression',
  operator: '+',
  left: { type: 'Identifier', name: 'a' },
  right: { type: 'Identifier', name: 'b' }
}
```

### 3.2 UnaryExpression
```typescript
interface UnaryExpression extends ASTNode {
  type: 'UnaryExpression';
  operator: '-' | '+' | '!' | '~' | '非';  // Unary operators
  prefix: boolean;                 // Is prefix (true) or postfix (false)
  argument: Expression;            // Operand
}

// Example: !x (logical not / 非)
{
  type: 'UnaryExpression',
  operator: '!',
  prefix: true,
  argument: { type: 'Identifier', name: 'x' }
}
```

### 3.3 AssignmentExpression
```typescript
interface AssignmentExpression extends ASTNode {
  type: 'AssignmentExpression';
  operator: '=' | '+=' | '-=' | '*=' | '/=' | '%=';
  left: Expression;                // Assignment target
  right: Expression;               // Value to assign
}

// Example: x = 10
{
  type: 'AssignmentExpression',
  operator: '=',
  left: { type: 'Identifier', name: 'x' },
  right: { type: 'Literal', value: 10 }
}
```

### 3.4 CallExpression
```typescript
interface CallExpression extends ASTNode {
  type: 'CallExpression';
  callee: Expression;              // Function being called
  arguments: Expression[];         // Function arguments
}

// Example: add(1, 2)
{
  type: 'CallExpression',
  callee: { type: 'Identifier', name: 'add' },
  arguments: [
    { type: 'Literal', value: 1 },
    { type: 'Literal', value: 2 }
  ]
}
```

### 3.5 MemberExpression
```typescript
interface MemberExpression extends ASTNode {
  type: 'MemberExpression';
  object: Expression;              // Object
  property: Expression;            // Property
  computed: boolean;               // true for [prop], false for .prop
}

// Example: obj.name
{
  type: 'MemberExpression',
  object: { type: 'Identifier', name: 'obj' },
  property: { type: 'Identifier', name: 'name' },
  computed: false
}

// Example: arr[0]
{
  type: 'MemberExpression',
  object: { type: 'Identifier', name: 'arr' },
  property: { type: 'Literal', value: 0 },
  computed: true
}
```

### 3.6 ArrowFunctionExpression
```typescript
interface ArrowFunctionExpression extends ASTNode {
  type: 'ArrowFunctionExpression';
  params: Identifier[];            // Parameters
  body: Expression | BlockStatement;  // Function body
}

// Example: x => x * 2
{
  type: 'ArrowFunctionExpression',
  params: [{ type: 'Identifier', name: 'x' }],
  body: {
    type: 'BinaryExpression',
    operator: '*',
    left: { type: 'Identifier', name: 'x' },
    right: { type: 'Literal', value: 2 }
  }
}
```

### 3.7 ConditionalExpression (Ternary)
```typescript
interface ConditionalExpression extends ASTNode {
  type: 'ConditionalExpression';
  test: Expression;                // Condition
  consequent: Expression;          // True branch
  alternate: Expression;           // False branch
}

// Example: x > 0 ? "正数" : "非正数"
{
  type: 'ConditionalExpression',
  test: { type: 'BinaryExpression', ... },
  consequent: { type: 'Literal', value: '正数' },
  alternate: { type: 'Literal', value: '非正数' }
}
```

### 3.8 ArrayExpression
```typescript
interface ArrayExpression extends ASTNode {
  type: 'ArrayExpression';
  elements: (Expression | null)[];  // Array elements (null for holes)
}

// Example: [1, 2, 3]
{
  type: 'ArrayExpression',
  elements: [
    { type: 'Literal', value: 1 },
    { type: 'Literal', value: 2 },
    { type: 'Literal', value: 3 }
  ]
}
```

### 3.9 ObjectExpression
```typescript
interface ObjectExpression extends ASTNode {
  type: 'ObjectExpression';
  properties: Property[];
}

interface Property extends ASTNode {
  type: 'Property';
  key: Expression;                 // Property key
  value: Expression;               // Property value
  computed: boolean;               // true for [key]
  shorthand: boolean;              // true for { x } (shorthand)
}

// Example: { 名字: "张三", 年龄: 25 }
{
  type: 'ObjectExpression',
  properties: [
    {
      type: 'Property',
      key: { type: 'Identifier', name: '名字' },
      value: { type: 'Literal', value: '张三' },
      computed: false,
      shorthand: false
    },
    {
      type: 'Property',
      key: { type: 'Identifier', name: '年龄' },
      value: { type: 'Literal', value: 25 },
      computed: false,
      shorthand: false
    }
  ]
}
```

### 3.10 Identifier
```typescript
interface Identifier extends ASTNode {
  type: 'Identifier';
  name: string;                    // Variable/function name
}

// Example: x
{
  type: 'Identifier',
  name: 'x'
}
```

### 3.11 Literal
```typescript
interface Literal extends ASTNode {
  type: 'Literal';
  value: string | number | boolean | null;
  raw: string;                     // Original source text
}

// Example: 123
{
  type: 'Literal',
  value: 123,
  raw: '123'
}

// Example: "字符串"
{
  type: 'Literal',
  value: '字符串',
  raw: '"字符串"'
}

// Example: 真 (true)
{
  type: 'Literal',
  value: true,
  raw: '真'
}
```

### 3.12 TemplateLiteral
```typescript
interface TemplateLiteral extends ASTNode {
  type: 'TemplateLiteral';
  quasis: TemplateElement[];       // String parts
  expressions: Expression[];       // Interpolated expressions
}

interface TemplateElement extends ASTNode {
  type: 'TemplateElement';
  value: string;                   // Template string part
  tail: boolean;                   // Is this the last element?
}

// Example: `值: ${x}`
{
  type: 'TemplateLiteral',
  quasis: [
    { type: 'TemplateElement', value: '值: ', tail: false },
    { type: 'TemplateElement', value: '', tail: true }
  ],
  expressions: [
    { type: 'Identifier', name: 'x' }
  ]
}
```

---

## 4. Type Definitions Summary

```typescript
// Union types for convenience
type Statement = 
  | VariableDeclaration
  | FunctionDeclaration
  | BlockStatement
  | ExpressionStatement
  | IfStatement
  | WhileStatement
  | ForStatement
  | ReturnStatement
  | BreakStatement
  | ContinueStatement
  | ImportDeclaration
  | ExportDeclaration;

type Expression =
  | BinaryExpression
  | UnaryExpression
  | AssignmentExpression
  | CallExpression
  | MemberExpression
  | ArrowFunctionExpression
  | ConditionalExpression
  | ArrayExpression
  | ObjectExpression
  | Identifier
  | Literal
  | TemplateLiteral;
```

---

## 5. Parsing Examples

### Example 1: Simple Variable Declaration
```zhcode
令 x = 10;
```

**Tokens**:
```
[LET, IDENTIFIER(x), ASSIGN, NUMBER(10), SEMICOLON, EOF]
```

**AST**:
```json
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "kind": "let",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": { "type": "Identifier", "name": "x" },
          "init": { "type": "Literal", "value": 10, "raw": "10" }
        }
      ]
    }
  ]
}
```

---

### Example 2: Function Declaration
```zhcode
函数 add(a, b) {
  返回 a + b;
}
```

**Tokens**:
```
[FUNCTION, IDENTIFIER(add), LPAREN, IDENTIFIER(a), COMMA, IDENTIFIER(b), RPAREN, LBRACE, RETURN, IDENTIFIER(a), PLUS, IDENTIFIER(b), SEMICOLON, RBRACE, EOF]
```

**AST**:
```json
{
  "type": "Program",
  "body": [
    {
      "type": "FunctionDeclaration",
      "id": { "type": "Identifier", "name": "add" },
      "params": [
        { "type": "Identifier", "name": "a" },
        { "type": "Identifier", "name": "b" }
      ],
      "body": {
        "type": "BlockStatement",
        "body": [
          {
            "type": "ReturnStatement",
            "argument": {
              "type": "BinaryExpression",
              "operator": "+",
              "left": { "type": "Identifier", "name": "a" },
              "right": { "type": "Identifier", "name": "b" }
            }
          }
        ]
      }
    }
  ]
}
```

---

### Example 3: If Statement with Complex Expression
```zhcode
如果 (x > 0 && y < 10) {
  返回 真;
} 否则 {
  返回 假;
}
```

**AST**:
```json
{
  "type": "Program",
  "body": [
    {
      "type": "IfStatement",
      "test": {
        "type": "BinaryExpression",
        "operator": "&&",
        "left": {
          "type": "BinaryExpression",
          "operator": ">",
          "left": { "type": "Identifier", "name": "x" },
          "right": { "type": "Literal", "value": 0 }
        },
        "right": {
          "type": "BinaryExpression",
          "operator": "<",
          "left": { "type": "Identifier", "name": "y" },
          "right": { "type": "Literal", "value": 10 }
        }
      },
      "consequent": {
        "type": "BlockStatement",
        "body": [
          {
            "type": "ReturnStatement",
            "argument": { "type": "Literal", "value": true, "raw": "真" }
          }
        ]
      },
      "alternate": {
        "type": "BlockStatement",
        "body": [
          {
            "type": "ReturnStatement",
            "argument": { "type": "Literal", "value": false, "raw": "假" }
          }
        ]
      }
    }
  ]
}
```

---

## 6. Operator Precedence

The parser must handle operator precedence correctly:

| Precedence | Operators | Associativity |
|-----------|-----------|---------------|
| 14 (Highest) | `.`, `[]`, `()` | Left-to-right |
| 13 | `**` (Power) | Right-to-left |
| 12 | `-`, `+`, `!`, `~` (Unary) | Right-to-left |
| 11 | `*`, `/`, `%` | Left-to-right |
| 10 | `+`, `-` (Binary) | Left-to-right |
| 9 | `<`, `<=`, `>`, `>=` | Left-to-right |
| 8 | `==`, `!=`, `===`, `!==` | Left-to-right |
| 7 | `&&` (Logical AND) | Left-to-right |
| 6 | `\|\|` (Logical OR) | Left-to-right |
| 5 | `? :` (Ternary) | Right-to-left |
| 4 | `=`, `+=`, `-=`, etc. | Right-to-left |
| 1 (Lowest) | `,` (Comma) | Left-to-right |

**Example**: `2 + 3 * 4` should parse as `2 + (3 * 4) = 14`, not `(2 + 3) * 4 = 20`

---

## 7. Implementation Notes

1. **Recursive Descent Parsing**: Implement one parsing function per precedence level
2. **Error Recovery**: When encountering unexpected tokens, skip and try to resynchronize
3. **Position Tracking**: Each AST node should include line, column, start, end positions
4. **Type Safety**: Use TypeScript interfaces to ensure type safety

---

## Next Steps

1. Create `ast.ts` with all AST node type definitions
2. Create `parser.ts` with recursive descent parser implementation
3. Implement `parseProgram()`, `parseStatement()`, `parseExpression()`
4. Write 30+ parser unit tests
5. Test with real zhcode examples

