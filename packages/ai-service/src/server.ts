import express, { Request, Response } from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// AI Service Endpoints
// ============================================================================

/**
 * Endpoint: GET /health
 * Purpose: Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

/**
 * Endpoint: POST /api/autocomplete
 * Purpose: Generate code completion suggestions
 * Body: { code: string, position: number, context: string }
 */
app.post('/api/autocomplete', (req: Request, res: Response) => {
  try {
    const { code, position, context } = req.body;

    // Extract current word being typed
    const beforeCursor = code.substring(0, position);
    const currentWord = beforeCursor.split(/[\s\(\)\[\]\{\},;:=\+\-\*\/]/).pop() || '';

    // ZhCode keywords and common functions
    const zhcodeKeywords = [
      '函数', '返回', '如果', '否则', '对于', '当', '中断', '继续',
      '令', '打印', '真', '假', '空', '类', '属性', '方法',
      '导入', '导出', '从', '作为', '异步', '等待'
    ];

    const commonFunctions = [
      '打印', '长度', '推送', '弹出', '切片', '映射', '过滤', '归约'
    ];

    // Filter suggestions based on current word
    const suggestions = [
      ...zhcodeKeywords.filter(k => k.startsWith(currentWord)),
      ...commonFunctions.filter(f => f.startsWith(currentWord))
    ].slice(0, 10);

    res.json({
      suggestions: suggestions.map((text, index) => ({
        label: text,
        kind: zhcodeKeywords.includes(text) ? 'Keyword' : 'Function',
        insertText: text,
        sortText: `${String.fromCharCode(97 + index)}`,
        detail: zhcodeKeywords.includes(text) ? 'ZhCode keyword' : 'Built-in function'
      }))
    });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

/**
 * Endpoint: POST /api/generate
 * Purpose: Generate ZhCode from natural language description
 * Body: { description: string, language: string }
 */
app.post('/api/generate', (req: Request, res: Response) => {
  try {
    const { description, language = 'zh' } = req.body;

    // Simulate AI-powered code generation with templates
    const templates: Record<string, Record<string, string>> = {
      '打印': 'function createPrintFunc() {\n  return `打印("Hello, World!")`;\n}',
      '函数': 'function createFunction() {\n  return `函数 myFunc(param) {\\n  返回 param * 2\\n}`;\n}',
      '循环': 'function createLoop() {\n  return `对于 (令 i = 0; i < 10; i = i + 1) {\\n  打印(i)\\n}`;\n}',
      'if': 'function createIf() {\n  return `如果 (x > 5) {\\n  打印("大于5")\\n} 否则 {\\n  打印("小于或等于5")\\n}`;\n}'
    };

    // Simple keyword matching for code generation
    let generatedCode = '';
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('打印') || lowerDesc.includes('print')) {
      generatedCode = '打印("输入你的文本")';
    } else if (lowerDesc.includes('函数') || lowerDesc.includes('function')) {
      generatedCode = `函数 ${getIdentifierFromDescription(description)}(参数) {
  返回 参数
}`;
    } else if (lowerDesc.includes('循环') || lowerDesc.includes('loop')) {
      generatedCode = `对于 (令 i = 0; i < 10; i = i + 1) {
  打印(i)
}`;
    } else if (lowerDesc.includes('如果') || lowerDesc.includes('if')) {
      generatedCode = `如果 (条件) {
  打印("条件为真")
} 否则 {
  打印("条件为假")
}`;
    } else {
      generatedCode = '# 请提供更具体的描述\n# 例如: "创建一个打印函数"';
    }

    res.json({
      code: generatedCode,
      explanation: `Generated ZhCode from description: "${description}"`,
      confidence: 0.8
    });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

/**
 * Endpoint: POST /api/explain-error
 * Purpose: Explain ZhCode compilation errors with AI assistance
 * Body: { error: string, code: string, line: number }
 */
app.post('/api/explain-error', (req: Request, res: Response) => {
  try {
    const { error, code, line } = req.body;

    // Parse error and provide helpful explanation
    let explanation = '';
    let suggestion = '';

    if (error.includes('SEMICOLON')) {
      explanation = '缺少分号。在语句末尾需要添加分号。';
      suggestion = '在行尾添加分号 ";"';
    } else if (error.includes('IDENTIFIER') || error.includes('Expected')) {
      explanation = '语法错误：期望的标记未找到。';
      suggestion = '检查变量名称和函数名称是否正确。';
    } else if (error.includes('RBRACE')) {
      explanation = '缺少右花括号。代码块未正确关闭。';
      suggestion = '添加 "}" 来关闭代码块。';
    } else if (error.includes('RPAREN')) {
      explanation = '缺少右括号。函数调用或表达式未正确关闭。';
      suggestion = '添加 ")" 来关闭括号。';
    } else {
      explanation = `解析错误: ${error}`;
      suggestion = '检查代码语法并确保所有括号和花括号都已正确关闭。';
    }

    res.json({
      error,
      line,
      explanation,
      suggestion,
      fixExample: generateFixExample(error, code, line)
    });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

/**
 * Endpoint: POST /api/explain-code
 * Purpose: Explain selected ZhCode in natural language
 * Body: { code: string, language: string }
 */
app.post('/api/explain-code', (req: Request, res: Response) => {
  try {
    const { code, language = 'zh' } = req.body;

    // Analyze code and provide explanation
    const explanation = analyzeCode(code, language);

    res.json({
      code,
      explanation,
      language
    });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

/**
 * Endpoint: POST /api/suggest-refactor
 * Purpose: Suggest code refactoring improvements
 * Body: { code: string }
 */
app.post('/api/suggest-refactor', (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    const suggestions: string[] = [];

    // Simple heuristic-based suggestions
    if (code.length > 200) {
      suggestions.push('考虑将长函数分解成更小的函数');
    }
    if ((code.match(/令/g) || []).length > 10) {
      suggestions.push('考虑使用函数来减少变量数量');
    }
    if (code.includes('如果') && code.includes('否则') && code.includes('如果')) {
      suggestions.push('可以使用条件表达式来简化多个 if-else 语句');
    }

    res.json({
      code,
      suggestions,
      severity: suggestions.length > 0 ? 'info' : 'none'
    });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

function getIdentifierFromDescription(description: string): string {
  // Extract potential function name from description
  const words = description.split(/[\s\(\)\[\]\{\},;:=\+\-\*\/]/);
  return words.find(w => w.match(/^[a-zA-Z]/)) || 'myFunction';
}

function generateFixExample(error: string, code: string, line: number): string {
  if (error.includes('SEMICOLON')) {
    return '添加分号到行尾';
  }
  if (error.includes('RBRACE')) {
    return '添加 } 来关闭代码块';
  }
  return '检查代码语法';
}

function analyzeCode(code: string, language: string): string {
  const lines = code.split('\n');
  const hasFunction = code.includes('函数');
  const hasLoop = code.includes('对于') || code.includes('当');
  const hasCondition = code.includes('如果');

  let explanation = '';

  if (hasFunction) {
    explanation += '这段代码定义了一个函数。';
  }
  if (hasLoop) {
    explanation += '这段代码包含一个循环。';
  }
  if (hasCondition) {
    explanation += '这段代码包含条件语句。';
  }

  if (!explanation) {
    explanation = '这段代码包含变量声明和函数调用。';
  }

  return explanation + ` (${lines.length} 行代码)`;
}

// ============================================================================
// Windows Terminal Launch Endpoints
// ============================================================================

/**
 * Endpoint: POST /api/launch-terminal
 * Purpose: Launch Windows Terminal application
 * Body: { startingPath?: string }
 */
app.post('/api/launch-terminal', (req: Request, res: Response) => {
  try {
    const { startingPath } = req.body;
    
    // Launch Windows Terminal
    // Using 'wt.exe' which is available on Windows 10/11
    const command = startingPath ? `wt.exe -d "${startingPath}"` : 'wt.exe';
    
    spawn(command, {
      detached: true,
      stdio: 'ignore',
      shell: true
    });

    res.json({ 
      success: true, 
      message: 'Windows Terminal launched successfully' 
    });
  } catch (error) {
    console.error('Error launching Windows Terminal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to launch Windows Terminal',
      error: (error as Error).message 
    });
  }
});

/**
 * Endpoint: POST /api/launch-powershell
 * Purpose: Launch Windows PowerShell
 * Body: { startingPath?: string }
 */
app.post('/api/launch-powershell', (req: Request, res: Response) => {
  try {
    const { startingPath } = req.body;
    
    // Launch PowerShell
    const command = startingPath 
      ? `powershell.exe -NoExit -Command "Set-Location \\"${startingPath}\\""` 
      : 'powershell.exe -NoExit';
    
    spawn(command, {
      detached: true,
      stdio: 'ignore',
      shell: true
    });

    res.json({ 
      success: true, 
      message: 'PowerShell launched successfully' 
    });
  } catch (error) {
    console.error('Error launching PowerShell:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to launch PowerShell',
      error: (error as Error).message 
    });
  }
});

/**
 * Endpoint: POST /api/launch-cmd
 * Purpose: Launch Windows Command Prompt (CMD)
 * Body: { startingPath?: string }
 */
app.post('/api/launch-cmd', (req: Request, res: Response) => {
  try {
    const { startingPath } = req.body;
    
    // Launch CMD (Command Prompt)
    const command = startingPath 
      ? `cmd.exe /K "cd /d \\"${startingPath}\\""` 
      : 'cmd.exe';
    
    spawn(command, {
      detached: true,
      stdio: 'ignore',
      shell: true
    });

    res.json({ 
      success: true, 
      message: 'Command Prompt launched successfully' 
    });
  } catch (error) {
    console.error('Error launching CMD:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to launch Command Prompt',
      error: (error as Error).message 
    });
  }
});

// ============================================================================
// Code Explanation Endpoints (Existing)
// ============================================================================

app.listen(PORT, () => {
  console.log('🚀 ZhCode AI Service v0.1.0');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/autocomplete');
  console.log('  POST /api/generate');
  console.log('  POST /api/explain-error');
  console.log('  POST /api/explain-code');
  console.log('  POST /api/suggest-refactor');
  console.log('  POST /api/launch-terminal');
  console.log('  POST /api/launch-powershell');
  console.log('  POST /api/launch-cmd');
  console.log('');
});
