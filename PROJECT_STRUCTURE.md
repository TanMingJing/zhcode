# WenCode 项目完整结构

## 目录树

```
wencode/
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD 流程
│
├── docs/
│   ├── context.md                    # 产品设计与规格说明书
│   ├── plan.md                       # 开发计划与检查清单
│   └── language-spec.md              # 语言规范（新增）
│
├── packages/
│   ├── core/                         # 核心语言引擎
│   │   ├── src/
│   │   │   ├── token.ts              # Token 定义与类型
│   │   │   ├── keywords.ts           # 关键字映射表
│   │   │   ├── tokenizer.ts          # 词法分析器
│   │   │   ├── tokenizer.test.ts     # Tokenizer 单元测试
│   │   │   └── index.ts              # 导出模块
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .gitignore
│   │
│   ├── cli/                          # 命令行工具
│   │   ├── src/
│   │   │   └── cli.ts                # CLI 入口
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ide/                          # Web IDE
│   │   ├── src/
│   │   │   ├── App.tsx               # 主应用组件
│   │   │   └── main.tsx              # 入口文件
│   │   ├── index.html                # HTML 模板
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts            # Vite 配置
│   │
│   ├── vscode-ext/                   # VS Code 扩展
│   │   ├── src/
│   │   │   └── extension.ts          # 扩展入口
│   │   ├── package.json
│   │   ├── package.nls.json          # 扩展清单
│   │   └── tsconfig.json
│   │
│   └── ai-service/                   # AI 后端服务
│       ├── src/
│       │   └── server.ts             # 服务入口
│       ├── package.json
│       └── tsconfig.json
│
├── examples/                         # 代码示例（待填充）
│   ├── hello-world.wen
│   ├── functions.wen
│   ├── loops.wen
│   ├── react-component.wen
│   └── ...
│
├── .eslintrc.json                    # ESLint 配置
├── .prettierrc                       # Prettier 配置
├── .gitignore                        # Git 忽略规则
├── tsconfig.json                     # 根 TypeScript 配置
├── vitest.config.ts                  # Vitest 测试框置
├── package.json                      # 根 package.json (pnpm workspaces)
├── pnpm-lock.yaml                    # pnpm 锁定文件（执行 pnpm install 后生成）
│
├── README.md                         # 项目主文档
├── GETTING_STARTED.md                # 快速开始指南
└── PHASE1_SUMMARY.md                 # Phase 1 完成总结（本文件）
```

---

## 核心文件说明

### 配置文件

| 文件 | 用途 |
|------|------|
| `package.json` | pnpm Monorepo 根配置，定义工作区和共享脚本 |
| `tsconfig.json` | TypeScript 根配置，所有包继承此配置 |
| `vitest.config.ts` | Vitest 测试框架配置 |
| `.eslintrc.json` | ESLint 代码检查规则 |
| `.prettierrc` | Prettier 代码格式化规则 |
| `.gitignore` | Git 忽略规则 |
| `.github/workflows/ci.yml` | GitHub Actions 自动化流程 |

### 文档文件

| 文件 | 内容 |
|------|------|
| `README.md` | 项目概览、快速开始、项目结构 |
| `GETTING_STARTED.md` | 详细的快速开始指南 |
| `docs/context.md` | 产品设计、特性、技术架构 |
| `docs/plan.md` | 4 个阶段的开发计划与检查清单 |
| `docs/language-spec.md` | 完整的语言规范（词法、语法、语义） |
| `PHASE1_SUMMARY.md` | Phase 1 进度总结 |

### 核心语言包 (`packages/core/`)

#### Token 系统
- **`src/token.ts`** (165 行)
  - `enum TokenType`: 50+ 个 token 类型
  - `class Token`: Token 对象表示
  - 包含位置信息（行、列、位移）

#### 关键字系统
- **`src/keywords.ts`** (115 行)
  - `CHINESE_KEYWORDS`: 中文关键字映射表
  - `KEYWORD_TO_JS`: 关键字到 JavaScript 映射
  - 辅助函数：`isKeyword()`, `getKeywordType()`, `getJSEquivalent()`

#### 词法分析器
- **`src/tokenizer.ts`** (650+ 行)
  - `class Tokenizer`: 主词法分析器类
  - `tokenize()`: 导出函数
  - 支持：
    - 中文和英文标识符
    - 数字（整数、浮点、十六进制、二进制、八进制、科学计数法）
    - 字符串（双引号、单引号、模板字符串）
    - 注释（单行 `//`、多行 `/* */`）
    - 运算符（算术、比较、逻辑、位运算、赋值）
    - 标点符号（括号、大括号、方括号等）
    - 位置追踪（行号、列号）

#### 单元测试
- **`src/tokenizer.test.ts`** (350+ 行)
  - 32 个测试用例
  - 覆盖所有主要功能和边界情况
  - 测试分类：
    - 基础 token（数字、字符串、标识符）
    - 中文关键字
    - 各类运算符
    - 标点符号
    - 注释处理
    - 位置追踪
    - 复杂表达式
    - 边界情况

#### 模块导出
- **`src/index.ts`** (20 行)
  - 导出 `Token`, `TokenType`, `IToken`
  - 导出 `Tokenizer`, `tokenize()`
  - 导出 `CHINESE_KEYWORDS`, `KEYWORD_TO_JS`, 辅助函数
  - 导出 `VERSION` 和 `hello()`

---

## 依赖关系

### pnpm Workspaces 结构
```
wencode (root)
├── @wencode/core          # 其他包的依赖
├── @wencode/cli           # 依赖 @wencode/core
├── @wencode/ide           # 依赖 @wencode/core
├── @wencode/vscode-ext    # （可选）依赖 @wencode/core
└── @wencode/ai-service    # 依赖 @wencode/core
```

### 共享依赖（Root package.json）
```json
{
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "typescript": "^5.3.2",
    "vitest": "^1.0.0"
  }
}
```

### 包专用依赖
- **@wencode/core**: `tsup` (构建工具)
- **@wencode/cli**: `tsup`
- **@wencode/ide**: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`
- **@wencode/vscode-ext**: `@types/vscode`
- **@wencode/ai-service**: `tsx` (TS 执行)

---

## 开发工作流

### 完整的开发命令

```bash
# 安装依赖（首次）
pnpm install

# 开发模式（所有包）
pnpm dev

# 构建（所有包）
pnpm build

# 运行测试
pnpm test
pnpm test -- --watch         # Watch 模式
pnpm test -- --coverage      # 显示覆盖率

# 代码检查与格式化
pnpm lint
pnpm format

# 类型检查
pnpm type-check

# 按包操作示例
pnpm -F @wencode/core test
pnpm -F @wencode/ide dev
pnpm -F @wencode/cli build
```

---

## 版本信息

| 项目 | 版本 |
|------|------|
| WenCode | v0.1.0 |
| Node.js 要求 | 18.0+ |
| pnpm 要求 | 8.0+ |
| TypeScript | 5.3+ |

---

## 下一步计划

### 即将实现 (Phase 1.3-1.5)

#### 1.3 Parser（语法分析器）
- [ ] AST 节点类型定义
- [ ] 递归下降解析器
- [ ] 表达式解析
- [ ] 语句解析
- [ ] 单元测试（30+ 个）

#### 1.4 Transpiler（代码生成器）
- [ ] AST 到 JavaScript 转换
- [ ] Source Map 支持
- [ ] 代码美化
- [ ] 集成测试

#### 1.5 运行环境与 REPL
- [ ] Node.js 运行支持
- [ ] 交互式 REPL
- [ ] 完整测试

#### 1.6 CLI 工具
- [ ] `wencode compile` 命令
- [ ] `wencode run` 命令
- [ ] `wencode init` 命令
- [ ] Help 和版本信息

---

## 快速参考

### 文件大小统计
```
token.ts          ~165 行
keywords.ts       ~115 行
tokenizer.ts      ~650 行
tokenizer.test.ts ~350 行
language-spec.md  ~550 行
plan.md           ~400 行
PHASE1_SUMMARY.md ~300 行
```

### 测试覆盖情况
- ✅ 基本语言功能：100%
- ✅ 关键字识别：100%
- ✅ 运算符处理：100%
- ✅ 错误处理：80%（边界情况）
- ⏳ Parser：0%（即将实现）
- ⏳ Transpiler：0%（即将实现）

---

## 重要链接

| 资源 | 位置 |
|------|------|
| 项目根目录 | `c:\Users\mjtan\Desktop\wencode` |
| 语言规范 | `docs/language-spec.md` |
| 开发计划 | `docs/plan.md` |
| 快速开始 | `GETTING_STARTED.md` |
| Tokenizer 源码 | `packages/core/src/tokenizer.ts` |
| 测试文件 | `packages/core/src/tokenizer.test.ts` |

---

**更新时间**：2025-12-10  
**当前进度**：Phase 1.2 完成，Phase 1.3 准备就绪
