# ZhCode IDE - AI Features

## Overview

The ZhCode IDE has been enhanced with comprehensive AI-powered features to assist developers with code generation, error explanation, code analysis, and refactoring suggestions.

## Architecture

### Backend (AI Service)
- **Location**: `packages/ai-service/`
- **Technology**: Express.js + TypeScript
- **Port**: 3001
- **Status**: Running with hot reload via `tsx watch`

### Frontend (IDE)
- **Location**: `packages/ide/`
- **Technology**: React 18 + Monaco Editor + Vite
- **Integration**: REST API calls to AI service
- **UI**: Collapsible AI assistant panel

## Features

### 1. 🤖 AI Assistant Panel
- **Toggle Button**: "✨ AI 助手" button in the header
- **Position**: Right sidebar (collapsible)
- **Styling**: Dark theme with blue accent colors matching VS Code

### 2. 📝 Code Explanation
- **Endpoint**: `POST /api/explain-code`
- **Input**: Selected code from editor
- **Output**: Detailed explanation of code logic, functions, and control flow
- **Use Case**: Understand what code does

### 3. ⚠️ Error Explanation
- **Endpoint**: `POST /api/explain-error`
- **Input**: Compilation error message
- **Output**: Chinese explanation + practical fix suggestions
- **Use Case**: Understand why code failed and how to fix it

### 4. ✍️ Code Generation
- **Endpoint**: `POST /api/generate`
- **Input**: Natural language description (Chinese)
- **Output**: Generated ZhCode that matches the description
- **Examples**:
  - "创建一个求和函数" → Generates sum function
  - "打印 1 到 10 的数字" → Generates loop with print statement

### 5. 💭 Code Suggestions
- **Endpoint**: `POST /api/suggest-refactor`
- **Input**: Code from editor
- **Output**: Improvement suggestions including:
  - Function length optimization
  - Variable naming recommendations
  - Nested condition simplification
  - Code complexity warnings
- **Use Case**: Improve code quality and maintainability

### 6. 🔤 Autocomplete
- **Endpoint**: `POST /api/autocomplete`
- **Input**: Partial keyword (e.g., "打")
- **Output**: Matching ZhCode keywords and built-in functions
- **Keywords**: 打印, 如果, 否则, 当, 返回, 函数, 变量, 等等

## API Endpoints

### Health Check
```
GET /health
Response: { status: "ok", service: "ZhCode AI Service v0.1.0" }
```

### Autocomplete
```
POST /api/autocomplete
Request: { partial: "打" }
Response: { suggestions: ["打印", "打开", ...] }
```

### Code Generation
```
POST /api/generate
Request: { description: "创建一个求和函数" }
Response: { code: "函数 求和(数字列表) { ... }" }
```

### Explain Error
```
POST /api/explain-error
Request: { error: "Expected SEMICOLON", code: "...", line: 1 }
Response: { explanation: "缺少分号...", suggestion: "在行尾添加分号" }
```

### Explain Code
```
POST /api/explain-code
Request: { code: "打印(5 + 3)" }
Response: { explanation: "这段代码计算 5 加 3 的结果并打印出来..." }
```

### Suggest Refactor
```
POST /api/suggest-refactor
Request: { code: "..." }
Response: { suggestions: ["函数过长，建议分解", "变量命名不清晰", ...] }
```

## Implementation Details

### AI Logic (Current)
- **Type**: Heuristic-based AI simulation
- **Method**: Keyword matching, pattern recognition, template generation
- **Advantages**: Fast, lightweight, works offline
- **Limitations**: Basic intelligence, hardcoded responses

### Future Enhancements
- Integration with LLM APIs (OpenAI, Claude, etc.)
- Persistent suggestion history
- User preference learning
- Multi-language support
- Advanced code analysis

## UI Components

### AI Panel
```
┌─────────────────────────┐
│ ✨ AI 助手          [×]│  (Header)
├─────────────────────────┤
│                         │
│ [Explain Code]          │  (Tool Buttons)
│ [Explain Error]         │
│ [Get Suggestions]       │
│                         │
│ 🎯 代码生成            │  (Code Generation)
│ [Textarea]              │
│ [✍️ 生成代码]          │
│                         │
│ 📝 AI 解释 (Conditional)│  (Output Sections)
│ [Copy Button]           │
│                         │
│ 💭 建议 (Conditional)   │
│ • Suggestion 1          │
│ • Suggestion 2          │
│                         │
└─────────────────────────┘
```

## CSS Classes

- `.ai-panel` - Main panel container
- `.ai-header` - Panel header with title and close button
- `.ai-content` - Scrollable content area
- `.ai-tools` - Tool buttons container
- `.btn-ai` - AI toggle button in header
- `.btn-ai-tool` - Individual AI tool buttons
- `.ai-generate` - Code generation section
- `.ai-input` - Natural language input textarea
- `.ai-explanation` - Explanation output display
- `.ai-suggestions` - Suggestions list display
- `.btn-generate` - Generate code button

## Running the System

### Start AI Service
```bash
cd packages/ai-service
pnpm dev
# Server runs on http://localhost:3001
```

### Start IDE
```bash
cd packages/ide
pnpm dev
# IDE runs on http://localhost:3001 (or available port)
```

### Run Tests
```bash
pnpm test
# All 127 tests should pass
```

## Usage Examples

### Example 1: Generate Code
1. Click "✨ AI 助手" button
2. In code generation section, type: "创建一个循环打印1到10"
3. Click "✍️ 生成代码"
4. Generated code appears in editor

### Example 2: Explain Error
1. Write invalid ZhCode that causes compilation error
2. Click "✨ AI 助手" button
3. Click "⚠️ 错误解释"
4. AI explains the error in Chinese with fix suggestion

### Example 3: Code Explanation
1. Select code in editor
2. Click "✨ AI 助手" button
3. Click "📝 解释代码"
4. AI explains what the selected code does

### Example 4: Get Suggestions
1. Click "✨ AI 助手" button
2. Click "💭 获取建议"
3. AI analyzes current code and provides improvement suggestions

## Technical Stack

### Frontend
- React 18.3.1
- Monaco Editor (VS Code editor)
- Vite 5.4.21
- TypeScript 5.9.3
- Fetch API for HTTP requests

### Backend
- Express.js 4.22.1
- CORS 2.8.5
- tsx 4.21.0 (TypeScript runner)
- @zhcode/core (compiler)

### Build & Test
- pnpm (workspaces)
- Vitest 1.6.1
- TypeScript 5.9.3

## Status

✅ **Completed**
- AI service backend with 6 endpoints
- React frontend integration
- UI components and styling
- Error handling
- State management
- Hot reload for development

⏳ **In Progress**
- Testing all AI features end-to-end
- Performance optimization

🔮 **Future**
- LLM integration (OpenAI, Claude)
- Advanced code analysis
- Persistent history
- User settings/preferences
- Syntax highlighting for ZhCode
- Advanced autocomplete in editor

## Notes

- The AI service must be running on port 3001 for IDE features to work
- All responses are in Chinese for better UX with ZhCode language
- Features use heuristic matching (not real AI yet)
- Can be easily upgraded to use OpenAI or other LLM APIs
