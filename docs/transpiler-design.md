# ZhCode 转译器设计文档 (Phase 1.4)

## 目录
1. [概述](#概述)
2. [设计原则](#设计原则)
3. [转译器架构](#转译器架构)
4. [标点符号规范](#标点符号规范)
5. [代码生成策略](#代码生成策略)
6. [转译规则详解](#转译规则详解)
7. [示例](#示例)
8. [实现清单](#实现清单)

---

## 概述

转译器（Transpiler）将 ZhCode 的抽象语法树（AST）转换为可执行的 JavaScript 代码。这是 ZhCode 实现"一次编写，到处运行"的关键组件。

**核心目标：**
- 将所有26种 AST 节点类型转换为对应的 JavaScript
- 生成可读、可调试的 JavaScript 代码
- 支持完整的语言特性（变量、函数、控制流、表达式）
- 保留源代码位置信息以便错误报告

---

## 设计原则

### 1. 关键字映射（一对一替换）
| ZhCode | JavaScript | 用途 |
|---------|-----------|------|
| `令` | `let` | 变量声明 |
| `常量` | `const` | 常量声明 |
| `函数` | `function` | 函数声明 |
| `返回` | `return` | 返回值 |
| `如果` | `if` | 条件判断 |
| `否则` | `else` | 否则分支 |
| `对于` | `for` | for循环 |
| `当` | `while` | while循环 |
| `中断` | `break` | 跳出循环 |
| `继续` | `continue` | 继续下一迭代 |
| `导入` | `import` | 模块导入 |
| `导出` | `export` | 模块导出 |

### 2. 运算符映射（保持一致）
| ZhCode | JavaScript | 说明 |
|---------|-----------|------|
| `+` | `+` | 加法 |
| `-` | `-` | 减法 |
| `*` | `*` | 乘法 |
| `/` | `/` | 除法 |
| `%` | `%` | 取模 |
| `**` | `**` | 幂运算 |
| `=` | `=` | 赋值 |
| `==` | `==` | 相等 |
| `!=` | `!=` | 不相等 |
| `===` | `===` | 严格相等 |
| `!==` | `!==` | 严格不相等 |
| `<` | `<` | 小于 |
| `>` | `>` | 大于 |
| `<=` | `<=` | 小于等于 |
| `>=` | `>=` | 大于等于 |
| `&&` | `&&` | 逻辑与 |
| `\|\|` | `\|\|` | 逻辑或 |
| `!` | `!` | 逻辑非 |

### 3. 转译思路
- **保留结构**：不改变代码逻辑，1:1映射
- **保留可读性**：生成带缩进和换行的代码
- **保留信息**：记录原始位置信息供调试使用

---

## 标点符号规范 ⭐

### 设计决策：**同时支持中文和英文标点符号**

**原因：**
1. **用户友好** - 支持中文输入法用户的习惯
2. **灵活性** - 用户可以混合使用两种标点
3. **自动规范化** - 转译器内部统一转换为英文标点
4. **兼容性** - 生成的 JavaScript 总是用英文标点

**规范化策略：**
在转译过程中，将所有中文标点自动转换为英文标点

```
输入（中文标点）→ 规范化（→英文标点）→ 转译 → 输出（JavaScript）
```

### 支持的标点符号映射

| 中文标点 | 英文标点 | 用途 | 
|---------|---------|------|
| `；` | `;` | 语句结束符 |
| `，` | `,` | 参数/列表分隔符 |
| `（` | `(` | 左括号 |
| `）` | `)` | 右括号 |
| `{` `}` | `{` `}` | 代码块（相同） |
| `【` `】` | `[` `]` | 数组索引 |
| `：` | `:` | 对象属性 |
| `。` | `.` | 成员访问 |
| `=` | `=` | 赋值（相同） |
| `=>` | `=>` | 箭头函数（相同） |

### ✅ 支持的使用方式（三种都可以）

```javascript
// 方式 1：英文标点（推荐）
令 x = 10;
函数 add(a, b) { 返回 a + b; }
const obj = { 名字: "张三" };

// 方式 2：中文标点（也支持）
令 x = 10；
函数 add（a，b）{ 返回 a + b；}
const obj = { 名字： "张三" }；

// 方式 3：混合使用（支持）
令 x = 10;
函数 add（a, b) { 返回 a + b；}
const obj = { 名字: "张三" }；
```

### 转译结果（都转换为英文）

无论输入使用哪种标点，**输出的 JavaScript 都是英文标点：**

```javascript
// 所有输入都转为
let x = 10;
function add(a, b) { return a + b; }
const obj = { 名字: "张三" };
```

---

## 转译器架构

### 类设计

```typescript
export class Transpiler {
  // 转译核心
  transpile(program: AST.Program): string
  
  // 标点符号规范化（新增）
  private normalizePunctuation(code: string): string
  
  // 转译语句
  transpileStatement(stmt: AST.Statement): string
  transpileVariableDeclaration(decl: AST.VariableDeclaration): string
  transpileFunctionDeclaration(decl: AST.FunctionDeclaration): string
  transpileIfStatement(stmt: AST.IfStatement): string
  transpileWhileStatement(stmt: AST.WhileStatement): string
  transpileForStatement(stmt: AST.ForStatement): string
  transpileBlockStatement(stmt: AST.BlockStatement): string
  transpileReturnStatement(stmt: AST.ReturnStatement): string
  transpileExpressionStatement(stmt: AST.ExpressionStatement): string
  transpileBreakStatement(): string
  transpileContinueStatement(): string
  
  // 转译表达式
  transpileExpression(expr: AST.Expression): string
  transpileBinaryExpression(expr: AST.BinaryExpression): string
  transpileUnaryExpression(expr: AST.UnaryExpression): string
  transpileAssignmentExpression(expr: AST.AssignmentExpression): string
  transpileCallExpression(expr: AST.CallExpression): string
  transpileMemberExpression(expr: AST.MemberExpression): string
  transpileConditionalExpression(expr: AST.ConditionalExpression): string
  transpileArrayExpression(expr: AST.ArrayExpression): string
  transpileObjectExpression(expr: AST.ObjectExpression): string
  transpileIdentifier(expr: AST.Identifier): string
  transpileLiteral(expr: AST.Literal): string
  
  // 工具方法
  private indent(code: string, level: number): string
  private getIndentation(level: number): string
}
```

### 转译流程

```
ZhCode Source Code
        ↓
  Tokenizer (tokenize)
        ↓
    AST (Parser)
        ↓
  Transpiler (transpile)
        ↓
JavaScript Code
        ↓
   Node.js/Browser
        ↓
    Output
```

---

## 代码生成策略

### 1. 缩进管理
- 每层缩进 2 个空格
- 跟踪当前缩进级别
- 语句块自动增加缩进

### 2. 换行规则
```javascript
// 语句后立即换行
令 x = 10;
[换行]
令 y = 20;

// 块语句前不换行，块内换行
函数 add(a, b) {
  [换行]
  返回 a + b;
  [换行]
}

// 表达式不换行
x + y * 2
```

### 3. 操作符转换
- 关键字替换（令 → let）
- 操作符保持不变
- 括号和大括号保持不变

---

## 转译规则详解

### 语句转译

#### 1. 变量声明 (VariableDeclaration)
```javascript
// 输入 AST
{
  type: 'VariableDeclaration',
  kind: 'let',  // 或 'const'
  declarations: [
    {
      id: { type: 'Identifier', name: 'x' },
      init: { type: 'Literal', value: 10 }
    }
  ]
}

// 输出
令 x = 10;
// ↓ 转译
let x = 10;
```

#### 2. 函数声明 (FunctionDeclaration)
```javascript
// 输入 AST
{
  type: 'FunctionDeclaration',
  id: { type: 'Identifier', name: 'add' },
  params: [
    { type: 'Identifier', name: 'a' },
    { type: 'Identifier', name: 'b' }
  ],
  body: {
    type: 'BlockStatement',
    body: [
      {
        type: 'ReturnStatement',
        argument: {
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' }
        }
      }
    ]
  }
}

// 输出
函数 add(a, b) {
  返回 a + b;
}
// ↓ 转译
function add(a, b) {
  return a + b;
}
```

#### 3. If 语句 (IfStatement)
```javascript
// 输入
如果 (x > 0) {
  返回 1;
} 否则 如果 (x < 0) {
  返回 -1;
} 否则 {
  返回 0;
}

// 输出
if (x > 0) {
  return 1;
} else if (x < 0) {
  return -1;
} else {
  return 0;
}
```

#### 4. For 循环 (ForStatement)
```javascript
// 输入
对于 (令 i = 0; i < 10; i = i + 1) {
  console.log(i);
}

// 输出
for (let i = 0; i < 10; i = i + 1) {
  console.log(i);
}
```

#### 5. While 循环 (WhileStatement)
```javascript
// 输入
当 (x > 0) {
  x = x - 1;
}

// 输出
while (x > 0) {
  x = x - 1;
}
```

### 表达式转译

#### 1. 二元表达式 (BinaryExpression)
```
left operator right
a + b → a + b
x && y → x && y
p == q → p == q
```

#### 2. 一元表达式 (UnaryExpression)
```
!x → !x
-y → -y
+z → +z
```

#### 3. 赋值表达式 (AssignmentExpression)
```
x = 10 → x = 10
y += 5 → y += 5
z *= 2 → z *= 2
```

#### 4. 函数调用 (CallExpression)
```
add(1, 2) → add(1, 2)
obj.method(a, b) → obj.method(a, b)
```

#### 5. 成员访问 (MemberExpression)
```
obj.prop → obj.prop
arr[0] → arr[0]
obj[key] → obj[key]
```

#### 6. 条件表达式 (ConditionalExpression)
```
x > 0 ? 1 : -1 → x > 0 ? 1 : -1
```

#### 7. 数组字面量 (ArrayExpression)
```
[1, 2, 3] → [1, 2, 3]
[] → []
```

#### 8. 对象字面量 (ObjectExpression)
```
{ 名字: "张三", 年龄: 25 }
→ { 名字: "张三", 年龄: 25 }
```

---

## 示例

### 示例 1：简单变量和函数

**ZhCode 代码：**
```javascript
令 x = 10;
令 y = 20;

函数 add(a, b) {
  返回 a + b;
}

令 result = add(x, y);
console.log(result);
```

**转译后 JavaScript：**
```javascript
let x = 10;
let y = 20;

function add(a, b) {
  return a + b;
}

let result = add(x, y);
console.log(result);
```

### 示例 2：控制流

**ZhCode 代码：**
```javascript
函数 fibonacci(n) {
  如果 (n <= 1) {
    返回 n;
  } 否则 {
    返回 fibonacci(n - 1) + fibonacci(n - 2);
  }
}
```

**转译后 JavaScript：**
```javascript
function fibonacci(n) {
  if (n <= 1) {
    return n;
  } else {
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
}
```

### 示例 3：循环和数组

**ZhCode 代码：**
```javascript
令 nums = [1, 2, 3, 4, 5];
令 sum = 0;

对于 (令 i = 0; i < nums.length; i = i + 1) {
  sum = sum + nums[i];
}

console.log(sum);
```

**转译后 JavaScript：**
```javascript
let nums = [1, 2, 3, 4, 5];
let sum = 0;

for (let i = 0; i < nums.length; i = i + 1) {
  sum = sum + nums[i];
}

console.log(sum);
```

### 示例 4：对象和成员访问

**ZhCode 代码：**
```javascript
令 person = {
  名字: "张三",
  年龄: 25,
  问好: 函数() {
    返回 "你好，我是 " + this.名字;
  }
};

console.log(person.问好());
```

**转译后 JavaScript：**
```javascript
let person = {
  名字: "张三",
  年龄: 25,
  问好: function() {
    return "你好，我是 " + this.名字;
  }
};

console.log(person.问好());
```

---

## 实现清单

### 第 1 部分：核心框架
- [ ] 创建 Transpiler 类
- [ ] 实现 transpile() 主方法
- [ ] 实现缩进和格式化工具方法
- [ ] 创建节点分派系统

### 第 2 部分：语句转译
- [ ] transpileVariableDeclaration()
- [ ] transpileFunctionDeclaration()
- [ ] transpileBlockStatement()
- [ ] transpileIfStatement()
- [ ] transpileWhileStatement()
- [ ] transpileForStatement()
- [ ] transpileReturnStatement()
- [ ] transpileBreakStatement()
- [ ] transpileContinueStatement()
- [ ] transpileExpressionStatement()

### 第 3 部分：表达式转译
- [ ] transpileBinaryExpression()
- [ ] transpileUnaryExpression()
- [ ] transpileAssignmentExpression()
- [ ] transpileCallExpression()
- [ ] transpileMemberExpression()
- [ ] transpileConditionalExpression()
- [ ] transpileArrayExpression()
- [ ] transpileObjectExpression()
- [ ] transpileIdentifier()
- [ ] transpileLiteral()

### 第 4 部分：测试（40+ 测试用例）
- [ ] 基础表达式测试（数字、字符串、布尔值）
- [ ] 二元运算测试（加减乘除、逻辑运算）
- [ ] 变量声明测试（let/const）
- [ ] 函数声明和调用测试
- [ ] 控制流测试（if/else、循环）
- [ ] 数组和对象测试
- [ ] 复杂程序集成测试
- [ ] 代码格式验证测试

---

## 技术细节

### 处理关键字替换
- 使用映射表 (Object/Map) 存储关键字对应关系
- 在遍历时查表替换

### 处理操作符
- 大多数操作符保持不变（已在 tokenizer 中使用英文）
- 部分关键字需替换

### 处理作用域
- 跟踪变量作用域（可选，用于优化）
- 当前简单版本：直接转译，不进行作用域分析

### 错误处理
- 验证 AST 节点有效性
- 提供有意义的错误消息
- 包含原始位置信息

---

## 下一步

1. **实现转译器** (transpiler.ts) - 600-800 行代码
2. **编写测试** (transpiler.test.ts) - 40+ 测试用例
3. **集成测试** - tokenize → parse → transpile → execute
4. **性能优化** - 缓存、增量转译（可选）

