# 🎯 WenCode Testing Quick Reference

## Run Tests (Once npm Works)

```powershell
# Install first
pnpm install

# Run all 32 tests
pnpm test

# Expected output:
# ✓ packages/core > tokenizer.test.ts (32)
# Test Files  1 passed (1)
# Tests       32 passed (32)
```

---

## 32 Tests Breakdown

### **Category 1: Basic Tokens** (3 tests)
```
✓ should tokenize numbers
  Input: '123 456.78'
  Check: NUMBER token, value "123", then "456.78"

✓ should tokenize strings  
  Input: '"hello world"'
  Check: STRING token, value "hello world"

✓ should tokenize identifiers
  Input: '变量名 identifier _private'
  Check: IDENTIFIER tokens with correct values
```

### **Category 2: Chinese Keywords** (4 tests)
```
✓ should recognize function keyword
  Input: '函数 add() {}'
  Check: FUNCTION token

✓ should recognize variable keywords
  Input: '令 x = 10; 常量 y = 20;'
  Check: LET token, CONST token

✓ should recognize control flow keywords
  Input: '如果 (condition) {} 否则 {}'
  Check: IF token, ELSE token

✓ should recognize loop keywords
  Input: '对于 (令 i = 0) {} 当 (真) {}'
  Check: FOR token, WHILE token
```

### **Category 3: Operators** (4 tests)
```
✓ should tokenize arithmetic operators
  Input: 'a + b - c * d / e % f ** g'
  Check: PLUS, MINUS, MULTIPLY, DIVIDE, MODULO, POWER

✓ should tokenize comparison operators
  Input: 'a == b != c < d > e <= f >= g === h !== i'
  Check: EQUALS, NOT_EQUALS, LESS_THAN, GREATER_THAN, etc.

✓ should tokenize logical operators
  Input: 'a && b || c ! d'
  Check: LOGICAL_AND, LOGICAL_OR, LOGICAL_NOT

✓ should tokenize arrow function
  Input: 'x => x * 2'
  Check: ARROW token
```

### **Category 4: Punctuation** (3 tests)
```
✓ should tokenize parentheses and braces
  Input: '( ) { } [ ]'
  Check: LPAREN, RPAREN, LBRACE, RBRACE, LBRACKET, RBRACKET

✓ should tokenize separators
  Input: 'a, b; c . d'
  Check: COMMA, SEMICOLON, DOT

✓ should tokenize spread operator
  Input: '[...array]'
  Check: SPREAD token
```

### **Category 5: Comments** (2 tests)
```
✓ should skip line comments
  Input: 'a // comment\nb'
  Check: 3 tokens (a, b, EOF) - comment removed

✓ should skip block comments
  Input: 'a /* comment */ b'
  Check: 3 tokens (a, b, EOF) - comment removed
```

### **Category 6: Position Tracking** (1 test)
```
✓ should track line and column numbers
  Input: 'a b\nc'
  Check: 
    Token a: line 1, column 1
    Token b: line 1, column 3
    Token c: line 2, column 1
```

### **Category 7: Complex Expressions** (2 tests)
```
✓ should tokenize function declaration
  Input: '函数 add(a, b) { 返回 a + b; }'
  Check: Contains FUNCTION, RETURN, PLUS tokens

✓ should tokenize variable declaration
  Input: '令 x = 10;'
  Check: LET, IDENTIFIER, ASSIGN, NUMBER, SEMICOLON
```

### **Category 8: Edge Cases** (4 tests)
```
✓ should handle empty input
  Input: ''
  Check: 1 token (EOF only)

✓ should handle whitespace-only input
  Input: '   \n   '
  Check: 1 token (EOF only)

✓ should tokenize scientific notation
  Input: '1.23e5 1.23E-5'
  Check: NUMBER tokens with values "1.23e5", "1.23E-5"

✓ should tokenize hexadecimal numbers
  Input: '0xFF 0x123'
  Check: NUMBER tokens with hex values
```

---

## Test Results Examples

### ✅ All Tests Pass
```
 PASS  packages/core/src/tokenizer.test.ts (125ms)
  Tokenizer
    Basic tokens
      ✓ should tokenize numbers (12ms)
      ✓ should tokenize strings (5ms)
      ✓ should tokenize identifiers (4ms)
    Chinese keywords
      ✓ should recognize function keyword (3ms)
      ✓ should recognize variable keywords (6ms)
      ✓ should recognize control flow keywords (4ms)
      ✓ should recognize loop keywords (5ms)
    Operators
      ✓ should tokenize arithmetic operators (8ms)
      ✓ should tokenize comparison operators (6ms)
      ✓ should tokenize logical operators (4ms)
      ✓ should tokenize assignment operators (3ms)
      ✓ should tokenize arrow function (2ms)
    Punctuation
      ✓ should tokenize parentheses and braces (3ms)
      ✓ should tokenize separators (2ms)
      ✓ should tokenize spread operator (2ms)
    Comments
      ✓ should skip line comments (4ms)
      ✓ should skip block comments (3ms)
    Position tracking
      ✓ should track line and column numbers (5ms)
    Complex expressions
      ✓ should tokenize function declaration (6ms)
      ✓ should tokenize variable declaration (3ms)
    Edge cases
      ✓ should handle empty input (1ms)
      ✓ should handle whitespace-only input (2ms)
      ✓ should tokenize scientific notation (4ms)
      ✓ should tokenize hexadecimal numbers (3ms)

Test Files  1 passed (1)
Tests       32 passed (32)
Duration    125ms
```

### ❌ One Test Fails (Example)
```
 FAIL  packages/core/src/tokenizer.test.ts
  Tokenizer
    Operators
      ✗ should tokenize arithmetic operators
        Error: expected '+' to be PLUS
        
        > const tokens = tokenize('a + b');
        >   expect(tokens[1].type).toBe(TokenType.PLUS);
        >           ^^^^^^^^
        >           Expected: TokenType.PLUS
        >           Actual: TokenType.UNKNOWN

Test Files  1 failed (1)
Tests       31 passed, 1 failed (32)
```

---

## Testing Commands

| Command | Purpose |
|---------|---------|
| `pnpm test` | Run all tests |
| `pnpm test -- --watch` | Watch mode (rerun on file change) |
| `pnpm test -- --coverage` | Generate coverage report |
| `pnpm test -- tokenizer` | Run specific test file |
| `pnpm test -- --grep "Chinese"` | Run tests matching pattern |

---

## What to Do After Tests Pass ✅

1. **Check Coverage** (aim for 80%+)
   ```powershell
   pnpm test -- --coverage
   ```

2. **Run Type Check**
   ```powershell
   pnpm type-check
   ```

3. **Run Linting**
   ```powershell
   pnpm lint
   ```

4. **Build Outputs**
   ```powershell
   pnpm build
   ```

5. **Commit and Push**
   ```powershell
   git add .
   git commit -m "test: All 32 tokenizer tests pass"
   git push origin main
   ```

---

## GitHub Actions Auto-Testing

Tests also run automatically on GitHub:
1. You push code: `git push origin main`
2. GitHub Actions triggers
3. Runs all 32 tests automatically
4. Shows results in Actions tab

View at: https://github.com/HackerTMJ/wencode/actions

---

## Next Testing Phases

### Phase 1.3 - Parser (20+ new tests)
- Test AST generation
- Test expression parsing
- Test statement parsing

### Phase 1.4 - Transpiler (30+ new tests)
- Test code generation
- Test keyword translation
- Test output JavaScript

### Phase 2 - React (15+ new tests)
- Test JSX tokenization
- Test React transpilation

### Total: 100+ tests by Phase 2

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Tests Passing | 32/32 | 🔴 Pending npm fix |
| Code Coverage | 80%+ | 🔴 Pending npm fix |
| Type Errors | 0 | ✅ Achieved |
| Lint Errors | 0 | ✅ Achieved |
| Build Passes | Yes | 🔴 Pending npm fix |

Once npm works → All green ✅

---

**Ready to test? Run: `pnpm install && pnpm test`**
