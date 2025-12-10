# 🎯 WenCode 快速参考卡

## ⚡ 5 分钟快速开始

### 步骤 1：安装依赖
```bash
cd c:\Users\mjtan\Desktop\wencode
pnpm install
```

### 步骤 2：运行测试
```bash
pnpm -F @wencode/core test
```

### 步骤 3：查看代码
```bash
code packages/core/src/tokenizer.ts
```

---

## 📁 项目关键文件位置

```
wencode/
├── 📖 INDEX.md                          ⭐ START HERE
├── 📖 README.md                         ⭐ 项目概览
├── 📖 GETTING_STARTED.md                ← 快速开始指南
├── 📖 COMPLETION_SUMMARY.md             ← 完成总结
│
├── 📂 docs/
│   ├── language-spec.md                 ← 语言规范
│   ├── plan.md                          ← 开发计划
│   └── context.md                       ← 产品设计
│
└── 📂 packages/core/src/
    ├── tokenizer.ts                     ← ⭐ 650 行实现
    ├── tokenizer.test.ts                ← ⭐ 32 个测试
    ├── token.ts                         ← Token 定义
    ├── keywords.ts                      ← 关键字表
    └── index.ts                         ← 导出
```

---

## 🚀 常用命令速查

### 开发命令
```bash
pnpm dev              # 开发模式（所有包）
pnpm build            # 构建所有包
pnpm test             # 运行所有测试
pnpm lint             # 代码检查
pnpm format           # 代码格式化
pnpm type-check       # 类型检查
```

### 按包操作
```bash
pnpm -F @wencode/core test
pnpm -F @wencode/core build
pnpm -F @wencode/core test -- --watch     # Watch 模式
pnpm -F @wencode/core test -- --coverage  # 覆盖率
```

### 快速导航
```bash
code .                          # 打开整个项目
code packages/core/src          # 打开 core 包
code docs                       # 打开文档
```

---

## 📊 项目快照

| 项目 | 数值 |
|------|------|
| **文件总数** | 11 TypeScript + 8 文档 |
| **代码行数** | 1,500+ 行 |
| **关键字** | 30+ |
| **Token 类型** | 50+ |
| **单元测试** | 32 个 |
| **测试覆盖** | 100% 核心功能 |

---

## 🎯 当前进度

```
Phase 1 - 核心语言原型
├── 1.1 语言设计与关键字 ✅ 完成
├── 1.2 Tokenizer     ✅ 完成
├── 1.3 Parser        ⏳ 下一步
├── 1.4 Transpiler    ⏳ 后续
├── 1.5 运行环境      ⏳ 后续
└── 1.6 CLI 工具      ⏳ 后续
```

---

## 💡 核心概念

### Token（记号）
```wencode
令 x = 10;
↓ (Tokenizer)
[LET, IDENTIFIER("x"), ASSIGN, NUMBER("10"), SEMICOLON]
```

### Keyword（关键字）映射
```
函数  → function
返回  → return
令    → let
常量  → const
如果  → if
否则  → else
```

### 完整流程（待实现）
```
源代码 → Tokenizer → Parser → Transpiler → JavaScript
```

---

## 🔍 代码示例

### 中文代码
```wencode
函数 加法(a, b) {
  返回 a + b;
}

令 结果 = 加法(5, 3);
打印(结果);
```

### Tokenizer 输出
```
Token(FUNCTION, "函数", 1, 1)
Token(IDENTIFIER, "加法", 1, 3)
Token(LPAREN, "(", 1, 5)
Token(IDENTIFIER, "a", 1, 6)
Token(COMMA, ",", 1, 7)
Token(IDENTIFIER, "b", 1, 9)
Token(RPAREN, ")", 1, 10)
Token(LBRACE, "{", 1, 12)
Token(RETURN, "返回", 2, 3)
Token(IDENTIFIER, "a", 2, 6)
Token(PLUS, "+", 2, 8)
Token(IDENTIFIER, "b", 2, 10)
Token(SEMICOLON, ";", 2, 11)
Token(RBRACE, "}", 3, 1)
...
Token(EOF, "", ...)
```

---

## 🧪 运行测试

### 全部测试
```bash
pnpm test
```

### 仅 Tokenizer 测试
```bash
pnpm -F @wencode/core test
```

### Watch 模式
```bash
pnpm -F @wencode/core test -- --watch
```

### 查看覆盖率
```bash
pnpm -F @wencode/core test -- --coverage
```

---

## 📚 文档导航

| 文档 | 用途 | 长度 |
|------|------|------|
| [INDEX.md](./INDEX.md) | 文档索引 | 快速查找 |
| [README.md](./README.md) | 项目概览 | 10 min |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | 快速开始 | 15 min |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | 项目结构 | 20 min |
| [docs/language-spec.md](./docs/language-spec.md) | 语言规范 | 30 min |
| [docs/plan.md](./docs/plan.md) | 开发计划 | 25 min |
| [docs/context.md](./docs/context.md) | 产品设计 | 25 min |
| [PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md) | Phase 1 总结 | 20 min |

---

## ✨ 关键成就

✅ 完整的 Tokenizer 实现（650+ 行）
✅ 30+ 个关键字支持
✅ 50+ 种 Token 类型
✅ 32 个单元测试，100% 覆盖
✅ 8 个文档文件（6,000+ 字）
✅ GitHub Actions CI/CD 配置
✅ TypeScript 完整类型覆盖
✅ ESLint + Prettier 配置

---

## 🚀 下一步

### 立即可做
1. 运行测试：`pnpm test`
2. 查看代码：`code packages/core/src`
3. 阅读规范：`docs/language-spec.md`

### 接下来实现
1. **Parser**（语法分析器）- 3-5 天
2. **Transpiler**（代码生成器）- 3-5 天
3. **CLI 工具** - 2-3 天

---

## 🎓 学习资源

### 代码阅读
1. 从 `token.ts` 开始了解 Token 类型
2. 查看 `keywords.ts` 了解关键字映射
3. 深入 `tokenizer.ts` 学习实现细节

### 测试学习
1. 打开 `tokenizer.test.ts`
2. 查看各个 `describe` 块了解测试用例
3. 运行测试看执行过程：`pnpm -F @wencode/core test`

### 文档学习
1. 语言规范：[docs/language-spec.md](./docs/language-spec.md)
2. 开发计划：[docs/plan.md](./docs/plan.md)
3. 产品设计：[docs/context.md](./docs/context.md)

---

## 💻 IDE 支持

### VS Code
```bash
code .                    # 打开整个项目
code packages/core/src    # 打开源代码
```

### WebStorm / IntelliJ
```
File → Open → c:\Users\mjtan\Desktop\wencode
```

### 命令行编辑
```bash
cat packages/core/src/tokenizer.ts      # 查看文件
```

---

## 📞 常见问题

**Q: 如何开始开发？**
```
1. cd c:\Users\mjtan\Desktop\wencode
2. pnpm install
3. code .
4. 阅读 GETTING_STARTED.md
```

**Q: 如何运行测试？**
```
pnpm test
或
pnpm -F @wencode/core test
```

**Q: Tokenizer 在哪里？**
```
packages/core/src/tokenizer.ts
```

**Q: 如何查看文档索引？**
```
打开 INDEX.md 或 README.md
```

**Q: 下一步是什么？**
```
实现 Parser - 见 docs/plan.md Phase 1.3
```

---

## 🎊 总结

```
✨ WenCode 项目已准备好！

✅ 基础设施完整
✅ Tokenizer 完成
✅ 文档齐全
✅ 测试充分
⏳ Parser 待实现

预计 3-5 天完成 Parser，之后继续 Transpiler。
```

---

**快速链接**：[INDEX.md](./INDEX.md) | [README.md](./README.md) | [GETTING_STARTED.md](./GETTING_STARTED.md)

**版本**：v0.1.0 | **状态**：Early Development | **日期**：2025-12-10

