# 中文现代编程语言项目（代号：华语代码语言）Context Document

## 1. 项目简介

本项目旨在开发一款以华语（中文）为主要关键字与语义的现代编程语言，同时兼容 JavaScript 生态体系，并可与 React.js 等前端框架无缝对接。语言保留常见编程符号（括号、逗号、大括号、运算符），以确保代码可读性与解析稳定性。项目还将集成 AI 功能，以提供自动补全、语义生成、错误解释等增强能力，使其成为全球首款**中文语义 + AI 驱动 + JS/React 兼容**的编程语言。

---

## 2. 产品定位

* **目标用户**：中文开发者、编程初学者、教育机构、企业内部自动化团队。
* **核心价值**：使用中文构建逻辑，降低学习曲线，同时保持现代生态能力（npm、React、JS 互转）。
* **应用场景**：前端开发、AI 工具开发、自动化脚本、教育课程、企业内部工具。

---

## 3. 产品主要特性

### 3.1 中文关键字

* 替换 JS 常用关键词为中文，例如：

  * `function` → `函数`
  * `return` → `返回`
  * `if` → `如果`
  * `else` → `否则`
  * `for` → `对于`
  * `let` → `令`
  * `const` → `常量`
  * `import` → `导入`
  * `export` → `导出`

### 3.2 保留编码符号

语言使用：

* `()` 参数与判断区块
* `{}` 作用域
* `,` 参数分隔符
* `[]` 数组
* `;` 可选结尾符
* `<>` 保留 JSX 支持

这样能兼容工具链、打包器、AST 解析器、React JSX 等。

### 3.3 编译到 JavaScript（Transpiler）

通过自定义 Parser 将中文关键字转换为 JS，所有功能最终执行于 JS Runtime。

示例：

```
函数 加法(a, b) {
  返回 a + b;
}
```

编译后：

```
function 加法(a, b) {
  return a + b;
}
```

或进一步转换为可运行 JS：

```
function add(a, b) {
  return a + b;
}
```

### 3.4 React.js 兼容

语言原生支持 JSX：

```
组件 按钮() {
  返回 <按钮 onClick={() => 执行()}>点我</按钮>;
}
```

### 3.5 AI 集成能力

* **AI 自动代码生成**（自然语言 → 中文代码）
* **AI 自动补全**（LSP）
* **AI 错误解释器**（智能 Debugger）
* **AI 转 JS/英文解释**
* **AI 整段逻辑自动优化**

### 3.6 多终端开发支持

* Web IDE
* VS Code Extension
* Node.js CLI 编译器

---

## 4. 技术架构

### 4.1 前端（编译器界面与 IDE）

* React.js + Vite
* Monoco Editor / CodeMirror

### 4.2 核心引擎

* Tokenizer（中文/符号双语法词法分析）
* AST Parser（基于 JavaScript AST 拓展）
* Transpiler（输出 JS）
* AI 引擎接口（本地或云端模型）

### 4.3 后端

* Node.js 运行编译服务
* AI 服务（可集成本地模型或云端 API）
* 项目构建工具（类似 Babel/ESBuild）

---

## 5. AI 功能模块详细描述

### 5.1 AI 自动代码生成

用户输入中文需求：

> 创建一个函数用于计算数组平均值

AI 自动生成：

```
函数 平均值(列表) {
  令 总和 = 0;
  对于(每个 数字 属于 列表) {
    总和 = 总和 + 数字;
  }
  返回 总和 / 列表.length;
}
```

### 5.2 AI 错误解释模块

编译器出现错误：

```
错误：未定义变量 x
```

AI 自动分析：

> “你在这个函数内部使用了 x，但没有定义或传入参数，建议添加 `令 x = ...` 或检查输入变量。”

### 5.3 AI 优化器

自动重构、改善性能或改写更清晰的中文代码。

---

## 6. 语法设计（Language Spec 草案）

* **变量声明**：`令 名称 = 值;`
* **常量声明**：`常量 名称 = 值;`
* **函数声明**：`函数 名称(参数) { ... }`
* **条件判断**：`如果(...) {}`、`否则 {}`
* **循环**：`对于(每个 项 属于 列表)`
* **导入/导出**：`导入 模块` / `导出 函数`
* **组件声明**（可选）：`组件 名称() { ... }`
* **AI 指令（可选语法）**：`@AI 生成代码: "描述"`

---

## 7. 应用场景

* 程序教育（更易入门）
* Web 前端开发（兼容 React）
* AI 编程助手应用
* 企业内部自动化脚本
* 低代码场景（AI 补全 + 中文逻辑）

---

## 8. 产品未来路线图

### Phase 1：核心语言原型

* 关键字设计
* 语法规范
* Transpiler Prototype

### Phase 2：React 兼容 & 工具链

* JSX 支持
* NPM 打包
* Web IDE Demo

### Phase 3：AI 驱动开发

* LSP + AI 补全
* 错误解释
* 命令式生成模块

### Phase 4：正式发布

* 官方文档
* 案例库
* 开源仓库

---

## 9. 项目名称（暂定）

* 华语代码语言（代号 HL）
* 中文现代脚本语言（CMScript）
* 中语编程（ZhongCode）
* 文语编程语言（WenLang）

可根据用户进一步选择最终名称。

---

## 10. 用户教学文档（Language Guide）

本语言将附带一份官方用户文档，指导用户如何使用中文编程语言，从基础到高级用法。文档将包含以下内容：

### 10.1 入门

* 安装编译器或 IDE 的方法
* 运行第一段程序（"你好，世界"）
* 基本代码结构说明

示例：

```
函数 主程序() {
  打印("你好，世界");
}
```

### 10.2 语言基本语法

* 变量声明（令 / 常量）
* 条件判断（如果 / 否则）
* 循环（对于 / 属于）
* 函数定义与调用
* 模块导入/导出（导入 / 导出）

### 10.3 React.js UI 开发教程

* 如何编写组件（组件 关键字）
* JSX 混用中文关键字
* 事件绑定与状态管理（保持与 React 一致）

### 10.4 深入语法

* 数组与对象
* 异步编程（支持 async/await 或中文关键字）
* 错误处理（尝试 / 捕获）

### 10.5 AI 功能操作指南

* 使用 AI 自动生成代码
* 使用 AI 自动解释错误
* 使用 AI 优化代码
* 使用自然语言生成 React 组件

### 10.6 IDE 使用指南

* 文件树、编辑器、终端、主题切换
* 一键编译、一键运行
* 自动补全与提示
* 如何从 IDE 导出 JavaScript

### 10.7 高级技术

* 自定义库
* 调用 JavaScript 模块
* 如何扩展语言

---

## 11. 本 Context 目的

本文件将作为：

* 产品开发的统一规格说明
* AI 任务分配的基础资料
* 文档、IDE、编译器开发的指导蓝图
* 用户教学文档（Language Guide）的结构来源

确保所有未来开发流程、文档结构、AI 回答都与本 Context 保持一致。

---
## 12. 推荐技术栈（Tech Stack）

1. 前端（IDE / Playground / 文档网站）

框架：React.js + Vite / Next.js

代码编辑器：Monaco Editor（VS Code 同款）或 CodeMirror

样式：Tailwind CSS / CSS Modules

组件库（可选）：Radix UI / shadcn/ui

可视化/Canvas：HTML Canvas / react-konva（用于图形演示或教学）

状态管理：React Context / Zustand / Jotai（轻量状态）

国际化：i18next（支持中文、英文）

2. 核心语言解析层（Parser / Transpiler）

语言解析：Chevrotain / Nearley / PEG.js（中文关键字到 AST）

AST 操作：Babel / Acorn（JS AST）

Transpiler：自定义 JS 生成器

运行环境：浏览器 JS runtime / Node.js

3. 后端（可选，主要用于 AI 或多用户管理）

运行平台：Node.js / Deno（轻量、现代）

Web 框架：Express.js / Fastify / Nest.js（API 服务）

AI 服务接口：REST API 或 WebSocket 接口调用 AI 模型

数据库：

用户数据 & 项目管理：PostgreSQL

代码片段 & 文档存储：MongoDB

轻量/前端 IDE：LocalStorage / IndexedDB

缓存：Redis（可选，支持 AI 推理缓存或 session 数据）

4. AI 模块

云端 API：OpenAI GPT / Azure OpenAI / DeepSeek 等

本地模型（可选）：WebGPU / ONNX / LLaMA / MPT 等

接口封装：自定义 AIProvider 类，统一调用生成、解释、优化功能

5. 构建与打包

前端打包：Vite / Webpack

后端打包：esbuild / Bun

TypeScript：推荐全程使用 TS，增强类型安全

代码规范：Prettier + ESLint

6. 部署

前端：Vercel / Netlify / Cloudflare Pages

后端：Railway / Render / Fly.io（轻量 Node.js 服务）

数据库：Supabase / PlanetScale / MongoDB Atlas（全托管）

版本控制：Git + GitHub / GitLab

7. 可选扩展

VS Code 插件：Language Server Protocol (LSP)

Electron 桌面版 IDE：React + Monaco Editor + Node.js

CI/CD：GitHub Actions / GitLab CI
