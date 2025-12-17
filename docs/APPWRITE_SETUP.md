# ZhCode IDE - Appwrite 集成指南

## 功能说明

ZhCode IDE 现在可以记录每一个 AI 操作过程，包括：
- **操作类型**: 解释代码、解释错误、代码优化、代码生成
- **输入/输出**: 记录 AI 的输入和输出
- **代码框架**: 自动检测是 ZhCode、React/TypeScript 还是 JavaScript
- **操作语言**: 中文或英文
- **成功/失败状态**: 跟踪操作是否成功
- **时间戳**: 记录每个操作的时间

## 快速开始

### 1. 在 Appwrite Cloud 上创建账户

1. 访问 [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. 创建或登录你的账户
3. 创建一个新项目

### 2. 配置数据库和集合

在 Appwrite 控制台中：

1. **创建数据库**:
   - 名称: `zhcode_db` (或其他名称)
   - 复制数据库 ID

2. **创建集合**:
   - 数据库: 选择上面创建的数据库
   - 名称: `ai_operations`
   - 复制集合 ID

3. **添加属性**:
   在集合中创建以下属性（或让应用自动创建）:
   ```
   userId (String, required)
   actionType (String, required) - explain-code, explain-error, suggest-refactor, generate
   input (String, required)
   output (String, required)
   language (String) - zh, en
   framework (String) - ZhCode, React/TypeScript, JavaScript
   status (String) - success, error
   errorMessage (String)
   code (String)
   fileId (String)
   timestamp (DateTime)
   ```

### 3. 配置环境变量

在 `packages/ide/.env` 文件中：

```env
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=zhcode_db
VITE_APPWRITE_COLLECTION_ID=ai_operations
```

### 4. 启用权限

在 Appwrite 控制台的集合权限中，允许：
- 文档级别的读写权限
- 或者配置 API 密钥认证

### 5. 在 IDE 中使用

- 所有 AI 操作（解释、生成、优化等）都会自动记录
- 点击头部的 **📖 按钮** 可以查看 AI 操作历史
- 每条记录显示：
  - 操作类型和状态（成功/失败）
  - 代码框架（ZhCode/React/JavaScript）
  - 输入和输出内容
  - 操作时间
  - 错误信息（如果有）

## 特点

✅ **自动记录**: 每个 AI 操作都自动保存到 Appwrite  
✅ **框架检测**: 自动识别代码类型（ZhCode、React、JavaScript）  
✅ **多语言支持**: 记录中文和英文操作  
✅ **错误追踪**: 记录所有失败的操作和错误信息  
✅ **历史回溯**: 查看完整的 AI 操作历史  
✅ **云端存储**: 所有数据安全地存储在 Appwrite Cloud  

## 故障排除

### 无法连接到 Appwrite

1. 检查网络连接
2. 确认 Project ID 正确
3. 检查浏览器控制台的错误信息

### 历史记录为空

1. 确保已执行过 AI 操作
2. 检查 Appwrite 项目是否可访问
3. 验证集合权限设置

### 设置用户 ID

默认情况下，应用使用 `default_user` 作为用户 ID。要使用自定义用户 ID：

```javascript
// 在浏览器控制台执行
localStorage.setItem('zhcode_user_id', 'your_user_id');
```

## API 调用示例

使用 Appwrite 的 REST API 查询操作记录：

```bash
curl -X GET "https://cloud.appwrite.io/v1/databases/zhcode_db/collections/ai_operations/documents" \
  -H "X-Appwrite-Project: YOUR_PROJECT_ID" \
  -H "X-Appwrite-Key: YOUR_API_KEY"
```

## 更多信息

- [Appwrite 文档](https://appwrite.io/docs)
- [Appwrite Cloud](https://cloud.appwrite.io)
- [ZhCode 项目](https://github.com/yourusername/zhcode)
