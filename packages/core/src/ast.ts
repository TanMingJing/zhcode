/**
 * Abstract Syntax Tree (AST) Node Definitions
 * Defines all node types used by the ZhCode parser
 */

/**
 * Base interface for all AST nodes
 */
export interface ASTNode {
  type: string;
  line: number;
  column: number;
  start: number;
  end: number;
}

/**
 * Program node - root of the AST
 */
export interface Program extends ASTNode {
  type: 'Program';
  body: Statement[];
}

// ============================================================================
// STATEMENT NODES
// ============================================================================

/**
 * Variable declaration statement (令 x = 10; or 常量 PI = 3.14159;)
 */
export interface VariableDeclaration extends ASTNode {
  type: 'VariableDeclaration';
  kind: 'let' | 'const';
  declarations: VariableDeclarator[];
}

export interface VariableDeclarator extends ASTNode {
  type: 'VariableDeclarator';
  id: Identifier | ArrayPattern;
  init: Expression | null;
}

/**
 * Array pattern for destructuring: [a, b, c]
 */
export interface ArrayPattern extends ASTNode {
  type: 'ArrayPattern';
  elements: (Identifier | null)[]; // null for holes like [a, , c]
}

/**
 * Function declaration statement (函数 name(params) { body })
 */
export interface FunctionDeclaration extends ASTNode {
  type: 'FunctionDeclaration';
  id: Identifier;
  params: Identifier[];
  body: BlockStatement;
}

/**
 * Block statement ({ statements })
 */
export interface BlockStatement extends ASTNode {
  type: 'BlockStatement';
  body: Statement[];
}

/**
 * Expression statement (expr;)
 */
export interface ExpressionStatement extends ASTNode {
  type: 'ExpressionStatement';
  expression: Expression;
}

/**
 * If statement (如果 (test) { consequent } 否则 { alternate })
 */
export interface IfStatement extends ASTNode {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

/**
 * While loop statement (当 (test) { body })
 */
export interface WhileStatement extends ASTNode {
  type: 'WhileStatement';
  test: Expression;
  body: Statement;
}

/**
 * For loop statement (对于 (init; test; update) { body })
 */
export interface ForStatement extends ASTNode {
  type: 'ForStatement';
  init: VariableDeclaration | Expression | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}

/**
 * Return statement (返回 value;)
 */
export interface ReturnStatement extends ASTNode {
  type: 'ReturnStatement';
  argument: Expression | null;
}

/**
 * Break statement (破;)
 */
export interface BreakStatement extends ASTNode {
  type: 'BreakStatement';
}

/**
 * Continue statement (续;)
 */
export interface ContinueStatement extends ASTNode {
  type: 'ContinueStatement';
}

/**
 * Import declaration (导入 { specifiers } 从 './module';)
 */
export interface ImportDeclaration extends ASTNode {
  type: 'ImportDeclaration';
  specifiers: ImportSpecifier[];
  source: Literal;
}

export interface ImportSpecifier extends ASTNode {
  type: 'ImportSpecifier';
  imported: Identifier;
  local: Identifier;
}

/**
 * Export declaration (导出 func; or 导出 default func;)
 */
export interface ExportDeclaration extends ASTNode {
  type: 'ExportDeclaration';
  declaration: Statement;
  isDefault: boolean;
}

/**
 * Union of all statement types
 */
export type Statement =
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

// ============================================================================
// EXPRESSION NODES
// ============================================================================

/**
 * Binary expression (a + b, x > 0, etc.)
 */
export interface BinaryExpression extends ASTNode {
  type: 'BinaryExpression';
  operator:
    | '+'
    | '-'
    | '*'
    | '/'
    | '%'
    | '**'
    | '>'
    | '<'
    | '>='
    | '<='
    | '=='
    | '!='
    | '==='
    | '!=='
    | '&&'
    | '||';
  left: Expression;
  right: Expression;
}

/**
 * Unary expression (-x, !flag, ~bits, 非 condition)
 */
export interface UnaryExpression extends ASTNode {
  type: 'UnaryExpression';
  operator: '-' | '+' | '!' | '~' | '非';
  prefix: boolean;
  argument: Expression;
}

/**
 * Assignment expression (x = 5, count += 1)
 */
export interface AssignmentExpression extends ASTNode {
  type: 'AssignmentExpression';
  operator: '=' | '+=' | '-=' | '*=' | '/=' | '%=';
  left: Expression;
  right: Expression;
}

/**
 * Function call expression (func(), func(a, b))
 */
export interface CallExpression extends ASTNode {
  type: 'CallExpression';
  callee: Expression;
  arguments: Expression[];
}

/**
 * Member access expression (obj.prop, arr[0])
 */
export interface MemberExpression extends ASTNode {
  type: 'MemberExpression';
  object: Expression;
  property: Expression;
  computed: boolean; // true for obj[prop], false for obj.prop
}

/**
 * Arrow function expression (x => x * 2, (a, b) => a + b)
 */
export interface ArrowFunctionExpression extends ASTNode {
  type: 'ArrowFunctionExpression';
  params: Identifier[];
  body: Expression | BlockStatement;
}

/**
 * Conditional/ternary expression (test ? consequent : alternate)
 */
export interface ConditionalExpression extends ASTNode {
  type: 'ConditionalExpression';
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}

/**
 * Array literal expression ([1, 2, 3])
 */
export interface ArrayExpression extends ASTNode {
  type: 'ArrayExpression';
  elements: (Expression | null)[];
}

/**
 * Object literal expression ({ key: value })
 */
export interface ObjectExpression extends ASTNode {
  type: 'ObjectExpression';
  properties: Property[];
}

export interface Property extends ASTNode {
  type: 'Property';
  key: Expression;
  value: Expression;
  computed: boolean;
  shorthand: boolean;
}

/**
 * Template literal expression (`hello ${name}`)
 */
export interface TemplateLiteral extends ASTNode {
  type: 'TemplateLiteral';
  quasis: TemplateElement[];
  expressions: Expression[];
}

export interface TemplateElement extends ASTNode {
  type: 'TemplateElement';
  value: string;
  tail: boolean;
}

/**
 * Identifier (variable/function name)
 */
export interface Identifier extends ASTNode {
  type: 'Identifier';
  name: string;
}

/**
 * Literal value (123, "string", true, null)
 */
export interface Literal extends ASTNode {
  type: 'Literal';
  value: string | number | boolean | null;
  raw: string;
}

/**
 * Union of all expression types
 */
export type Expression =
  | BinaryExpression
  | UnaryExpression
  | AssignmentExpression
  | CallExpression
  | MemberExpression
  | ArrowFunctionExpression
  | ConditionalExpression
  | ArrayExpression
  | ObjectExpression
  | TemplateLiteral
  | JSXElement
  | JSXFragment
  | Identifier
  | Literal;

/**
 * Union of all AST node types
 */
export type ASTNodeType = Program | Statement | Expression | ASTNode;

// ============================================================================
// JSX NODES
// ============================================================================

/**
 * JSX Element node (<Component prop="value">children</Component>)
 */
export interface JSXElement extends ASTNode {
  type: 'JSXElement';
  openingElement: JSXOpeningElement;
  closingElement: JSXClosingElement | null;
  children: (JSXElement | JSXText | Expression)[];
}

/**
 * JSX Fragment node (<>children</>)
 */
export interface JSXFragment extends ASTNode {
  type: 'JSXFragment';
  children: (JSXElement | JSXText | Expression)[];
}

/**
 * JSX Opening Element (<Component prop="value">)
 */
export interface JSXOpeningElement extends ASTNode {
  type: 'JSXOpeningElement';
  name: JSXIdentifier | JSXMemberExpression;
  attributes: JSXAttribute[];
  selfClosing: boolean;
}

/**
 * JSX Closing Element (</Component>)
 */
export interface JSXClosingElement extends ASTNode {
  type: 'JSXClosingElement';
  name: JSXIdentifier | JSXMemberExpression;
}

/**
 * JSX Identifier (Component or 按钮)
 */
export interface JSXIdentifier extends ASTNode {
  type: 'JSXIdentifier';
  name: string;
}

/**
 * JSX Member Expression (Module.Component)
 */
export interface JSXMemberExpression extends ASTNode {
  type: 'JSXMemberExpression';
  object: JSXIdentifier | JSXMemberExpression;
  property: JSXIdentifier;
}

/**
 * JSX Attribute (prop="value" or prop={expression})
 */
export interface JSXAttribute extends ASTNode {
  type: 'JSXAttribute';
  name: JSXIdentifier;
  value: JSXAttributeValue | null;
}

/**
 * JSX Attribute Value
 */
export type JSXAttributeValue = Literal | JSXExpressionContainer;

/**
 * JSX Expression Container ({expression})
 */
export interface JSXExpressionContainer extends ASTNode {
  type: 'JSXExpressionContainer';
  expression: Expression;
}

/**
 * JSX Text node
 */
export interface JSXText extends ASTNode {
  type: 'JSXText';
  value: string;
}
