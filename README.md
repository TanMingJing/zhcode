# 华语代码语言（WenCode）

A modern programming language with Chinese keywords, AI-driven development, and JavaScript/React compatibility.

## 项目概述

**WenCode** 是一款革命性的编程语言，旨在：
- 📝 使用中文关键词编程（`函数`、`返回`、`如果`等）
- 🤖 集成 AI 功能（自动代码生成、错误解释、代码优化）
- ⚛️ 与 React.js 和 JavaScript 生态完全兼容
- 🎓 降低编程学习曲线，适合初学者和教育机构
- 🔄 编译到 JavaScript，利用现有工具链

## 项目结构

```
wencode/
├── packages/
│   ├── core/              # 语言解析层（Tokenizer, Parser, Transpiler）
│   ├── cli/               # 命令行工具
│   ├── ide/               # Web IDE（React + Vite）
│   ├── vscode-ext/        # VS Code 扩展
│   └── ai-service/        # AI 后端服务
├── docs/                  # 项目文档
│   ├── context.md         # 产品设计与规格说明
│   └── plan.md            # 开发计划与检查清单
├── examples/              # 代码示例
├── package.json           # 根工作区配置
└── .github/workflows/     # GitHub Actions CI/CD
```

## 快速开始

### 环境要求
- Node.js 18.0+
- pnpm 8.0+

### 安装依赖
```bash
pnpm install
```

### 开发命令

```bash
# 启动所有包的开发模式
pnpm dev

# 构建所有包
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm type-check
```

### 按包操作

```bash
# 仅在 core 包中运行
pnpm -F @wencode/core build

# 在 IDE 包中启动开发服务器
pnpm -F @wencode/ide dev
```

## 包描述

### @wencode/core
语言核心引擎，包含：
- **Tokenizer**: 中文和符号的词法分析
- **Parser**: AST 解析器
- **Transpiler**: 转译到 JavaScript

### @wencode/cli
命令行工具：
- `wencode compile <file>` - 编译文件
- `wencode run <file>` - 运行文件
- `wencode init` - 初始化项目

### @wencode/ide
基于 React 和 Vite 的 Web IDE，包含：
- 代码编辑器（Monaco Editor）
- 文件树导航
- 实时编译与执行
- 主题切换

### @wencode/vscode-ext
VS Code 扩展，提供：
- 语法高亮
- 代码片段
- 编译和运行支持
- 语言服务（LSP）

### @wencode/ai-service
AI 驱动的后端服务：
- 自动代码生成
- 错误解释
- 代码优化建议
- AI 补全

## 开发阶段

### Phase 1: 核心语言原型 ✅ 规划中
- [ ] 关键字定义与语法规范
- [ ] Tokenizer 实现
- [ ] Parser 实现
- [ ] Transpiler 实现
- [ ] CLI 工具基础框架

### Phase 2: React 兼容 & 工具链
- [ ] JSX 支持
- [ ] 组件语法
- [ ] Web IDE 原型
- [ ] NPM 集成

### Phase 3: AI 驱动开发
- [ ] AI 服务集成
- [ ] 自动代码生成
- [ ] 错误解释
- [ ] 代码优化

### Phase 4: 正式发布
- [ ] 官方文档
- [ ] 案例库
- [ ] 社区建设
- [ ] v1.0.0 发布

详见 [plan.md](docs/plan.md) 了解完整的开发计划。

## 代码示例

### 基础语法
```wencode
函数 问好(名字) {
  返回 "你好，" + 名字;
}

打印(问好("世界"));
```

### React 组件
```wencode
组件 计数器() {
  令 [计数, 设置计数] = 使用状态(0);
  
  返回 (
    <div>
      <p>计数: {计数}</p>
      <button onClick={() => 设置计数(计数 + 1)}>
        点击
      </button>
    </div>
  );
}
```

更多示例见 [examples/](examples/) 目录。

## 文档

- [Context 文档](docs/context.md) - 产品设计、特性、技术架构
- [开发计划](docs/plan.md) - 详细的分阶段开发清单
- [语言规范](docs/language-spec.md)（待完成）
- [API 文档](docs/api.md)（待完成）

## 技术栈

### 前端
- React 18
- Vite
- TypeScript
- Tailwind CSS (规划)

### 后端
- Node.js
- Express.js / Fastify (规划)
- TypeScript

### 解析与编译
- Chevrotain / PEG.js (规划)
- Babel (转译)

### AI
- OpenAI GPT API (规划)
- Azure OpenAI / DeepSeek (备选)

### 开发工具
- ESLint
- Prettier
- Vitest
- GitHub Actions

## 贡献指南

我们欢迎社区贡献！请参考 [CONTRIBUTING.md](CONTRIBUTING.md)（待完成）。

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 📧 邮件：mjtan091123@gmail.com
- 💬 讨论：GitHub Discussions

## 致谢

感谢所有贡献者和支持者！

---

**更新时间**: 2025-12-10  
**当前版本**: v0.1.0 (Early Development)
