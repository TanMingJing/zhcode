# 📚 WenCode 文档索引

## 🌟 快速导航

### 📖 主要文档

#### 对于新人（从这里开始！）
1. **[README.md](./README.md)** - 项目概览和快速开始
2. **[GETTING_STARTED.md](./GETTING_STARTED.md)** - 详细的入门指南
3. **[COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)** - 项目完成总结

#### 对于开发者
4. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - 项目结构和文件说明
5. **[PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md)** - Phase 1 完成详情
6. **[docs/language-spec.md](./docs/language-spec.md)** - 完整的语言规范

#### 对于项目管理
7. **[docs/context.md](./docs/context.md)** - 产品设计和产品定位
8. **[docs/plan.md](./docs/plan.md)** - 完整的开发计划

---

## 📋 文档详细目录

### 根目录文档
```
README.md                  # 项目主文档，包含快速开始
GETTING_STARTED.md         # 快速开始指南，包含下一步任务
PROJECT_STRUCTURE.md       # 完整的项目结构说明
PHASE1_SUMMARY.md          # Phase 1 完成总结
COMPLETION_SUMMARY.md      # 项目设置完成总结
INDEX.md                   # 文档索引（本文件）
```

### docs/ 目录
```
docs/
├── context.md             # 产品设计和规格说明书
├── plan.md                # 四阶段开发计划
└── language-spec.md       # 完整的语言规范（新增）
```

### packages/core/src/ 源代码
```
packages/core/src/
├── token.ts               # Token 定义和类型枚举
├── keywords.ts            # 关键字映射表
├── tokenizer.ts           # 词法分析器实现
├── tokenizer.test.ts      # 单元测试（32 个测试）
└── index.ts               # 模块导出
```

---

## 🎯 按需求查找

### 📍 "我想了解项目"
- 开始阅读：[README.md](./README.md)
- 深入了解：[docs/context.md](./docs/context.md)
- 完整说明：[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

### 💻 "我想开始开发"
- 首先阅读：[GETTING_STARTED.md](./GETTING_STARTED.md)
- 项目结构：[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- 命令参考：见 README.md "开发命令" 部分

### 📚 "我想学习语言设计"
- 语言规范：[docs/language-spec.md](./docs/language-spec.md)
- 关键字映射：[packages/core/src/keywords.ts](./packages/core/src/keywords.ts)
- Token 定义：[packages/core/src/token.ts](./packages/core/src/token.ts)

### 🔧 "我想实现 Parser"
- 语言规范：[docs/language-spec.md](./docs/language-spec.md)
- Tokenizer 参考：[packages/core/src/tokenizer.ts](./packages/core/src/tokenizer.ts)
- 开发计划：[docs/plan.md](./docs/plan.md) 中的 Phase 1.3

### 🧪 "我想运行测试"
- 测试文件：[packages/core/src/tokenizer.test.ts](./packages/core/src/tokenizer.test.ts)
- 命令：见 GETTING_STARTED.md "运行测试" 部分

### 📊 "我想查看进度"
- 完成总结：[PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md)
- 项目进度：[docs/plan.md](./docs/plan.md) 中的检查清单

---

## 📄 文档概览

### README.md
- **长度**：~300 行
- **内容**：项目概览、快速开始、项目结构、技术栈
- **适合**：想快速了解项目的人

### GETTING_STARTED.md
- **长度**：~200 行
- **内容**：快速开始指南、工作流、下一步计划
- **适合**：刚开始开发的人

### PROJECT_STRUCTURE.md
- **长度**：~350 行
- **内容**：完整的目录树、文件说明、依赖关系、开发命令
- **适合**：需要了解项目结构的人

### PHASE1_SUMMARY.md
- **长度**：~280 行
- **内容**：Phase 1 完成详情、代码统计、测试覆盖、下一步建议
- **适合**：想了解已完成工作的人

### COMPLETION_SUMMARY.md
- **长度**：~280 行
- **内容**：完成情况、项目统计、使用示例、常见问题
- **适合**：想快速了解全局的人

### docs/context.md
- **长度**：~450 行
- **内容**：产品设计、特性说明、技术架构、应用场景
- **适合**：想了解产品设计的人

### docs/plan.md
- **长度**：~400 行
- **内容**：4 个开发阶段、详细任务清单、时间估计
- **适合**：项目经理和开发人员

### docs/language-spec.md
- **长度**：~550 行
- **内容**：完整的语言规范、语法定义、代码示例
- **适合**：语言设计和实现者

---

## 🔗 文件关系图

```
README.md (项目入口)
├── GETTING_STARTED.md (快速开始)
│   ├── PROJECT_STRUCTURE.md (项目结构)
│   └── docs/language-spec.md (语言规范)
│
├── docs/context.md (产品设计)
│   └── docs/plan.md (开发计划)
│
├── PHASE1_SUMMARY.md (完成总结)
│   └── COMPLETION_SUMMARY.md (设置总结)
│
└── packages/core/src/
    ├── token.ts
    ├── keywords.ts
    ├── tokenizer.ts
    └── tokenizer.test.ts
```

---

## 📊 文档统计

| 文档 | 行数 | 字数 | 创建日期 |
|------|------|------|---------|
| README.md | 300 | 4,500 | 2025-12-10 |
| GETTING_STARTED.md | 200 | 3,000 | 2025-12-10 |
| PROJECT_STRUCTURE.md | 350 | 5,000 | 2025-12-10 |
| PHASE1_SUMMARY.md | 280 | 4,000 | 2025-12-10 |
| COMPLETION_SUMMARY.md | 280 | 4,000 | 2025-12-10 |
| docs/context.md | 450 | 6,500 | 2025-12-10 |
| docs/plan.md | 400 | 6,000 | 2025-12-10 |
| docs/language-spec.md | 550 | 8,000 | 2025-12-10 |
| **总计** | **2,810** | **41,000+** | - |

---

## 🎓 学习路径

### 初级（了解项目）
1. [README.md](./README.md) - 10 分钟
2. [GETTING_STARTED.md](./GETTING_STARTED.md) - 15 分钟
3. [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) - 10 分钟

**总耗时**：~35 分钟

### 中级（开始开发）
1. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 20 分钟
2. [docs/language-spec.md](./docs/language-spec.md) - 30 分钟
3. [packages/core/src/](./packages/core/src/) - 浏览代码 30 分钟

**总耗时**：~80 分钟

### 高级（深度参与）
1. [docs/context.md](./docs/context.md) - 30 分钟
2. [docs/plan.md](./docs/plan.md) - 30 分钟
3. [PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md) - 25 分钟
4. 所有源代码 - 60 分钟
5. 所有单元测试 - 40 分钟

**总耗时**：~185 分钟

---

## ⚡ 快速命令参考

### 查看文档
```bash
# 使用默认编辑器打开
start README.md
start docs/language-spec.md
start PROJECT_STRUCTURE.md

# 或使用 VS Code
code README.md
```

### 查看源代码
```bash
# 打开 Tokenizer 实现
code packages/core/src/tokenizer.ts

# 打开测试文件
code packages/core/src/tokenizer.test.ts

# 打开整个项目
code .
```

### 运行命令
```bash
# 进入项目目录
cd c:\Users\mjtan\Desktop\wencode

# 安装依赖
pnpm install

# 运行测试
pnpm test

# 查看覆盖率
pnpm -F @wencode/core test:coverage
```

---

## 🚀 建议的阅读顺序

### 第 1 天（概览）
- [ ] [README.md](./README.md) - 了解项目
- [ ] [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) - 了解进度
- [ ] [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 了解结构

### 第 2 天（开发）
- [ ] [GETTING_STARTED.md](./GETTING_STARTED.md) - 学习如何开发
- [ ] [docs/language-spec.md](./docs/language-spec.md) - 学习语言设计
- [ ] 浏览 [packages/core/src/](./packages/core/src/) 代码

### 第 3 天（深化）
- [ ] [docs/context.md](./docs/context.md) - 理解产品设计
- [ ] [docs/plan.md](./docs/plan.md) - 理解开发计划
- [ ] [PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md) - 理解已完成工作
- [ ] 开始实现 Parser

---

## 🎯 按角色的推荐文档

### 项目经理
- **必读**：[docs/context.md](./docs/context.md), [docs/plan.md](./docs/plan.md)
- **参考**：[PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md)
- **工具**：docs/plan.md 中的时间表和里程碑

### 前端开发者
- **必读**：[README.md](./README.md), [GETTING_STARTED.md](./GETTING_STARTED.md)
- **参考**：[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **代码**：packages/ide/ 和 packages/core/

### 语言设计者
- **必读**：[docs/language-spec.md](./docs/language-spec.md)
- **参考**：[docs/context.md](./docs/context.md)
- **代码**：packages/core/src/

### 全栈开发者
- **必读**：所有文档
- **重点**：[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **代码**：所有 packages/

---

## 📞 获取帮助

### 常见问题

**Q: 从哪里开始？**
A: 从 [README.md](./README.md) 开始，然后阅读 [GETTING_STARTED.md](./GETTING_STARTED.md)

**Q: 如何查看项目结构？**
A: 查看 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

**Q: 如何运行代码？**
A: 查看 README.md 中的"开发命令"部分

**Q: 如何进行开发？**
A: 查看 [GETTING_STARTED.md](./GETTING_STARTED.md) 中的"立即操作"部分

**Q: 如何查看完成进度？**
A: 查看 [PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md) 或 [docs/plan.md](./docs/plan.md)

---

## 📌 最后更新

- **更新日期**：2025-12-10
- **版本**：v0.1.0
- **状态**：Early Development
- **下一步**：Parser 实现

---

**提示**：使用此索引快速找到所需的文档。所有文件都可在 VS Code 中打开。

