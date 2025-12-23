"use strict";
/**
 * Recursive Descent Parser for ZhCode Language
 * Converts token stream into Abstract Syntax Tree (AST)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
exports.parse = parse;
const token_1 = require("./token");
/**
 * ZhCode Parser - converts tokens to AST
 */
class Parser {
    constructor(tokens) {
        this.current = 0;
        this.tokens = tokens;
    }
    /**
     * Main entry point - parse entire program
     */
    parse() {
        const body = [];
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
    parseStatement() {
        // Variable declarations: 令 x = 10; or 常量 x = 10;
        if (this.match(token_1.TokenType.LET, token_1.TokenType.CONST)) {
            return this.parseVariableDeclaration();
        }
        // Function declaration: 函数 name(params) { body }
        if (this.match(token_1.TokenType.FUNCTION)) {
            return this.parseFunctionDeclaration();
        }
        // Block statement: { statements }
        if (this.check(token_1.TokenType.LBRACE)) {
            return this.parseBlock();
        }
        // If statement: 如果 (test) { consequent } 否则 { alternate }
        if (this.match(token_1.TokenType.IF)) {
            return this.parseIfStatement();
        }
        // While loop: 当 (test) { body }
        if (this.match(token_1.TokenType.WHILE)) {
            return this.parseWhileStatement();
        }
        // For loop: 对于 (init; test; update) { body }
        if (this.match(token_1.TokenType.FOR)) {
            return this.parseForStatement();
        }
        // Return statement: 返回 value;
        if (this.match(token_1.TokenType.RETURN)) {
            return this.parseReturnStatement();
        }
        // Break statement: 破;
        if (this.match(token_1.TokenType.BREAK)) {
            return this.parseBreakStatement();
        }
        // Continue statement: 续;
        if (this.match(token_1.TokenType.CONTINUE)) {
            return this.parseContinueStatement();
        }
        // Import declaration: 导入 { specifiers } 从 './module';
        if (this.match(token_1.TokenType.IMPORT)) {
            return this.parseImportDeclaration();
        }
        // Export declaration: 导出 statement;
        if (this.match(token_1.TokenType.EXPORT)) {
            return this.parseExportDeclaration();
        }
        // Default: expression statement (expr;)
        return this.parseExpressionStatement();
    }
    /**
     * Parse variable declaration (令 or 常量)
     */
    parseVariableDeclaration() {
        const kindToken = this.previous();
        const kind = kindToken.type === token_1.TokenType.LET ? 'let' : 'const';
        const declarations = [];
        // Parse first declarator
        declarations.push(this.parseVariableDeclarator());
        // Parse additional declarators (comma-separated)
        while (this.match(token_1.TokenType.COMMA)) {
            declarations.push(this.parseVariableDeclarator());
        }
        // Semicolon is optional if followed by closing brace or EOF
        if (this.check(token_1.TokenType.SEMICOLON)) {
            this.eat(token_1.TokenType.SEMICOLON);
        }
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
     * Parse variable declarator (x = 10 or just x or [a, b] = value)
     */
    parseVariableDeclarator() {
        const startToken = this.peek();
        let id;
        // Check for array destructuring [a, b] = value
        if (this.check(token_1.TokenType.LBRACKET)) {
            id = this.parseArrayPattern();
        }
        else {
            const nameToken = this.eat(token_1.TokenType.IDENTIFIER);
            id = {
                type: 'Identifier',
                name: nameToken.value,
                line: nameToken.line,
                column: nameToken.column,
                start: nameToken.start,
                end: nameToken.end,
            };
        }
        let init = null;
        if (this.match(token_1.TokenType.ASSIGN)) {
            init = this.parseAssignment();
        }
        return {
            type: 'VariableDeclarator',
            id,
            init,
            line: startToken.line,
            column: startToken.column,
            start: startToken.start,
            end: init ? init.end : this.previous().end,
        };
    }
    /**
     * Parse array destructuring pattern: [a, b, c]
     */
    parseArrayPattern() {
        const startToken = this.eat(token_1.TokenType.LBRACKET);
        const elements = [];
        while (!this.check(token_1.TokenType.RBRACKET) && !this.isAtEnd()) {
            if (this.check(token_1.TokenType.COMMA)) {
                elements.push(null); // holes in array pattern
                this.advance();
            }
            else {
                const nameToken = this.eat(token_1.TokenType.IDENTIFIER);
                elements.push({
                    type: 'Identifier',
                    name: nameToken.value,
                    line: nameToken.line,
                    column: nameToken.column,
                    start: nameToken.start,
                    end: nameToken.end,
                });
                if (!this.check(token_1.TokenType.RBRACKET)) {
                    this.eat(token_1.TokenType.COMMA);
                }
            }
        }
        this.eat(token_1.TokenType.RBRACKET);
        return {
            type: 'ArrayPattern',
            elements,
            line: startToken.line,
            column: startToken.column,
            start: startToken.start,
            end: this.previous().end,
        };
    }
    /**
     * Parse function declaration
     */
    parseFunctionDeclaration() {
        const funcToken = this.previous();
        const idToken = this.eat(token_1.TokenType.IDENTIFIER);
        const id = {
            type: 'Identifier',
            name: idToken.value,
            line: idToken.line,
            column: idToken.column,
            start: idToken.start,
            end: idToken.end,
        };
        this.eat(token_1.TokenType.LPAREN);
        const params = [];
        if (!this.check(token_1.TokenType.RPAREN)) {
            do {
                const paramToken = this.eat(token_1.TokenType.IDENTIFIER);
                params.push({
                    type: 'Identifier',
                    name: paramToken.value,
                    line: paramToken.line,
                    column: paramToken.column,
                    start: paramToken.start,
                    end: paramToken.end,
                });
            } while (this.match(token_1.TokenType.COMMA));
        }
        this.eat(token_1.TokenType.RPAREN);
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
    parseBlock() {
        const startToken = this.eat(token_1.TokenType.LBRACE);
        const body = [];
        while (!this.check(token_1.TokenType.RBRACE) && !this.isAtEnd()) {
            const stmt = this.parseStatement();
            if (stmt) {
                body.push(stmt);
            }
        }
        const endToken = this.eat(token_1.TokenType.RBRACE);
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
    parseIfStatement() {
        const ifToken = this.previous();
        this.eat(token_1.TokenType.LPAREN);
        const test = this.parseExpression();
        this.eat(token_1.TokenType.RPAREN);
        const consequent = this.parseStatement();
        let alternate = null;
        if (this.match(token_1.TokenType.ELSE)) {
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
    parseWhileStatement() {
        const whileToken = this.previous();
        this.eat(token_1.TokenType.LPAREN);
        const test = this.parseExpression();
        this.eat(token_1.TokenType.RPAREN);
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
    parseForStatement() {
        const forToken = this.previous();
        this.eat(token_1.TokenType.LPAREN);
        let init = null;
        if (this.match(token_1.TokenType.LET, token_1.TokenType.CONST)) {
            init = this.parseVariableDeclaration();
            // Remove the semicolon handling since parseVariableDeclaration eats it
        }
        else if (!this.check(token_1.TokenType.SEMICOLON)) {
            init = this.parseExpression();
            this.eat(token_1.TokenType.SEMICOLON);
        }
        else {
            this.eat(token_1.TokenType.SEMICOLON);
        }
        let test = null;
        if (!this.check(token_1.TokenType.SEMICOLON)) {
            test = this.parseExpression();
        }
        this.eat(token_1.TokenType.SEMICOLON);
        let update = null;
        if (!this.check(token_1.TokenType.RPAREN)) {
            update = this.parseExpression();
        }
        this.eat(token_1.TokenType.RPAREN);
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
    parseReturnStatement() {
        const returnToken = this.previous();
        let argument = null;
        if (!this.check(token_1.TokenType.SEMICOLON) && !this.check(token_1.TokenType.RBRACE) && !this.isAtEnd()) {
            argument = this.parseExpression();
        }
        // Semicolon is optional if followed by closing brace or EOF
        if (this.check(token_1.TokenType.SEMICOLON)) {
            this.eat(token_1.TokenType.SEMICOLON);
        }
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
    parseBreakStatement() {
        const breakToken = this.previous();
        // Semicolon is optional if followed by closing brace or EOF
        if (this.check(token_1.TokenType.SEMICOLON)) {
            this.eat(token_1.TokenType.SEMICOLON);
        }
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
    parseContinueStatement() {
        const continueToken = this.previous();
        // Semicolon is optional if followed by closing brace or EOF
        if (this.check(token_1.TokenType.SEMICOLON)) {
            this.eat(token_1.TokenType.SEMICOLON);
        }
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
    parseImportDeclaration() {
        const importToken = this.previous();
        const specifiers = [];
        this.eat(token_1.TokenType.LBRACE);
        if (!this.check(token_1.TokenType.RBRACE)) {
            do {
                const importedToken = this.eat(token_1.TokenType.IDENTIFIER);
                const imported = {
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
            } while (this.match(token_1.TokenType.COMMA));
        }
        this.eat(token_1.TokenType.RBRACE);
        this.eat(token_1.TokenType.FROM);
        const sourceToken = this.eat(token_1.TokenType.STRING);
        const source = {
            type: 'Literal',
            value: sourceToken.value,
            raw: sourceToken.value,
            line: sourceToken.line,
            column: sourceToken.column,
            start: sourceToken.start,
            end: sourceToken.end,
        };
        this.eat(token_1.TokenType.SEMICOLON);
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
    parseExportDeclaration() {
        const exportToken = this.previous();
        const isDefault = this.match(token_1.TokenType.DEFAULT);
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
    parseExpressionStatement() {
        const expr = this.parseExpression();
        // Semicolon is optional if followed by closing brace or EOF
        if (this.check(token_1.TokenType.SEMICOLON)) {
            this.eat(token_1.TokenType.SEMICOLON);
        }
        return {
            type: 'ExpressionStatement',
            expression: expr,
            line: expr.line,
            column: expr.column,
            start: expr.start,
            end: expr.end,
        };
    }
    /**
     * Parse expression (entry point for expression parsing)
     */
    parseExpression() {
        return this.parseAssignment();
    }
    /**
     * Parse assignment expression (x = 5, count += 1)
     * Lowest precedence
     */
    parseAssignment() {
        let expr = this.parseTernary();
        if (this.match(token_1.TokenType.ASSIGN, token_1.TokenType.PLUS_ASSIGN, token_1.TokenType.MINUS_ASSIGN, token_1.TokenType.MULTIPLY_ASSIGN, token_1.TokenType.DIVIDE_ASSIGN, token_1.TokenType.MODULO_ASSIGN)) {
            const operator = this.previous().value;
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
    parseTernary() {
        let expr = this.parseLogicalOr();
        if (this.match(token_1.TokenType.QUESTION)) {
            const consequent = this.parseAssignment();
            this.eat(token_1.TokenType.COLON);
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
    parseLogicalOr() {
        let expr = this.parseLogicalAnd();
        while (this.match(token_1.TokenType.LOGICAL_OR)) {
            const operator = '||';
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
    parseLogicalAnd() {
        let expr = this.parseEquality();
        while (this.match(token_1.TokenType.LOGICAL_AND)) {
            const operator = '&&';
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
    parseEquality() {
        let expr = this.parseComparison();
        while (this.match(token_1.TokenType.EQUALS, token_1.TokenType.NOT_EQUALS, token_1.TokenType.STRICT_EQUALS, token_1.TokenType.STRICT_NOT_EQUALS)) {
            const operator = this.previous().value;
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
    parseComparison() {
        let expr = this.parseAdditive();
        while (this.match(token_1.TokenType.GREATER_THAN, token_1.TokenType.GREATER_EQUAL, token_1.TokenType.LESS_THAN, token_1.TokenType.LESS_EQUAL)) {
            const operator = this.previous().value;
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
    parseAdditive() {
        let expr = this.parseMultiplicative();
        while (this.match(token_1.TokenType.PLUS, token_1.TokenType.MINUS)) {
            const operator = this.previous().value;
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
    parseMultiplicative() {
        let expr = this.parsePower();
        while (this.match(token_1.TokenType.MULTIPLY, token_1.TokenType.DIVIDE, token_1.TokenType.MODULO)) {
            const operator = this.previous().value;
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
    parsePower() {
        let expr = this.parseUnary();
        if (this.match(token_1.TokenType.POWER)) {
            const operator = '**';
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
    parseUnary() {
        if (this.match(token_1.TokenType.MINUS, token_1.TokenType.PLUS, token_1.TokenType.LOGICAL_NOT)) {
            const operator = this.previous().value;
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
    parseCallMember() {
        let expr = this.parseAtom();
        while (this.check(token_1.TokenType.LPAREN) || this.check(token_1.TokenType.DOT) || this.check(token_1.TokenType.LBRACKET)) {
            if (this.match(token_1.TokenType.LPAREN)) {
                // Function call: expr()
                const args = [];
                if (!this.check(token_1.TokenType.RPAREN)) {
                    do {
                        args.push(this.parseAssignment());
                    } while (this.match(token_1.TokenType.COMMA));
                }
                const endToken = this.eat(token_1.TokenType.RPAREN);
                expr = {
                    type: 'CallExpression',
                    callee: expr,
                    arguments: args,
                    line: expr.line,
                    column: expr.column,
                    start: expr.start,
                    end: endToken.end,
                };
            }
            else if (this.match(token_1.TokenType.DOT)) {
                // Member access: expr.prop
                const propToken = this.eat(token_1.TokenType.IDENTIFIER);
                const property = {
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
            }
            else if (this.match(token_1.TokenType.LBRACKET)) {
                // Member access: expr[prop]
                const property = this.parseExpression();
                const endToken = this.eat(token_1.TokenType.RBRACKET);
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
            }
            else {
                break;
            }
        }
        return expr;
    }
    /**
     * Parse primary/atom expression (numbers, strings, identifiers, etc.)
     */
    parseAtom() {
        // Literals: numbers, strings, booleans
        if (this.match(token_1.TokenType.NUMBER)) {
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
        if (this.match(token_1.TokenType.STRING)) {
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
        if (this.match(token_1.TokenType.TRUE)) {
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
        if (this.match(token_1.TokenType.FALSE)) {
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
        if (this.match(token_1.TokenType.NULL)) {
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
        if (this.match(token_1.TokenType.IDENTIFIER)) {
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
        if (this.match(token_1.TokenType.LBRACKET)) {
            const startToken = this.previous();
            const elements = [];
            if (!this.check(token_1.TokenType.RBRACKET)) {
                do {
                    if (this.check(token_1.TokenType.COMMA)) {
                        elements.push(null); // Hole in array
                    }
                    else {
                        elements.push(this.parseAssignment());
                    }
                } while (this.match(token_1.TokenType.COMMA) && !this.check(token_1.TokenType.RBRACKET));
            }
            const endToken = this.eat(token_1.TokenType.RBRACKET);
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
        if (this.match(token_1.TokenType.LBRACE)) {
            const startToken = this.previous();
            const properties = [];
            if (!this.check(token_1.TokenType.RBRACE)) {
                do {
                    const keyToken = this.eat(token_1.TokenType.IDENTIFIER);
                    const key = {
                        type: 'Identifier',
                        name: keyToken.value,
                        line: keyToken.line,
                        column: keyToken.column,
                        start: keyToken.start,
                        end: keyToken.end,
                    };
                    this.eat(token_1.TokenType.COLON);
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
                } while (this.match(token_1.TokenType.COMMA) && !this.check(token_1.TokenType.RBRACE));
            }
            const endToken = this.eat(token_1.TokenType.RBRACE);
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
        if (this.match(token_1.TokenType.LPAREN)) {
            const expr = this.parseExpression();
            this.eat(token_1.TokenType.RPAREN);
            return expr;
        }
        // JSX Element: <Component>...</Component> or <>...</>
        if (this.check(token_1.TokenType.LESS_THAN)) {
            const next = this.peekAhead(1);
            // Check if it's JSX (< followed by identifier or >)
            if (next && (next.type === token_1.TokenType.IDENTIFIER || next.type === token_1.TokenType.GREATER_THAN)) {
                return this.parseJSXElement();
            }
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
    match(...types) {
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
    check(type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    /**
     * Get current token and advance
     */
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    /**
     * Get current token without advancing
     */
    peek() {
        return this.tokens[this.current];
    }
    /**
     * Get previous token
     */
    previous() {
        return this.tokens[this.current - 1];
    }
    /**
     * Check if at end of tokens
     */
    isAtEnd() {
        return this.peek().type === token_1.TokenType.EOF;
    }
    /**
     * Expect specific token type and advance, or throw error
     */
    eat(type) {
        if (this.check(type))
            return this.advance();
        const current = this.peek();
        throw new Error(`Parse Error at line ${current.line}, column ${current.column}: ` +
            `Expected ${type} but found ${current.type}`);
    }
    /**
     * Get last token
     */
    getLastToken() {
        return this.tokens[this.tokens.length - 1];
    }
    /**
     * Throw parse error with location info
     */
    parseError(message) {
        const current = this.peek();
        return new Error(`Parse Error at line ${current.line}, column ${current.column}: ${message}`);
    }
    /**
     * Parse JSX element or fragment
     * <Component prop="value">children</Component>
     * <> children </>
     */
    parseJSXElement() {
        const startToken = this.peek();
        // JSX Fragment <>...</>
        if (this.check(token_1.TokenType.LESS_THAN)) {
            const next = this.peekAhead(1);
            if (next?.type === token_1.TokenType.GREATER_THAN) {
                this.advance(); // consume <
                this.advance(); // consume >
                const children = this.parseJSXChildren();
                this.eat(token_1.TokenType.JSX_SLASH);
                this.eat(token_1.TokenType.GREATER_THAN);
                return {
                    type: 'JSXFragment',
                    children,
                    line: startToken.line,
                    column: startToken.column,
                    start: startToken.start,
                    end: this.previous().end,
                };
            }
        }
        // JSX Element <Component...>...</Component>
        const openingElement = this.parseJSXOpeningElement();
        if (openingElement.selfClosing) {
            return {
                type: 'JSXElement',
                openingElement,
                closingElement: null,
                children: [],
                line: startToken.line,
                column: startToken.column,
                start: startToken.start,
                end: this.previous().end,
            };
        }
        const children = this.parseJSXChildren();
        const closingElement = this.parseJSXClosingElement();
        return {
            type: 'JSXElement',
            openingElement,
            closingElement,
            children,
            line: startToken.line,
            column: startToken.column,
            start: startToken.start,
            end: this.previous().end,
        };
    }
    /**
     * Parse JSX opening element: <Component prop="value">
     */
    parseJSXOpeningElement() {
        const startToken = this.eat(token_1.TokenType.LESS_THAN);
        const name = this.parseJSXName();
        const attributes = [];
        while (this.check(token_1.TokenType.IDENTIFIER) && !this.checkJSXEnd()) {
            attributes.push(this.parseJSXAttribute());
        }
        let selfClosing = false;
        if (this.match(token_1.TokenType.JSX_SELF_CLOSING)) {
            selfClosing = true;
        }
        else {
            this.eat(token_1.TokenType.GREATER_THAN);
        }
        return {
            type: 'JSXOpeningElement',
            name,
            attributes,
            selfClosing,
            line: startToken.line,
            column: startToken.column,
            start: startToken.start,
            end: this.previous().end,
        };
    }
    /**
     * Parse JSX closing element: </Component>
     */
    parseJSXClosingElement() {
        const startToken = this.eat(token_1.TokenType.JSX_SLASH);
        const name = this.parseJSXName();
        this.eat(token_1.TokenType.GREATER_THAN);
        return {
            type: 'JSXClosingElement',
            name,
            line: startToken.line,
            column: startToken.column,
            start: startToken.start,
            end: this.previous().end,
        };
    }
    /**
     * Parse JSX element name: Component or Module.Component
     */
    parseJSXName() {
        const startToken = this.eat(token_1.TokenType.IDENTIFIER);
        let name = {
            type: 'JSXIdentifier',
            name: startToken.value,
            line: startToken.line,
            column: startToken.column,
            start: startToken.start,
            end: startToken.end,
        };
        while (this.match(token_1.TokenType.DOT)) {
            const property = this.eat(token_1.TokenType.IDENTIFIER);
            name = {
                type: 'JSXMemberExpression',
                object: name,
                property: {
                    type: 'JSXIdentifier',
                    name: property.value,
                    line: property.line,
                    column: property.column,
                    start: property.start,
                    end: property.end,
                },
                line: name.line,
                column: name.column,
                start: name.start,
                end: property.end,
            };
        }
        return name;
    }
    /**
     * Parse JSX attribute: prop="value" or prop={expression}
     */
    parseJSXAttribute() {
        const startToken = this.eat(token_1.TokenType.IDENTIFIER);
        const nameIdent = {
            type: 'JSXIdentifier',
            name: startToken.value,
            line: startToken.line,
            column: startToken.column,
            start: startToken.start,
            end: startToken.end,
        };
        let value = null;
        if (this.match(token_1.TokenType.ASSIGN)) {
            if (this.match(token_1.TokenType.STRING)) {
                const valueToken = this.previous();
                value = {
                    type: 'Literal',
                    value: valueToken.value,
                    raw: valueToken.value,
                    line: valueToken.line,
                    column: valueToken.column,
                    start: valueToken.start,
                    end: valueToken.end,
                };
            }
            else if (this.match(token_1.TokenType.LBRACE)) {
                const expr = this.parseExpression();
                this.eat(token_1.TokenType.RBRACE);
                value = {
                    type: 'JSXExpressionContainer',
                    expression: expr,
                    line: this.peek().line,
                    column: this.peek().column,
                    start: this.peek().start,
                    end: this.peek().end,
                };
            }
        }
        return {
            type: 'JSXAttribute',
            name: nameIdent,
            value,
            line: startToken.line,
            column: startToken.column,
            start: startToken.start,
            end: this.previous().end,
        };
    }
    /**
     * Parse JSX children
     */
    parseJSXChildren() {
        const children = [];
        while (!this.checkJSXClosingTag()) {
            if (this.check(token_1.TokenType.LESS_THAN)) {
                if (this.peekAhead(1)?.type === token_1.TokenType.JSX_SLASH) {
                    break;
                }
                children.push(this.parseJSXElement());
            }
            else if (this.check(token_1.TokenType.LBRACE)) {
                this.advance();
                const expr = this.parseExpression();
                this.eat(token_1.TokenType.RBRACE);
                children.push(expr);
            }
            else if (this.check(token_1.TokenType.IDENTIFIER) || this.check(token_1.TokenType.STRING)) {
                const textToken = this.advance();
                children.push({
                    type: 'JSXText',
                    value: textToken.value,
                    line: textToken.line,
                    column: textToken.column,
                    start: textToken.start,
                    end: textToken.end,
                });
            }
            else {
                this.advance();
            }
        }
        return children;
    }
    /**
     * Check if next token is JSX closing tag </
     */
    checkJSXClosingTag() {
        return this.check(token_1.TokenType.JSX_SLASH);
    }
    /**
     * Check if we're at end of JSX tag (> or />)
     */
    checkJSXEnd() {
        return this.check(token_1.TokenType.GREATER_THAN) || this.check(token_1.TokenType.JSX_SELF_CLOSING);
    }
    /**
     * Peek ahead one token
     */
    peekAhead(offset = 1) {
        const index = this.current + offset;
        if (index < this.tokens.length) {
            return this.tokens[index];
        }
        return null;
    }
}
exports.Parser = Parser;
/**
 * Convenience function to parse tokens
 */
function parse(tokens) {
    return new Parser(tokens).parse();
}
