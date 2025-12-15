# ZhCode 语言规范 (Language Specification)

## 1. 简介

ZhCode 是一门使用中文关键字的现代编程语言，编译到 JavaScript，支持 React.js 和现代 JavaScript 生态。本文档定义了 ZhCode 的完整语言语法和语义。

---

## 2. 词法规范 (Lexical Grammar)

### 2.1 关键字 (Keywords)

| 中文 | English | 用途 |
|------|---------|------|
| 函数 | function | 函数声明 |
| 返回 | return | 返回值 |
| 如果 | if | 条件分支 |
| 否则 | else | 条件分支（else） |
| 否则如果 | else if | 条件分支（else if） |
| 对于 | for | 循环 |
| 当 | while | 循环 |
| 属于 | in | 循环中的成员访问 |
| 从...到 | 遍历 range | for...in 循环 |
| 令 | let | 变量声明 |
| 常量 | const | 常量声明 |
| 导入 | import | 导入模块 |
| 导出 | export | 导出模块 |
| 默认 | default | 默认导出 |
| 从 | from | 导入来源 |
| 组件 | component | React 组件（可选） |
| 异步 | async | 异步函数 |
| 等待 | await | 等待 Promise |
| 尝试 | try | 异常处理 |
| 捕获 | catch | 异常捕获 |
| 最后 | finally | 异常最后块 |
| 抛出 | throw | 抛出异常 |
| 类 | class | 类定义 |
| 扩展 | extends | 类继承 |
| 新建 | new | 创建实例 |
| 这个 | this | 当前对象 |
| 超级 | super | 父类引用 |
| 静态 | static | 静态成员 |
| 破 | break | 循环中断 |
| 续 | continue | 循环续行 |
| 真 | true | 布尔真 |
| 假 | false | 布尔假 |
| 空 | null | 空值 |
| 未定义 | undefined | 未定义 |

### 2.2 保留符号 (Reserved Symbols)

```
( ) { } [ ] ; , . < > = + - * / % ! & | ^ ~ ? : @ # $ \
```

### 2.3 标识符规则 (Identifier Rules)

- 首字符：字母（a-z, A-Z）、下划线（_）、中文字符
- 后续字符：字母、数字（0-9）、下划线、中文字符
- 不能与关键字重名
- 大小写敏感

**示例**：
```
名字       ✓
_私有      ✓
变量123    ✓
函数       ✗ (关键字)
2变量      ✗ (以数字开头)
```

### 2.4 字面量 (Literals)

#### 数值 (Numbers)
```
123          // 整数
123.45       // 浮点数
1.23e5       // 科学计数法
0xFF         // 十六进制
0b1010       // 二进制
0o777        // 八进制
```

#### 字符串 (Strings)
```
"双引号"      // 双引号字符串
'单引号'      // 单引号字符串
`模板字符串`   // 模板字符串（支持 ${表达式}）
```

#### 布尔值 (Booleans)
```
真   // true
假   // false
```

#### 特殊值 (Special Values)
```
空       // null
未定义   // undefined
```

#### 数组 (Arrays)
```
[1, 2, 3]
["a", "b", "c"]
[1, "字符串", 真]
```

#### 对象 (Objects)
```
{ 名字: "张三", 年龄: 25 }
{ "key": 值, 另一个: 456 }
```

### 2.5 注释 (Comments)

```zhcode
// 单行注释

/* 多行注释
   可以跨越多行 */

/**
 * 文档注释
 * @param 参数 参数说明
 * @returns 返回值说明
 */
```

### 2.6 运算符与符号的中文名称 (Chinese Operator Names)

zhcode 支持为运算符和标点符号定义中文名称，方便理解和学习：

| 符号 | 中文名称 | 用途 |
|------|---------|------|
| `=` | 等于 | 赋值 |
| `+` | 加 | 加法 |
| `-` | 减 | 减法 |
| `*` | 乘 | 乘法 |
| `/` | 除 | 除法 |
| `%` | 模 | 取模 |
| `>` | 大于 | 大于比较 |
| `<` | 小于 | 小于比较 |
| `>=` | 大于等于 | 大于等于比较 |
| `<=` | 小于等于 | 小于等于比较 |
| `!=` | 不等于 | 不相等比较 |
| `===` | 严格等于 | 严格相等比较 |
| `!==` | 严格不等于 | 严格不相等比较 |
| `&&` | 和 | 逻辑与 |
| `\|\|` | 或 | 逻辑或 |
| `!` | 非 | 逻辑非 |
| `.` | 点 | 属性访问 |
| `:` | 冒号 | 键值对分隔 |
| `;` | 分号 | 语句结束 |
| `,` | 逗号 | 元素分隔 |
| `(` | 左括号 | 函数调用、分组 |
| `)` | 右括号 | 函数调用、分组 |
| `{` | 左花括号 | 代码块 |
| `}` | 右花括号 | 代码块 |
| `[` | 左方括号 | 数组索引 |
| `]` | 右方括号 | 数组索引 |
| `=>` | 箭头 | 箭头函数 |
| `...` | 扩展 | 扩展操作符 |

**示例说明**：
```zhcode
// 使用中文名称理解运算符
令 结果 = 加(5, 3);      // 用"加"理解+号
令 判断 = x 大于 10;     // 用"大于"理解>号
令 条件 = a 和 b;        // 用"和"理解&&号
```

---

## 3. 语法规范 (Syntax Grammar)

### 3.1 程序结构 (Program Structure)

```
Program = Statement*
Statement = Declaration | Expression | ControlFlow | Block
```

### 3.2 声明 (Declarations)

#### 变量声明 (Variable Declaration)
```
令 名字 = 初始值;
令 名字;  // 初始值为 undefined
常量 名字 = 值;
```

**编译示例**：
```zhcode
令 x = 10;
常量 PI = 3.14159;
```
↓
```javascript
let x = 10;
const PI = 3.14159;
```

#### 函数声明 (Function Declaration)
```
函数 名字(参数1, 参数2, ...) {
  语句;
  返回 值;
}
```

**编译示例**：
```zhcode
函数 加法(a, b) {
  返回 a + b;
}
```
↓
```javascript
function 加法(a, b) {
  return a + b;
}
```

#### 箭头函数 (Arrow Function)
```
令 名字 = (参数1, 参数2) => {
  语句;
  返回 值;
};

令 简洁函数 = x => x * 2;
```

#### 类声明 (Class Declaration)
```
类 名字 {
  构造函数(参数) {
    this.属性 = 参数;
  }
  
  方法() {
    返回 this.属性;
  }
}
```

#### 导入导出 (Import/Export)
```
导入 { 函数A, 函数B } 从 "./模块";
导入 * 作为 工具 从 "./lib";
导入 默认 从 "./default-export";

导出 函数 导出函数() { ... }
导出 常量 API_URL = "https://...";
导出 默认 主组件;
```

### 3.3 表达式 (Expressions)

#### 二元运算 (Binary Operations)
```
a + b        // 加法
a - b        // 减法
a * b        // 乘法
a / b        // 除法
a % b        // 取模
a ** b       // 幂运算
a == b       // 相等
a === b      // 严格相等
a != b       // 不等
a !== b      // 严格不等
a > b        // 大于
a < b        // 小于
a >= b       // 大于等于
a <= b       // 小于等于
a && b       // 逻辑与
a || b       // 逻辑或
```

#### 一元运算 (Unary Operations)
```
!条件        // 逻辑非
-数值        // 负值
+数值        // 正值
typeof 值    // 类型检查
```

#### 函数调用 (Function Call)
```
函数名(参数1, 参数2)
对象.方法(参数)
```

#### 属性访问 (Property Access)
```
对象.属性
对象["属性"]
```

#### 数组索引 (Array Index)
```
数组[索引]
数组[0]
```

#### 条件表达式 (Conditional Expression)
```
条件 ? 真值 : 假值
```

#### 成员访问 (Member Access)
```
对象.属性
对象[动态属性]
```

### 3.4 语句 (Statements)

#### 表达式语句 (Expression Statement)
```
表达式;
```

#### 块语句 (Block Statement)
```
{
  语句1;
  语句2;
}
```

#### 条件语句 (Conditional Statement)
```
如果(条件) {
  语句;
}

如果(条件1) {
  语句1;
} 否则如果(条件2) {
  语句2;
} 否则 {
  语句3;
}
```

**编译示例**：
```zhcode
如果(x > 0) {
  打印("正数");
} 否则 {
  打印("非正数");
}
```
↓
```javascript
if(x > 0) {
  console.log("正数");
} else {
  console.log("非正数");
}
```

#### for 循环 (For Loop)
```
对于(令 i = 0; i < 10; i = i + 1) {
  语句;
}

对于(令 项 属于 数组) {
  语句;
}

对于(令 键 属于 对象) {
  语句;
}
```

**编译示例**：
```zhcode
对于(令 i = 0; i < 5; i = i + 1) {
  打印(i);
}
```
↓
```javascript
for(let i = 0; i < 5; i = i + 1) {
  console.log(i);
}
```

#### while 循环 (While Loop)
```
当(条件) {
  语句;
}
```

#### break 和 continue
```
破         // 中断循环
续         // 跳过本次迭代
```

#### try-catch-finally
```
尝试 {
  可能出错的代码;
} 捕获(错误) {
  处理错误;
} 最后 {
  清理代码;
}
```

### 3.5 React JSX 语法

#### 组件定义 (Component Definition)
```zhcode
组件 问候(参数) {
  返回 <问候 名字={参数.名字}>你好</问候>;
}

// 或使用函数形式
函数 问候(参数) {
  返回 <div>{参数.名字}</div>;
}
```

#### JSX 表达式
```zhcode
令 元素 = <div 类="容器">
  <h1>标题</h1>
  <p>{内容}</p>
</div>;

令 条件元素 = 条件 ? <真元素 /> : <假元素 />;
```

#### JSX 属性
```zhcode
<按钮 
  点击={() => 处理()}
  禁用={假}
  样式={{ 颜色: "红" }}
>
  点击我
</按钮>
```

---

## 4. 语义规则 (Semantic Rules)

### 4.1 作用域 (Scope)

- 全局作用域：在函数外声明的变量
- 函数作用域：在函数内声明的变量
- 块作用域：`令` 和 `常量` 具有块级作用域
- 嵌套作用域：内层可访问外层变量

### 4.2 类型系统 (Type System)

zhcode 使用动态类型（与 JavaScript 一致），但支持类型注解（待实现）。

**基本类型**：
- 数值 (Number): `123`, `3.14`
- 字符串 (String): `"文本"`, `'文本'`
- 布尔 (Boolean): `真`, `假`
- 对象 (Object): `{ 键: 值 }`
- 数组 (Array): `[1, 2, 3]`
- 函数 (Function): `函数() { ... }`
- 空 (Null): `空`
- 未定义 (Undefined): `未定义`

### 4.3 类型强制转换 (Type Coercion)

遵循 JavaScript 的类型强制规则。

### 4.4 函数 Hoisting

函数声明会被 hoisted，可以在声明前调用。

### 4.5 变量 Hoisting

`令` 声明的变量不会 hoisting（TDZ），`常量` 也是。

---

## 5. 预定义函数 (Built-in Functions)

### 5.1 控制台函数 (Console Functions)

```
打印(值)              // console.log()
打印错误(值)          // console.error()
打印警告(值)          // console.warn()
```

### 5.2 类型检查 (Type Checking)

```
类型(值)              // typeof 操作符
实例(值, 类型)        // instanceof 操作符
```

### 5.3 数组方法（继承自 JS）

```
数组.长度             // .length
数组.推送(元素)       // .push()
数组.弹出()           // .pop()
数组.映射(fn)         // .map()
数组.过滤(fn)         // .filter()
```

---

## 6. 编译规则 (Compilation Rules)

### 6.1 关键字映射

所有中文关键字直接映射到对应的 JavaScript 关键字。

### 6.2 标识符处理

- 中文标识符保留为中文（可选：支持转换为拼音或英文别名）
- 保留所有用户自定义标识符

### 6.3 输出格式

编译后的 JavaScript 应该：
1. 保持可读性（带正确缩进）
2. 保留注释（如可能）
3. 生成 Source Map（用于调试）

---

## 7. 错误处理 (Error Handling)

### 7.1 编译错误 (Compile-time Errors)

- 语法错误 (Syntax Error)
- 未定义变量 (Undefined Variable)
- 关键字重复定义 (Duplicate Definition)
- 类型错误 (Type Error) - 如适用

### 7.2 运行时错误 (Runtime Errors)

- 被零除 (Division by Zero)
- 访问未定义属性 (Undefined Property)
- 调用非函数 (Calling Non-function)
- 数组越界 (Array Out of Bounds) - 如适用

---

## 8. 语法范例 (Examples)

### 8.1 阶乘函数

```zhcode
函数 阶乘(n) {
  如果(n <= 1) {
    返回 1;
  }
  返回 n * 阶乘(n - 1);
}

打印(阶乘(5));  // 输出: 120
```

### 8.2 数组处理

```zhcode
令 数字 = [1, 2, 3, 4, 5];
令 平方 = 数字.映射(x => x * x);
打印(平方);  // 输出: [1, 4, 9, 16, 25]
```

### 8.3 对象与方法

```zhcode
令 人 = {
  名字: "张三",
  年龄: 25,
  问好: 函数() {
    返回 "你好，我是 " + this.名字;
  }
};

打印(人.问好());
```

### 8.4 异步编程

```zhcode
异步 函数 获取数据() {
  尝试 {
    令 响应 = 等待 获取("https://api.example.com");
    令 数据 = 等待 响应.json();
    返回 数据;
  } 捕获(错误) {
    打印错误("获取失败:", 错误);
  }
}
```

### 8.5 React 组件

```zhcode
组件 计数器() {
  令 [计数, 设置计数] = 使用状态(0);
  
  函数 增加() {
    设置计数(计数 + 1);
  }
  
  返回 (
    <div>
      <p>计数: {计数}</p>
      <button 点击={增加}>增加</button>
    </div>
  );
}

导出 默认 计数器;
```

---

## 9. 版本历史 (Version History)

| 版本 | 日期 | 说明 |
|------|------|------|
| 0.1.0 | 2025-12-10 | 初始语言规范 |

---

## 10. 参考 (References)

- [ECMAScript Specification](https://tc39.es/ecma262/)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [React Documentation](https://react.dev)
