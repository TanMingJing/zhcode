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
    const { description, language = 'zh', codeType = 'zhcode', currentCode = '' } = req.body;

    let generatedCode = '';
    const lowerDesc = description.toLowerCase();

    // Generate code based on detected code type
    if (codeType === 'react' || codeType === 'typescript' || codeType === 'javascript') {
      // Generate React/JS/TS code
      generatedCode = generateReactCode(description, codeType, currentCode);
    } else {
      // Generate ZhCode
      generatedCode = generateZhCode(description, currentCode);
    }

    res.json({
      code: generatedCode,
      explanation: generatedCode,
      codeType,
      confidence: 0.8
    });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

// Generate React/JS/TS code
function generateReactCode(description: string, codeType: string, currentCode: string): string {
  const lowerDesc = description.toLowerCase();
  const isTS = codeType === 'typescript' || codeType === 'react';
  
  // Detect if it's a component-related request
  if (lowerDesc.includes('component') || lowerDesc.includes('组件')) {
    const componentName = extractName(description) || 'MyComponent';
    if (isTS) {
      return `interface ${componentName}Props {
  // Add your props here
}

export function ${componentName}({ }: ${componentName}Props) {
  return (
    <div className="${componentName.toLowerCase()}">
      <h1>${componentName}</h1>
    </div>
  );
}`;
    } else {
      return `export function ${componentName}(props) {
  return (
    <div className="${componentName.toLowerCase()}">
      <h1>${componentName}</h1>
    </div>
  );
}`;
    }
  }
  
  // useState hook
  if (lowerDesc.includes('state') || lowerDesc.includes('usestate') || lowerDesc.includes('状态')) {
    const stateName = extractName(description) || 'value';
    const capitalizedName = stateName.charAt(0).toUpperCase() + stateName.slice(1);
    return `const [${stateName}, set${capitalizedName}] = useState${isTS ? '<string>' : ''}('');`;
  }
  
  // useEffect hook  
  if (lowerDesc.includes('effect') || lowerDesc.includes('useeffect') || lowerDesc.includes('副作用')) {
    return `useEffect(() => {
  // Your effect logic here
  console.log('Effect triggered');
  
  return () => {
    // Cleanup function
  };
}, []); // Dependencies array`;
  }
  
  // Function/Handler
  if (lowerDesc.includes('function') || lowerDesc.includes('handler') || lowerDesc.includes('函数') || lowerDesc.includes('处理')) {
    const funcName = extractName(description) || 'handleAction';
    if (isTS) {
      return `const ${funcName} = useCallback((event: React.MouseEvent) => {
  // Your logic here
  console.log('${funcName} called');
}, []);`;
    } else {
      return `const ${funcName} = useCallback((event) => {
  // Your logic here
  console.log('${funcName} called');
}, []);`;
    }
  }
  
  // Button
  if (lowerDesc.includes('button') || lowerDesc.includes('按钮')) {
    return `<button 
  className="btn"
  onClick={() => console.log('Button clicked')}
>
  Click Me
</button>`;
  }
  
  // Input
  if (lowerDesc.includes('input') || lowerDesc.includes('输入')) {
    return `<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text..."
  className="input"
/>`;
  }
  
  // Form
  if (lowerDesc.includes('form') || lowerDesc.includes('表单')) {
    return `<form onSubmit={(e) => {
  e.preventDefault();
  // Handle form submission
}}>
  <input type="text" name="field" />
  <button type="submit">Submit</button>
</form>`;
  }
  
  // List/Map
  if (lowerDesc.includes('list') || lowerDesc.includes('map') || lowerDesc.includes('列表')) {
    return `{items.map((item, index) => (
  <div key={item.id || index} className="item">
    {item.name}
  </div>
))}`;
  }
  
  // Fetch/API call
  if (lowerDesc.includes('fetch') || lowerDesc.includes('api') || lowerDesc.includes('请求')) {
    return `const fetchData = async () => {
  try {
    const response = await fetch('/api/endpoint');
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error('Error:', error);
  }
};`;
  }
  
  // Default: generic function
  return `// ${description}
const myFunction = () => {
  // Implement your logic here
  console.log('Function executed');
};`;
}

// Generate ZhCode
function generateZhCode(description: string, currentCode: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('打印') || lowerDesc.includes('print') || lowerDesc.includes('输出')) {
    return '打印("你好，世界！")';
  }
  
  if (lowerDesc.includes('函数') || lowerDesc.includes('function')) {
    const funcName = extractChineseName(description) || '我的函数';
    return `函数 ${funcName}(参数) {
  // 在这里写你的代码
  返回 参数
}`;
  }
  
  if (lowerDesc.includes('循环') || lowerDesc.includes('loop') || lowerDesc.includes('遍历')) {
    return `对于 (令 i = 0; i < 10; i = i + 1) {
  打印(i)
}`;
  }
  
  if (lowerDesc.includes('如果') || lowerDesc.includes('if') || lowerDesc.includes('条件')) {
    return `如果 (条件) {
  打印("条件为真")
} 否则 {
  打印("条件为假")
}`;
  }
  
  if (lowerDesc.includes('变量') || lowerDesc.includes('variable')) {
    const varName = extractChineseName(description) || '变量名';
    return `令 ${varName} = "初始值"`;
  }
  
  if (lowerDesc.includes('数组') || lowerDesc.includes('array') || lowerDesc.includes('列表')) {
    return `令 列表 = [1, 2, 3, 4, 5]
对于 (令 i = 0; i < 5; i = i + 1) {
  打印(列表[i])
}`;
  }
  
  if (lowerDesc.includes('类') || lowerDesc.includes('class') || lowerDesc.includes('对象')) {
    const className = extractChineseName(description) || '我的类';
    return `类 ${className} {
  属性 名称
  属性 值
  
  方法 初始化(名称, 值) {
    自身.名称 = 名称
    自身.值 = 值
  }
  
  方法 显示() {
    打印(自身.名称 + ": " + 自身.值)
  }
}`;
  }
  
  if (lowerDesc.includes('计算') || lowerDesc.includes('calc') || lowerDesc.includes('加') || lowerDesc.includes('减')) {
    return `函数 计算(a, b) {
  令 和 = a + b
  令 差 = a - b
  令 积 = a * b
  令 商 = a / b
  
  打印("和: " + 和)
  打印("差: " + 差)
  打印("积: " + 积)
  打印("商: " + 商)
  
  返回 和
}`;
  }
  
  // Default
  return `// ${description}
函数 新函数() {
  // 在这里实现你的代码
  打印("函数执行完毕")
}`;
}

// Helper: extract name from description
function extractName(description: string): string {
  // Try to find a name pattern like "called X" or "named X"
  const patterns = [
    /called\s+(\w+)/i,
    /named\s+(\w+)/i,
    /名为\s*(\w+)/,
    /叫\s*(\w+)/,
    /(\w+)\s*component/i,
    /(\w+)\s*组件/,
  ];
  
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) return match[1];
  }
  
  return '';
}

// Helper: extract Chinese name from description
function extractChineseName(description: string): string {
  const patterns = [
    /名为\s*([\u4e00-\u9fa5\w]+)/,
    /叫\s*([\u4e00-\u9fa5\w]+)/,
    /创建\s*([\u4e00-\u9fa5\w]+)/,
    /生成\s*([\u4e00-\u9fa5\w]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) return match[1];
  }
  
  return '';
}

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

    const suggestions: Array<{ type: string; message: string; priority: string }> = [];
    const lines = code.split('\n');

    // Analyze code complexity
    const functionCount = (code.match(/函数\s+\w+/g) || []).length;
    const variableCount = (code.match(/令\s+\w+/g) || []).length;
    const nestedLoops = (code.match(/对于[\s\S]*?对于/g) || []).length;
    const nestedIfs = (code.match(/如果[\s\S]*?如果/g) || []).length;

    // Long function detection
    if (lines.length > 30) {
      suggestions.push({
        type: 'complexity',
        message: '🔧 函数过长 (' + lines.length + ' 行)。建议拆分成多个小函数，每个函数负责一个特定功能。',
        priority: 'high'
      });
    }

    // Too many variables
    if (variableCount > 10) {
      suggestions.push({
        type: 'variables',
        message: '📦 变量数量较多 (' + variableCount + ' 个)。考虑使用对象来组织相关数据。',
        priority: 'medium'
      });
    }

    // Nested loops
    if (nestedLoops > 0) {
      suggestions.push({
        type: 'performance',
        message: '⚠️ 检测到嵌套循环。这可能导致 O(n²) 复杂度，考虑使用哈希表优化。',
        priority: 'high'
      });
    }

    // Nested conditions
    if (nestedIfs > 1) {
      suggestions.push({
        type: 'readability',
        message: '📖 嵌套条件较深。建议使用提前返回 (early return) 或条件合并来简化。',
        priority: 'medium'
      });
    }

    // Magic numbers
    const magicNumbers = code.match(/[^a-zA-Z_]\d{2,}[^a-zA-Z_]/g) || [];
    if (magicNumbers.length > 2) {
      suggestions.push({
        type: 'maintainability',
        message: '🔢 代码中有魔法数字。建议提取为常量，提高可读性和可维护性。',
        priority: 'low'
      });
    }

    // No functions defined
    if (functionCount === 0 && lines.length > 10) {
      suggestions.push({
        type: 'structure',
        message: '📐 代码未使用函数封装。建议将逻辑封装成函数，提高复用性。',
        priority: 'medium'
      });
    }

    // Duplicate code patterns
    const lineFrequency: Record<string, number> = {};
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 10) {
        lineFrequency[trimmed] = (lineFrequency[trimmed] || 0) + 1;
      }
    });
    const duplicates = Object.entries(lineFrequency).filter(([_, count]) => count > 2);
    if (duplicates.length > 0) {
      suggestions.push({
        type: 'duplication',
        message: '🔄 检测到重复代码。考虑提取为函数或使用循环。',
        priority: 'medium'
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        type: 'success',
        message: '✅ 代码结构良好！未发现明显的重构机会。',
        priority: 'info'
      });
    }

    // Format result
    const result = suggestions
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2, info: 3 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
               (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
      })
      .map(s => s.message)
      .join('\n\n');

    res.json({
      result,
      suggestions,
      severity: suggestions.some(s => s.priority === 'high') ? 'warning' : 'info'
    });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

/**
 * Endpoint: POST /api/generate-unittest
 * Purpose: Generate unit tests for ZhCode functions
 * Body: { code: string }
 */
app.post('/api/generate-unittest', (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    // Extract function definitions
    const functionRegex = /函数\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
    const functions: Array<{ name: string; params: string[] }> = [];
    
    let match;
    while ((match = functionRegex.exec(code)) !== null) {
      const name = match[1];
      const params = match[2].split(',').map(p => p.trim()).filter(p => p);
      functions.push({ name, params });
    }

    if (functions.length === 0) {
      res.json({
        result: '// ❌ 未找到函数定义\n// 请选择包含函数的代码'
      });
      return;
    }

    // Generate test cases
    let testCode = '// 🧪 自动生成的单元测试\n\n';

    functions.forEach(func => {
      testCode += `// ========================================\n`;
      testCode += `// 测试: ${func.name}\n`;
      testCode += `// ========================================\n\n`;

      // Test 1: Basic call
      testCode += `函数 测试_${func.name}_基础调用() {\n`;
      const testParams = func.params.map((_, i) => `测试参数${i + 1}`).join(', ');
      testCode += `  令 结果 = ${func.name}(${testParams})\n`;
      testCode += `  打印("结果:", 结果)\n`;
      testCode += `  // 断言: 验证返回值\n`;
      testCode += `}\n\n`;

      // Test 2: Edge case - empty/null
      testCode += `函数 测试_${func.name}_边界情况() {\n`;
      testCode += `  // 测试空值\n`;
      const nullParams = func.params.map(() => '空').join(', ');
      testCode += `  令 结果 = ${func.name}(${nullParams})\n`;
      testCode += `  打印("空值结果:", 结果)\n`;
      testCode += `}\n\n`;

      // Test 3: Type test
      if (func.params.length > 0) {
        testCode += `函数 测试_${func.name}_类型检查() {\n`;
        testCode += `  // 测试不同类型参数\n`;
        testCode += `  令 数字结果 = ${func.name}(${func.params.map(() => '123').join(', ')})\n`;
        testCode += `  令 字符串结果 = ${func.name}(${func.params.map(() => '"测试"').join(', ')})\n`;
        testCode += `  打印("数字测试:", 数字结果)\n`;
        testCode += `  打印("字符串测试:", 字符串结果)\n`;
        testCode += `}\n\n`;
      }
    });

    testCode += `// ========================================\n`;
    testCode += `// 运行所有测试\n`;
    testCode += `// ========================================\n\n`;

    functions.forEach(func => {
      testCode += `测试_${func.name}_基础调用()\n`;
      testCode += `测试_${func.name}_边界情况()\n`;
      if (func.params.length > 0) {
        testCode += `测试_${func.name}_类型检查()\n`;
      }
    });

    res.json({
      result: testCode,
      functionCount: functions.length,
      testCount: functions.length * 3
    });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

/**
 * Endpoint: POST /api/detect-bugs
 * Purpose: Detect potential bugs in ZhCode
 * Body: { code: string }
 */
app.post('/api/detect-bugs', (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const lines = code.split('\n');

    const bugs: Array<{ line: number; type: string; message: string; severity: string }> = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();

      // Check for common issues

      // 1. Variable used before declaration
      if (trimmedLine.match(/^\s*\w+\s*=/) && !trimmedLine.includes('令')) {
        bugs.push({
          line: lineNum,
          type: 'undefined-variable',
          message: `可能使用了未声明的变量`,
          severity: 'error'
        });
      }

      // 2. Missing closing braces
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      if (openBraces > 0 && closeBraces === 0 && !code.substring(code.indexOf(line)).includes('}')) {
        bugs.push({
          line: lineNum,
          type: 'unclosed-brace',
          message: `代码块可能未正确关闭`,
          severity: 'error'
        });
      }

      // 3. Division by zero potential
      if (trimmedLine.includes('/ 0') || trimmedLine.includes('/0')) {
        bugs.push({
          line: lineNum,
          type: 'division-zero',
          message: `潜在的除以零错误`,
          severity: 'error'
        });
      }

      // 4. Infinite loop potential
      if ((trimmedLine.includes('当') || trimmedLine.includes('对于')) && 
          trimmedLine.includes('真')) {
        bugs.push({
          line: lineNum,
          type: 'infinite-loop',
          message: `可能的无限循环 - 请确保有退出条件`,
          severity: 'warning'
        });
      }

      // 5. Empty function body
      if (trimmedLine.match(/函数\s+\w+\s*\([^)]*\)\s*{\s*}$/)) {
        bugs.push({
          line: lineNum,
          type: 'empty-function',
          message: `空函数体 - 函数没有实现`,
          severity: 'warning'
        });
      }

      // 6. Unreachable code after return
      if (trimmedLine.startsWith('返回') && index < lines.length - 1) {
        const nextLine = lines[index + 1].trim();
        if (nextLine && !nextLine.startsWith('}') && !nextLine.startsWith('//')) {
          bugs.push({
            line: lineNum + 1,
            type: 'unreachable-code',
            message: `返回语句后的代码不会被执行`,
            severity: 'warning'
          });
        }
      }

      // 7. String concatenation with number (potential type error)
      if (trimmedLine.includes('"') && trimmedLine.includes('+') && trimmedLine.match(/\d+/)) {
        // Only warn if it looks like unintentional
        if (!trimmedLine.includes('打印')) {
          bugs.push({
            line: lineNum,
            type: 'type-coercion',
            message: `字符串和数字混合运算 - 确认类型转换是否正确`,
            severity: 'info'
          });
        }
      }
    });

    // Format result
    let result = '';
    if (bugs.length === 0) {
      result = '✅ 未检测到明显的 Bug！\n\n代码看起来没有问题。';
    } else {
      result = `🐛 检测到 ${bugs.length} 个潜在问题:\n\n`;
      
      const errorBugs = bugs.filter(b => b.severity === 'error');
      const warningBugs = bugs.filter(b => b.severity === 'warning');
      const infoBugs = bugs.filter(b => b.severity === 'info');

      if (errorBugs.length > 0) {
        result += '❌ 错误:\n';
        errorBugs.forEach(bug => {
          result += `  第 ${bug.line} 行: ${bug.message}\n`;
        });
        result += '\n';
      }

      if (warningBugs.length > 0) {
        result += '⚠️ 警告:\n';
        warningBugs.forEach(bug => {
          result += `  第 ${bug.line} 行: ${bug.message}\n`;
        });
        result += '\n';
      }

      if (infoBugs.length > 0) {
        result += 'ℹ️ 提示:\n';
        infoBugs.forEach(bug => {
          result += `  第 ${bug.line} 行: ${bug.message}\n`;
        });
      }
    }

    res.json({
      result,
      bugs,
      totalBugs: bugs.length,
      errors: bugs.filter(b => b.severity === 'error').length,
      warnings: bugs.filter(b => b.severity === 'warning').length
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
  const nonEmptyLines = lines.filter(l => l.trim().length > 0);
  
  // Extract components
  const functions = code.match(/函数\s+(\w+)/g) || [];
  const variables = code.match(/令\s+(\w+)/g) || [];
  const loops = (code.match(/对于/g) || []).length + (code.match(/当/g) || []).length;
  const conditions = (code.match(/如果/g) || []).length;
  const prints = (code.match(/打印/g) || []).length;
  const returns = (code.match(/返回/g) || []).length;

  let explanation = '📖 **代码分析:**\n\n';

  // Overall structure
  explanation += `📊 **结构统计:**\n`;
  explanation += `  • 总行数: ${lines.length}\n`;
  explanation += `  • 有效行数: ${nonEmptyLines.length}\n`;
  explanation += `  • 函数数量: ${functions.length}\n`;
  explanation += `  • 变量数量: ${variables.length}\n\n`;

  // Describe functions
  if (functions.length > 0) {
    explanation += `🔧 **函数定义:**\n`;
    functions.forEach(f => {
      const name = f.replace('函数 ', '').replace('函数', '');
      explanation += `  • ${name}()\n`;
    });
    explanation += '\n';
  }

  // Describe variables
  if (variables.length > 0) {
    explanation += `📦 **变量声明:**\n`;
    variables.slice(0, 5).forEach(v => {
      const name = v.replace('令 ', '').replace('令', '');
      explanation += `  • ${name}\n`;
    });
    if (variables.length > 5) {
      explanation += `  • ... 还有 ${variables.length - 5} 个变量\n`;
    }
    explanation += '\n';
  }

  // Control flow
  if (loops > 0 || conditions > 0) {
    explanation += `🔄 **控制流:**\n`;
    if (loops > 0) explanation += `  • ${loops} 个循环\n`;
    if (conditions > 0) explanation += `  • ${conditions} 个条件判断\n`;
    explanation += '\n';
  }

  // Functionality description
  explanation += `💡 **功能说明:**\n`;
  if (functions.length > 0 && returns > 0) {
    explanation += `  这段代码定义了 ${functions.length} 个函数，`;
    explanation += `包含 ${returns} 个返回语句。\n`;
  }
  if (loops > 0) {
    explanation += `  代码使用循环进行重复操作。\n`;
  }
  if (prints > 0) {
    explanation += `  包含 ${prints} 处输出语句用于显示结果。\n`;
  }
  if (conditions > 0) {
    explanation += `  使用条件语句进行逻辑判断。\n`;
  }

  return explanation;
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
    const args = startingPath ? ['-d', startingPath] : [];
    
    spawn('wt.exe', args, {
      detached: true,
      stdio: 'ignore',
      shell: false
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
 * Endpoint: GET /api/current-directory
 * Purpose: Get the current working directory of the backend service
 */
app.get('/api/current-directory', (req: Request, res: Response) => {
  try {
    const cwd = process.cwd();
    res.json({ 
      success: true, 
      path: cwd,
      separator: path.sep
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get current directory',
      error: (error as Error).message 
    });
  }
});

/**
 * Endpoint: POST /api/browse-directory
 * Purpose: Open a folder browser dialog and return the selected path
 * Note: This uses PowerShell to show a folder picker dialog
 */
app.post('/api/browse-directory', async (req: Request, res: Response) => {
  try {
    const { initialPath } = req.body;
    const startPath = initialPath || process.cwd();
    
    // Use PowerShell to open a folder browser dialog
    const psScript = `
      Add-Type -AssemblyName System.Windows.Forms
      $browser = New-Object System.Windows.Forms.FolderBrowserDialog
      $browser.Description = "Select a folder"
      $browser.SelectedPath = "${startPath.replace(/\\/g, '\\\\')}"
      $browser.ShowNewFolderButton = $true
      $result = $browser.ShowDialog()
      if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        Write-Output $browser.SelectedPath
      }
    `;
    
    const ps = spawn('powershell.exe', ['-NoProfile', '-Command', psScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let selectedPath = '';
    let errorOutput = '';
    
    ps.stdout.on('data', (data: Buffer) => {
      selectedPath += data.toString().trim();
    });
    
    ps.stderr.on('data', (data: Buffer) => {
      errorOutput += data.toString();
    });
    
    ps.on('close', (code: number) => {
      if (selectedPath) {
        res.json({ 
          success: true, 
          path: selectedPath 
        });
      } else {
        res.json({ 
          success: false, 
          message: 'No folder selected or dialog cancelled'
        });
      }
    });
    
    ps.on('error', (error: Error) => {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to open folder browser',
        error: error.message 
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to browse directory',
      error: (error as Error).message 
    });
  }
});

/**
 * Endpoint: POST /api/resolve-folder-path
 * Purpose: Try to resolve a folder name to its full path by searching common locations
 * Body: { folderName: string }
 */
app.post('/api/resolve-folder-path', async (req: Request, res: Response) => {
  try {
    const { folderName } = req.body;
    
    if (!folderName) {
      res.json({ success: false, message: 'No folder name provided' });
      return;
    }
    
    // Common locations to search for the folder
    const homeDir = process.env.USERPROFILE || process.env.HOME || 'C:\\Users';
    const searchLocations = [
      path.join(homeDir, 'Desktop', folderName),
      path.join(homeDir, 'Documents', folderName),
      path.join(homeDir, 'Projects', folderName),
      path.join(homeDir, folderName),
      path.join('C:\\Projects', folderName),
      path.join('D:\\Projects', folderName),
    ];
    
    // Use PowerShell to check which path exists
    const psScript = `
      $paths = @(${searchLocations.map(p => `"${p.replace(/\\/g, '\\\\')}"`).join(', ')})
      foreach ($p in $paths) {
        if (Test-Path $p -PathType Container) {
          Write-Output $p
          exit
        }
      }
    `;
    
    const ps = spawn('powershell.exe', ['-NoProfile', '-Command', psScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let foundPath = '';
    
    ps.stdout.on('data', (data: Buffer) => {
      foundPath += data.toString().trim();
    });
    
    ps.on('close', () => {
      if (foundPath) {
        res.json({ success: true, path: foundPath });
      } else {
        res.json({ 
          success: false, 
          message: `Could not find folder "${folderName}" in common locations` 
        });
      }
    });
    
    ps.on('error', (error: Error) => {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to search for folder',
        error: error.message 
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resolve folder path',
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
    const args = startingPath 
      ? ['-NoExit', '-Command', `Set-Location '${startingPath}'`]
      : ['-NoExit'];
    
    spawn('powershell.exe', args, {
      detached: true,
      stdio: 'ignore',
      shell: false
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
    const args = startingPath 
      ? ['/K', `cd /d ${startingPath}`]
      : [];
    
    spawn('cmd.exe', args, {
      detached: true,
      stdio: 'ignore',
      shell: false
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
  console.log('  POST /api/autocomplete       - 代码补全');
  console.log('  POST /api/generate           - 代码生成');
  console.log('  POST /api/explain-error      - 错误解释');
  console.log('  POST /api/explain-code       - 代码解释');
  console.log('  POST /api/suggest-refactor   - 重构建议');
  console.log('  POST /api/generate-unittest  - 单元测试生成');
  console.log('  POST /api/detect-bugs        - Bug 检测');
  console.log('  POST /api/launch-terminal    - 启动终端');
  console.log('  POST /api/launch-powershell  - 启动 PowerShell');
  console.log('  POST /api/launch-cmd         - 启动 CMD');
  console.log('  GET  /api/current-directory  - 获取当前目录');
  console.log('  POST /api/browse-directory   - 浏览选择文件夹');
  console.log('  POST /api/resolve-folder-path - 解析文件夹路径');
  console.log('');
});
