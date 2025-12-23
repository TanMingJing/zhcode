"use strict";
/**
 * ZhCode Transpiler
 * Converts AST to JavaScript code
 * Supports both Chinese and English punctuation marks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transpiler = void 0;
class Transpiler {
    constructor() {
        this.indentLevel = 0;
        this.INDENT_SIZE = 2;
    }
    /**
     * Main transpilation entry point
     */
    transpile(program) {
        const statements = program.body
            .map((stmt) => this.transpileStatement(stmt))
            .filter((s) => s.length > 0);
        return statements.join('\n');
    }
    /**
     * Transpile a single statement
     */
    transpileStatement(stmt) {
        switch (stmt.type) {
            case 'VariableDeclaration':
                return this.transpileVariableDeclaration(stmt);
            case 'FunctionDeclaration':
                return this.transpileFunctionDeclaration(stmt);
            case 'IfStatement':
                return this.transpileIfStatement(stmt);
            case 'WhileStatement':
                return this.transpileWhileStatement(stmt);
            case 'ForStatement':
                return this.transpileForStatement(stmt);
            case 'BlockStatement':
                return this.transpileBlockStatement(stmt);
            case 'ReturnStatement':
                return this.transpileReturnStatement(stmt);
            case 'BreakStatement':
                return this.transpileBreakStatement();
            case 'ContinueStatement':
                return this.transpilelContinueStatement();
            case 'ExpressionStatement':
                return this.transpileExpressionStatement(stmt);
            default:
                return '';
        }
    }
    /**
     * Transpile variable declaration (令 x = 10;)
     */
    transpileVariableDeclaration(decl) {
        const declarations = decl.declarations
            .map((d) => {
            let id;
            // Handle both Identifier and ArrayPattern
            if (d.id.type === 'ArrayPattern') {
                id = this.transpileArrayPattern(d.id);
            }
            else {
                id = this.transpileIdentifier(d.id);
            }
            const init = d.init ? ` = ${this.transpileExpression(d.init)}` : '';
            return `${id}${init}`;
        })
            .join(', ');
        return `${this.indent()}${decl.kind} ${declarations};`;
    }
    /**
     * Transpile array destructuring pattern: [a, b, c]
     */
    transpileArrayPattern(pattern) {
        const elements = pattern.elements
            .map((el) => {
            if (el === null)
                return ''; // hole in pattern
            return this.transpileIdentifier(el);
        })
            .join(', ');
        return `[${elements}]`;
    }
    /**
     * Transpile function declaration
     */
    transpileFunctionDeclaration(decl) {
        const name = this.transpileIdentifier(decl.id);
        const params = decl.params
            .map((p) => this.transpileIdentifier(p))
            .join(', ');
        const body = this.transpileBlockStatement(decl.body);
        return `${this.indent()}function ${name}(${params}) ${body}`;
    }
    /**
     * Transpile if statement
     */
    transpileIfStatement(stmt) {
        const condition = this.transpileExpression(stmt.test);
        const consequent = this.transpileStatement(stmt.consequent);
        let result = `${this.indent()}if (${condition}) ${consequent}`;
        if (stmt.alternate) {
            const alternate = this.transpileStatement(stmt.alternate);
            result += ` else ${alternate}`;
        }
        return result;
    }
    /**
     * Transpile while statement
     */
    transpileWhileStatement(stmt) {
        const condition = this.transpileExpression(stmt.test);
        const body = this.transpileStatement(stmt.body);
        return `${this.indent()}while (${condition}) ${body}`;
    }
    /**
     * Transpile for statement
     */
    transpileForStatement(stmt) {
        let init = '';
        if (stmt.init) {
            if (stmt.init.type === 'VariableDeclaration') {
                // For variable declarations in init, omit the semicolon
                const decl = stmt.init;
                const declarations = decl.declarations
                    .map((d) => {
                    const id = this.transpileIdentifier(d.id);
                    const initVal = d.init ? ` = ${this.transpileExpression(d.init)}` : '';
                    return `${id}${initVal}`;
                })
                    .join(', ');
                init = `${decl.kind} ${declarations}`;
            }
            else {
                init = this.transpileExpression(stmt.init);
            }
        }
        const test = stmt.test ? this.transpileExpression(stmt.test) : '';
        const update = stmt.update ? this.transpileExpression(stmt.update) : '';
        const body = this.transpileStatement(stmt.body);
        return `${this.indent()}for (${init}; ${test}; ${update}) ${body}`;
    }
    /**
     * Transpile block statement ({ ... })
     */
    transpileBlockStatement(stmt) {
        this.indentLevel++;
        const statements = stmt.body
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
    transpileReturnStatement(stmt) {
        const value = stmt.argument ? ` ${this.transpileExpression(stmt.argument)}` : '';
        return `${this.indent()}return${value};`;
    }
    /**
     * Transpile break statement
     */
    transpileBreakStatement() {
        return `${this.indent()}break;`;
    }
    /**
     * Transpile continue statement
     */
    transpilelContinueStatement() {
        return `${this.indent()}continue;`;
    }
    /**
     * Transpile expression statement
     */
    transpileExpressionStatement(stmt) {
        return `${this.indent()}${this.transpileExpression(stmt.expression)};`;
    }
    /**
     * Transpile an expression
     */
    transpileExpression(expr) {
        switch (expr.type) {
            case 'BinaryExpression':
                return this.transpileBinaryExpression(expr);
            case 'UnaryExpression':
                return this.transpileUnaryExpression(expr);
            case 'AssignmentExpression':
                return this.transpileAssignmentExpression(expr);
            case 'CallExpression':
                return this.transpileCallExpression(expr);
            case 'MemberExpression':
                return this.transpileMemberExpression(expr);
            case 'ConditionalExpression':
                return this.transpileConditionalExpression(expr);
            case 'ArrayExpression':
                return this.transpileArrayExpression(expr);
            case 'ObjectExpression':
                return this.transpileObjectExpression(expr);
            case 'JSXElement':
                return this.transpileJSXElement(expr);
            case 'JSXFragment':
                return this.transpileJSXFragment(expr);
            case 'Identifier':
                return this.transpileIdentifier(expr);
            case 'Literal':
                return this.transpileLiteral(expr);
            default:
                return '';
        }
    }
    /**
     * Transpile binary expression (a + b)
     */
    transpileBinaryExpression(expr) {
        const left = this.transpileExpression(expr.left);
        const right = this.transpileExpression(expr.right);
        return `${left} ${expr.operator} ${right}`;
    }
    /**
     * Transpile unary expression (!x, -y)
     */
    transpileUnaryExpression(expr) {
        const arg = this.transpileExpression(expr.argument);
        return expr.prefix ? `${expr.operator}${arg}` : `${arg}${expr.operator}`;
    }
    /**
     * Transpile assignment expression (x = 10)
     */
    transpileAssignmentExpression(expr) {
        const left = this.transpileExpression(expr.left);
        const right = this.transpileExpression(expr.right);
        return `${left} ${expr.operator} ${right}`;
    }
    /**
     * Transpile function call (add(1, 2))
     */
    transpileCallExpression(expr) {
        const callee = this.transpileExpression(expr.callee);
        const args = expr.arguments
            .map((arg) => this.transpileExpression(arg))
            .join(', ');
        return `${callee}(${args})`;
    }
    /**
     * Transpile member expression (obj.prop or arr[0])
     */
    transpileMemberExpression(expr) {
        const object = this.transpileExpression(expr.object);
        const property = this.transpileExpression(expr.property);
        if (expr.computed) {
            return `${object}[${property}]`;
        }
        return `${object}.${property}`;
    }
    /**
     * Transpile conditional expression (x > 0 ? 1 : -1)
     */
    transpileConditionalExpression(expr) {
        const test = this.transpileExpression(expr.test);
        const consequent = this.transpileExpression(expr.consequent);
        const alternate = this.transpileExpression(expr.alternate);
        return `${test} ? ${consequent} : ${alternate}`;
    }
    /**
     * Transpile array expression ([1, 2, 3])
     */
    transpileArrayExpression(expr) {
        const elements = expr.elements
            .map((elem) => this.transpileExpression(elem))
            .join(', ');
        return `[${elements}]`;
    }
    /**
     * Transpile object expression ({ key: value })
     */
    transpileObjectExpression(expr) {
        const properties = expr.properties
            .map((prop) => {
            const key = this.transpileExpression(prop.key);
            const value = this.transpileExpression(prop.value);
            return `${key}: ${value}`;
        })
            .join(', ');
        return `{ ${properties} }`;
    }
    /**
     * Transpile identifier (variable name)
     */
    transpileIdentifier(expr) {
        return expr.name;
    }
    /**
     * Transpile literal (number, string, boolean)
     */
    transpileLiteral(expr) {
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
     * Transpile JSX Element to React.createElement()
     */
    transpileJSXElement(element) {
        const tagName = this.transpileJSXName(element.openingElement.name);
        const attributes = this.transpileJSXAttributes(element.openingElement.attributes);
        const children = element.children.map(child => {
            if ('type' in child && child.type === 'JSXText') {
                return `"${child.value}"`;
            }
            else if ('type' in child && child.type === 'JSXElement') {
                return this.transpileJSXElement(child);
            }
            else {
                return this.transpileExpression(child);
            }
        });
        const childrenStr = children.length > 0 ? `, ${children.join(', ')}` : '';
        return `React.createElement(${tagName}, ${attributes}${childrenStr})`;
    }
    /**
     * Transpile JSX Fragment to React.Fragment
     */
    transpileJSXFragment(fragment) {
        const children = fragment.children.map(child => {
            if ('type' in child && child.type === 'JSXText') {
                return `"${child.value}"`;
            }
            else if ('type' in child && child.type === 'JSXElement') {
                return this.transpileJSXElement(child);
            }
            else {
                return this.transpileExpression(child);
            }
        });
        const childrenStr = children.length > 0 ? `, ${children.join(', ')}` : '';
        return `React.createElement(React.Fragment, null${childrenStr})`;
    }
    /**
     * Transpile JSX element name
     */
    transpileJSXName(name) {
        if (name.type === 'JSXIdentifier') {
            return `"${name.name}"`;
        }
        else {
            const object = this.transpileJSXName(name.object);
            const property = name.property.name;
            return `${object}.${property}`;
        }
    }
    /**
     * Transpile JSX attributes to object
     */
    transpileJSXAttributes(attributes) {
        if (attributes.length === 0) {
            return 'null';
        }
        const props = attributes.map(attr => {
            const key = attr.name.name;
            let value = 'true'; // default value if no value specified
            if (attr.value) {
                if (attr.value.type === 'Literal') {
                    value = `"${attr.value.value}"`;
                }
                else if (attr.value.type === 'JSXExpressionContainer') {
                    value = this.transpileExpression(attr.value.expression);
                }
            }
            return `${key}: ${value}`;
        });
        return `{ ${props.join(', ')} }`;
    }
    /**
     * Get indentation string based on current level
     */
    indent() {
        return ' '.repeat(this.indentLevel * this.INDENT_SIZE);
    }
}
exports.Transpiler = Transpiler;
