# 🏗️ ZhCode IDE - 技术架构文档

## 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                     Web Browser (Frontend)                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ZhCode IDE (React + Vite)             │   │
│  │                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   Monaco     │  │   Undo/Redo  │               │   │
│  │  │   Editor     │  │   Manager    │               │   │
│  │  └──────────────┘  └──────────────┘               │   │
│  │                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │  Cloud       │  │   Export &   │               │   │
│  │  │  Projects    │  │  Transpile   │               │   │
│  │  └──────────────┘  └──────────────┘               │   │
│  │                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │  AI History  │  │   Settings   │               │   │
│  │  │   Viewer     │  │   & Lang     │               │   │
│  │  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│                   appwriteService.ts                         │
└─────────────────────────────────────────────────────────────┘
                            ↕
         ┌──────────────────────────────────────┐
         │      Appwrite Cloud (Backend)        │
         │                                      │
         │  ┌────────────────────────────────┐  │
         │  │  Collections:                  │  │
         │  │  - ai_operations               │  │
         │  │  - zhcode_projects             │  │
         │  └────────────────────────────────┘  │
         │                                      │
         │  ┌────────────────────────────────┐  │
         │  │  Features:                     │  │
         │  │  - Authentication              │  │
         │  │  - Document Database           │  │
         │  │  - File Storage (optional)     │  │
         │  └────────────────────────────────┘  │
         └──────────────────────────────────────┘
```

---

## 模块设计

### 1. 核心编辑器模块（App.tsx）

#### 职责
- UI 布局管理
- 文件树导航
- 编辑器状态管理
- 代码编译和执行
- 用户交互事件处理

#### 关键状态

```typescript
// 文件管理
const [files, setFiles] = useState<Record<string, string>>({});
const [activeFile, setActiveFile] = useState('main.zhc');

// 撤销/重做
const [undoStack, setUndoStack] = useState<Record<string, string[]>>({});
const [redoStack, setRedoStack] = useState<Record<string, string[]>>({});

// 云端项目
const [showCloudProjects, setShowCloudProjects] = useState(false);
const [cloudProjects, setCloudProjects] = useState<ZhCodeProject[]>([]);
const [cloudProjectsLoading, setCloudProjectsLoading] = useState(false);
const [projectName, setProjectName] = useState('');
const [projectDescription, setProjectDescription] = useState('');

// AI 历史
const [showAIHistory, setShowAIHistory] = useState(false);
const [aiHistory, setAiHistory] = useState<AIOperation[]>([]);
const [aiHistoryLoading, setAiHistoryLoading] = useState(false);

// 设置
const [language, setLanguage] = useState<'zh' | 'en'>('zh');
const [selectedFramework, setSelectedFramework] = useState('auto');
```

#### 关键处理函数

```typescript
// 撤销/重做
handleUndo()              // 执行撤销
handleRedo()              // 执行重做  
handleReset()             // 重置文件

// 导出
handleExportCode()        // 导出为 JavaScript
handleExportProject()     // 导出项目为 JSON

// 云端项目
loadCloudProjects()       // 加载云端项目列表
handleSaveToCloud()       // 保存项目到云端
handleLoadFromCloud()     // 从云端加载项目
handleDeleteCloudProject()// 删除云端项目

// AI 操作
loadAIHistory()           // 加载 AI 操作历史
handleGenerateCode()      // 生成代码
handleGetSuggestions()    // 获取建议
```

---

### 2. Appwrite 服务模块（appwriteService.ts）

#### 职责
- 与 Appwrite API 交互
- 数据持久化（项目、AI 操作）
- 用户数据管理
- 错误处理和日志

#### API 端点

```typescript
// ========== AI 操作日志 ==========

// 记录单次 AI 操作
async logAIOperation(operation: AIOperation): Promise<void>

// 获取用户的 AI 操作历史（默认 50 条）
async getAIOperationHistory(userId: string, limit?: number): Promise<AIOperation[]>

// 获取用户的 AI 操作统计
async getOperationStats(userId: string): Promise<OperationStats>

// ========== 项目管理 ==========

// 保存项目到云端
async saveProjectToCloud(project: ZhCodeProject): Promise<void>

// 更新已有项目
async updateProjectInCloud(projectId: string, updates: Partial<ZhCodeProject>): Promise<void>

// 获取用户的所有项目
async getUserProjects(userId: string): Promise<ZhCodeProject[]>

// 获取单个项目详情
async getProject(projectId: string): Promise<ZhCodeProject>

// 删除项目
async deleteProject(projectId: string): Promise<void>
```

#### 数据模型

```typescript
// AI 操作记录
interface AIOperation {
  userId: string;
  actionType: 'generate' | 'explain' | 'optimize' | 'suggest';
  input: string;
  output: string;
  language: 'zh' | 'en';
  framework: 'zhcode' | 'react' | 'javascript' | 'other';
  status: 'success' | 'error';
  errorMessage?: string;
  code?: string;
  fileId?: string;
  timestamp: string;
}

// 项目结构
interface ZhCodeProject {
  userId: string;
  projectName: string;
  description: string;
  files: Record<string, string>;  // filename -> content
  mainFile: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isPublic?: boolean;
}

// 操作统计
interface OperationStats {
  totalOperations: number;
  operationsByType: Record<string, number>;
  operationsByFramework: Record<string, number>;
  successRate: number;
  lastUpdated: string;
}
```

#### 环境变量配置

```bash
VITE_APPWRITE_PROJECT_ID=6940e8610022e30d684a
VITE_APPWRITE_DATABASE_ID=zhcode_db
VITE_APPWRITE_COLLECTION_ID=ai_operations
# 额外集合 (可选)
VITE_APPWRITE_PROJECTS_COLLECTION_ID=zhcode_projects
```

---

### 3. 代码处理模块

#### 转译函数

```typescript
// ZhCode → JavaScript 转译
function transpileCode(code: string): string {
  // 1. 动态加载 @zhcode/core 编译器
  // 2. 执行编译流程：Tokenizer → Parser → Transpiler
  // 3. 返回转译后的 JavaScript 代码
  // 4. 若编译器加载失败，返回原始代码
}

// 浏览器文件下载
function downloadFile(content: string, filename: string, type: string): void {
  // 1. 创建 Blob 对象
  // 2. 生成 ObjectURL
  // 3. 创建临时 <a> 元素
  // 4. 触发下载
  // 5. 清理资源
}
```

---

## 数据流图

### 1. 编辑和撤销流程

```
编辑代码
   ↓
监听 onChange 事件
   ↓
更新文件内容
   ↓
添加到 undoStack
   ↓
清空 redoStack
   ↓
显示编译结果
   ↓
[Ctrl+Z 被按下]
   ↓
从 undoStack 弹出
   ↓
当前状态推入 redoStack
   ↓
恢复之前状态到编辑器
```

### 2. 云端保存流程

```
用户点击保存按钮
   ↓
打开云端项目面板
   ↓
用户输入项目名称
   ↓
用户点击"Save to Cloud"
   ↓
验证项目名称（必需）
   ↓
构建 ZhCodeProject 对象
   ├─ projectName
   ├─ description
   ├─ files（所有编辑器文件）
   ├─ mainFile
   ├─ language: 'zh'
   └─ userId
   ↓
调用 appwriteService.saveProjectToCloud()
   ↓
上传到 Appwrite
   ↓
成功 ✓
   ↓
刷新项目列表
   ↓
清空表单
   ↓
显示成功消息
```

### 3. 代码导出流程

```
用户点击导出按钮
   ↓
获取当前文件内容
   ↓
调用 transpileCode()
   ↓
[编译器加载]
   ├─ Tokenizer：分词
   ├─ Parser：生成 AST
   └─ Transpiler：生成 JavaScript
   ↓
生成 JavaScript 代码
   ↓
调用 downloadFile()
   ├─ 创建 Blob
   ├─ 生成下载链接
   └─ 触发浏览器下载
   ↓
文件保存到下载文件夹
```

### 4. AI 操作日志流程

```
用户执行 AI 操作（生成/解释/优化）
   ↓
调用 AI 服务
   ↓
AI 返回结果
   ↓
构建 AIOperation 对象
   ├─ 操作类型
   ├─ 输入输出
   ├─ 框架检测（自动）
   ├─ 语言检测（自动）
   └─ 时间戳
   ↓
调用 appwriteService.logAIOperation()
   ↓
保存到 Appwrite（异步，后台执行）
   ↓
更新编辑器中的代码
   ↓
（用户继续工作）
   ↓
[用户点击 📖 查看历史]
   ↓
调用 loadAIHistory()
   ↓
从 Appwrite 获取最近 50 条
   ↓
显示在历史面板
```

---

## 文件结构

```
packages/ide/
├── src/
│   ├── services/
│   │   ├── appwriteService.ts      [NEW] 云端存储和 AI 日志
│   │   ├── aiService.ts            [现有] AI 接口
│   │   └── compilerService.ts      [现有] 编译器
│   │
│   ├── App.tsx                     [已更新] 主组件
│   │   ├── 撤销/重做管理
│   │   ├── 云端项目管理
│   │   ├── 导出功能
│   │   ├── AI 历史查看
│   │   └── UI 布局
│   │
│   ├── components/
│   │   ├── Editor.tsx              [现有] 编辑器
│   │   ├── FileTree.tsx            [现有] 文件树
│   │   ├── OutputPanel.tsx         [现有] 输出面板
│   │   ├── CloudProjectsModal.tsx  [NEW] 云端项目面板
│   │   ├── AIHistoryModal.tsx      [NEW] AI 历史面板
│   │   └── SettingsPanel.tsx       [已更新] 设置面板
│   │
│   └── styles/
│       └── app.css                 [已更新] 样式
│
└── package.json                    [已更新] 依赖

```

---

## 集成点

### 与 Appwrite 的集成

```typescript
// 初始化 Appwrite 客户端
const appwrite = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_ID);

const databases = new Databases(appwrite);
const users = new Users(appwrite);

// 使用 Appwrite 集合
// - ai_operations：存储所有 AI 操作记录
// - zhcode_projects：存储用户项目

// 查询示例
const docs = await databases.listDocuments(
  DATABASE_ID,
  'ai_operations',
  [Query.equal('userId', userId)]
);
```

### 与编译器的集成

```typescript
// 动态导入编译器
import('@zhcode/core').then(module => {
  const { compile } = module;
  const js = compile(zhcodeSource);
});

// 或者通过脚本标签加载（浏览器环境）
// <script src="https://.../@zhcode/core/dist/index.umd.js"></script>
```

### 与 AI 服务的集成

```typescript
// 现有的 AI 服务调用
const response = await callAIService({
  prompt: enhancedPrompt,
  language: selectedLanguage,
  framework: detectedFramework,
  temperature: 0.7,
  maxTokens: 2000
});

// 自动记录
await logAIOperation({
  actionType: 'generate',
  input: userPrompt,
  output: response,
  language: selectedLanguage,
  framework: detectedFramework,
  status: 'success'
});
```

---

## 错误处理

### Appwrite 操作的错误处理

```typescript
try {
  await saveProjectToCloud(project);
} catch (error) {
  if (error.code === 409) {
    // 项目已存在
    console.error('Project already exists');
  } else if (error.code === 401) {
    // 未授权
    console.error('Unauthorized access');
  } else {
    // 其他错误
    console.error('Failed to save project:', error);
  }
  // 显示用户友好的错误提示
}
```

### 转译错误的处理

```typescript
function transpileCode(code: string): string {
  try {
    const compiled = ZhCodeCompiler.compile(code);
    return compiled.output;
  } catch (error) {
    console.error('Transpile error:', error);
    // 返回原始代码作为备选
    return code;
  }
}
```

---

## 性能优化

### 1. 防抖编译

```typescript
const debouncedCompile = useCallback(
  debounce(async (code) => {
    const result = await compile(code);
    setOutput(result);
  }, 500),
  []
);
```

### 2. 异步 AI 操作日志

```typescript
// 不阻塞主线程
setTimeout(() => {
  logAIOperation(operation).catch(err => {
    console.error('Failed to log:', err);
  });
}, 0);
```

### 3. 本地缓存

```typescript
// 缓存最近的编译结果
const [compilationCache, setCompilationCache] = useState({});

if (compilationCache[code]) {
  return compilationCache[code];
}
```

---

## 安全考虑

### 1. 用户认证
- 使用 Appwrite 的用户认证系统
- localStorage 存储 userId（可改为 Session）

### 2. 数据隐私
- 所有项目数据仅可被项目所有者访问
- 支持项目公开/私有设置（未来扩展）

### 3. 代码执行安全
- 在 Worker 线程或沙箱中执行用户代码（可选）
- 防止恶意代码访问 DOM

### 4. API 安全
- Appwrite 服务器端验证
- API Key 通过环境变量安全传递
- Rate limiting（由 Appwrite 提供）

---

## 扩展性考虑

### 1. 数据库扩展
- 使用 Appwrite 的数据库分表策略
- 支持数据备份和同步

### 2. API 扩展
- 可添加更多集合（评论、协作等）
- 支持 Webhooks 触发自定义逻辑

### 3. 功能扩展
- 项目标签和分类
- 项目搜索和过滤
- 项目共享和权限管理
- 版本控制和分支管理

---

## 测试策略

### 单元测试
```typescript
// 测试转译函数
describe('transpileCode', () => {
  it('should convert ZhCode to JavaScript', () => {
    const result = transpileCode('函数 test() { 返回 42 }');
    expect(result).toContain('function test()');
  });
});
```

### 集成测试
```typescript
// 测试完整的保存流程
describe('Cloud Projects', () => {
  it('should save and load project', async () => {
    const project = { projectName: 'Test', ... };
    await saveProjectToCloud(project);
    const loaded = await getProject(projectId);
    expect(loaded.projectName).toBe('Test');
  });
});
```

### 端到端测试
```typescript
// 使用 Cypress 或 Playwright
describe('IDE Workflow', () => {
  it('should create, edit, save and export project', () => {
    cy.visit('http://localhost:3001');
    cy.type('code here');
    cy.click('[data-testid="save-cloud"]');
    cy.click('[data-testid="export"]');
    // ...
  });
});
```

---

## 部署架构

```
GitHub Repository
        ↓
  GitHub Actions CI/CD
        ↓
   Build & Test
        ↓
   Deploy to Vercel (Frontend)
        ↓
   http://localhost:3001 (Dev)
   https://zhcode.vercel.app (Production)
        ↓
  Connected to Appwrite Cloud
        ↓
  [用户数据和 AI 历史]
```

---

## 监控和日志

### 前端日志
```typescript
// 记录关键操作
console.log('[Save Project] Saving to cloud:', projectName);
console.log('[AI Operation] Generated code:', output);
console.log('[Error] Failed to transpile:', error);
```

### 后端日志（Appwrite）
- 所有数据库操作自动记录
- 通过 Appwrite Dashboard 查看

### 性能监控
```typescript
// 记录编译时间
const start = performance.now();
const result = compile(code);
const duration = performance.now() - start;
console.log(`Compile time: ${duration}ms`);
```

---

**更新于：2024-12-16**  
**版本：v1.3.0**
