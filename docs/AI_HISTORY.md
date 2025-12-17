# AI 操作记录功能说明

## 📋 功能概述

ZhCode IDE 现已集成 Appwrite 后端，可以记录并回溯所有 AI 操作过程。

## 🎯 核心功能

### 1. **自动记录 AI 操作**
   - ✅ 代码解释 (`explain-code`)
   - ✅ 错误解释 (`explain-error`)
   - ✅ 代码优化建议 (`suggest-refactor`)
   - ✅ 代码生成 (`generate`)

### 2. **记录详情**
   每次 AI 操作都会记录：
   ```
   - 用户 ID
   - 操作类型
   - 输入内容
   - 输出内容
   - 代码框架（自动检测）
   - 使用语言（中文/英文）
   - 操作状态（成功/失败）
   - 错误信息（如果有）
   - 时间戳
   ```

### 3. **查看历史记录**
   - 点击头部 **📖** 按钮打开历史面板
   - 显示最近 50 条操作记录
   - 按时间倒序排列

### 4. **框架自动检测**
   应用会自动检测代码类型：
   - 🟦 **ZhCode**: 包含 `函数`、`返回`、`令` 等中文关键字
   - ⚛️ **React/TypeScript**: 包含 `import`、`useState`、`useEffect` 等
   - 📄 **JavaScript**: 其他代码

### 5. **多语言支持**
   - 🇨🇳 中文模式：所有提示和记录都是中文
   - 🇺🇸 英文模式：所有提示和记录都是英文

## 🔧 使用流程

### 基础使用（无需 Appwrite 配置）
```
1. 打开 ZhCode IDE
2. 进行任何 AI 操作（解释、生成等）
3. 如果 Appwrite 未配置，操作仍正常工作但不会保存历史
```

### 启用云端记录（需要 Appwrite）
```
1. 在 Appwrite Cloud 创建项目
2. 配置 .env 文件中的项目 ID 和数据库信息
3. 所有 AI 操作将自动保存到云端
4. 点击 📖 按钮查看完整历史
```

## 📊 历史面板示例

```
AI 操作历史
┌─────────────────────────────────┐
│ ✓ 成功  | explain-code | React    │ 14:32:10
│ 输入: 解释这个 useState...
│ 输出: useState 是 React Hook...
├─────────────────────────────────┤
│ ✓ 成功  | generate | ZhCode      │ 14:28:45
│ 输入: 创建一个计算器函数
│ 输出: 函数 计算器(a, b)...
├─────────────────────────────────┤
│ ✗ 失败  | suggest-refactor | JS   │ 14:25:20
│ 输入: 优化这个函数
│ 输出: 
│ 错误: API 连接失败
└─────────────────────────────────┘
```

## 🚀 键盘快捷键

- **Ctrl+Z** - 撤销代码编辑
- **Ctrl+Y** - 重做代码编辑
- **点击 🕐** - 重置文件到原始状态
- **点击 📖** - 打开 AI 操作历史

## 📁 文件结构

```
packages/ide/src/
├── services/
│   └── appwriteService.ts    # Appwrite 集成服务
├── App.tsx                    # 主应用（包含历史面板）
└── ...

docs/
├── APPWRITE_SETUP.md         # 详细配置指南
└── ...
```

## 🔐 数据安全

- 所有数据存储在 Appwrite Cloud
- API Key 本地存储在浏览器 localStorage
- 支持环境变量配置
- 允许自托管 Appwrite 实例

## ⚙️ 环境变量

在 `.env` 文件中配置：

```env
# Appwrite 项目 ID
VITE_APPWRITE_PROJECT_ID=your_project_id

# 数据库 ID
VITE_APPWRITE_DATABASE_ID=zhcode_db

# 集合 ID  
VITE_APPWRITE_COLLECTION_ID=ai_operations
```

## 📞 常见问题

**Q: 如果没有配置 Appwrite 怎么办？**
A: 应用仍然正常工作，只是不会记录历史。

**Q: 可以自托管 Appwrite 吗？**
A: 可以，修改 `appwriteService.ts` 中的 endpoint 即可。

**Q: 历史记录会被保留多久？**
A: 取决于 Appwrite 项目设置，可以永久保留或设置过期时间。

**Q: 可以导出操作历史吗？**
A: 可以通过 Appwrite API 导出，或在历史面板中手动复制。

## 📚 更多信息

详见 [APPWRITE_SETUP.md](./APPWRITE_SETUP.md) 了解完整的配置步骤。
