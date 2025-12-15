import React, { useState, useCallback, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './App.css';

// We'll load @zhcode/core dynamically to avoid build issues
let ZhCodeCore: any = null;

async function loadZhCodeCore() {
  if (!ZhCodeCore) {
    try {
      // Try to load from the global scope (for development)
      if (typeof window !== 'undefined' && (window as any).ZhCodeCore) {
        ZhCodeCore = (window as any).ZhCodeCore;
      } else {
        // Load via module alias resolved by Vite
        ZhCodeCore = await import('@zhcode/core');
      }
    } catch (e) {
      console.error('Failed to load @zhcode/core:', e);
      throw new Error(`Failed to load ZhCode compiler: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return ZhCodeCore;
}

export function App(): JSX.Element {
  const [code, setCode] = useState(`函数 你好(名字) {
  返回 "你好，" + 名字 + "！"
}

令 结果 = 你好("世界")
打印(结果)
`);
  
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [files, setFiles] = useState<Record<string, string>>({
    'main.zhc': code,
  });
  const [activeFile, setActiveFile] = useState('main.zhc');
  const [newFileName, setNewFileName] = useState('');
  const editorRef = useRef<any>(null);

  // Compile and execute code
  const handleCompileAndRun = useCallback(async () => {
    try {
      setError('');
      setOutput('');
      
      const core = await loadZhCodeCore();
      const currentCode = files[activeFile];
      
      // Tokenize
      const tokenizer = new core.Tokenizer(currentCode);
      const tokens = tokenizer.tokenize();
      
      // Parse
      const parser = new core.Parser(tokens);
      const ast = parser.parse();
      
      // Transpile
      const transpiler = new core.Transpiler();
      const javascript = transpiler.transpile(ast);
      setJsCode(javascript);
      
      // Execute
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => String(arg)).join(' '));
      };
      
      try {
        // eslint-disable-next-line no-eval
        eval(javascript);
        setOutput(logs.join('\n') || '(无输出)');
      } catch (e) {
        setError(`执行错误: ${String(e)}`);
      } finally {
        console.log = originalLog;
      }
    } catch (e) {
      setError(`编译错误: ${String(e)}`);
      setOutput('');
    }
  }, [files, activeFile]);

  // Auto-compile on code change (debounced)
  const compileTimeoutRef = useRef<NodeJS.Timeout>();
  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    
    const newFiles = { ...files };
    newFiles[activeFile] = value;
    setFiles(newFiles);
    
    // Clear previous timeout
    if (compileTimeoutRef.current) {
      clearTimeout(compileTimeoutRef.current);
    }
    
    // Set new timeout for auto-compile
    compileTimeoutRef.current = setTimeout(() => {
      setCode(value);
      handleCompileAndRun();
    }, 500);
  }, [files, activeFile, handleCompileAndRun]);

  // Handle file creation
  const handleCreateFile = useCallback(() => {
    if (!newFileName.trim()) return;
    if (newFileName in files) {
      setError('文件已存在');
      return;
    }
    
    const newFiles = { ...files };
    newFiles[newFileName] = '# 新文件\n';
    setFiles(newFiles);
    setActiveFile(newFileName);
    setNewFileName('');
  }, [files]);

  // Handle file deletion
  const handleDeleteFile = useCallback((fileName: string) => {
    if (Object.keys(files).length <= 1) {
      setError('至少需要保留一个文件');
      return;
    }
    
    const newFiles = { ...files };
    delete newFiles[fileName];
    setFiles(newFiles);
    
    if (activeFile === fileName) {
      setActiveFile(Object.keys(newFiles)[0]);
    }
  }, [files, activeFile]);

  // Handle download
  const handleDownload = useCallback(() => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsCode));
    element.setAttribute('download', `${activeFile.replace('.zhc', '')}.js`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [jsCode, activeFile]);

  useEffect(() => {
    // Initial compile
    handleCompileAndRun();
  }, [handleCompileAndRun]);

  return (
    <div className="app">
      <header className="header">
        <h1>💻 ZhCode Web IDE</h1>
        <div className="header-buttons">
          <button onClick={handleCompileAndRun} className="btn btn-primary">
            ▶️ 运行 (Run)
          </button>
          <button onClick={handleDownload} className="btn btn-secondary" disabled={!jsCode}>
            ⬇️ 下载 JS
          </button>
        </div>
      </header>

      <div className="container">
        {/* Sidebar - File Explorer */}
        <aside className="sidebar">
          <div className="file-explorer">
            <h3>📁 文件</h3>
            <div className="file-list">
              {Object.keys(files).map(fileName => (
                <div
                  key={fileName}
                  className={`file-item ${activeFile === fileName ? 'active' : ''}`}
                >
                  <span onClick={() => setActiveFile(fileName)} className="file-name">
                    📄 {fileName}
                  </span>
                  {Object.keys(files).length > 1 && (
                    <button
                      onClick={() => handleDeleteFile(fileName)}
                      className="btn-delete"
                      title="删除文件"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="file-creator">
              <input
                type="text"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                placeholder="新文件名.zhc"
                onKeyPress={e => e.key === 'Enter' && handleCreateFile()}
              />
              <button onClick={handleCreateFile} className="btn btn-small">
                + 新建
              </button>
            </div>
          </div>

          <div className="examples">
            <h3>📚 示例</h3>
            <button
              className="btn btn-small"
              onClick={() => {
                const exampleCode = `令 numbers = [1, 2, 3, 4, 5]
令 doubled = []

对于 (令 i = 0; i < numbers.长度; i = i + 1) {
  doubled.推送(numbers[i] * 2)
}

打印(doubled)`;
                const newFiles = { ...files };
                newFiles[activeFile] = exampleCode;
                setFiles(newFiles);
              }}
            >
              数组操作
            </button>
            <button
              className="btn btn-small"
              onClick={() => {
                const exampleCode = `函数 fibonacci(n) {
  如果 (n <= 1) {
    返回 n
  }
  返回 fibonacci(n - 1) + fibonacci(n - 2)
}

对于 (令 i = 0; i < 10; i = i + 1) {
  打印(fibonacci(i))
}`;
                const newFiles = { ...files };
                newFiles[activeFile] = exampleCode;
                setFiles(newFiles);
              }}
            >
              递归函数
            </button>
            <button
              className="btn btn-small"
              onClick={() => {
                const exampleCode = `函数 计算(操作, a, b) {
  如果 (操作 == "加") {
    返回 a + b
  }
  否则 如果 (操作 == "减") {
    返回 a - b
  }
  否则 如果 (操作 == "乘") {
    返回 a * b
  }
  否则 如果 (操作 == "除") {
    返回 a / b
  }
  返回 0
}

打印(计算("加", 10, 5))
打印(计算("乘", 6, 7))`;
                const newFiles = { ...files };
                newFiles[activeFile] = exampleCode;
                setFiles(newFiles);
              }}
            >
              计算器
            </button>
          </div>
        </aside>

        {/* Main editor area */}
        <div className="editor-section">
          <div className="editor-container">
            <h2>📝 编辑器</h2>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={files[activeFile]}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
              }}
              onMount={editor => {
                editorRef.current = editor;
              }}
            />
          </div>

          {/* Output and error panels */}
          <div className="output-section">
            <div className="output-panel">
              <h2>📤 输出</h2>
              <pre className="output-content">
                {output || '(等待代码执行)'}
              </pre>
            </div>

            <div className={`output-panel ${error ? 'error' : ''}`}>
              <h2>⚠️ 错误</h2>
              <pre className="output-content">
                {error || '(无错误)'}
              </pre>
            </div>

            <div className="output-panel">
              <h2>📋 JavaScript 代码</h2>
              <div className="js-code-container">
                <pre className="output-content">{jsCode || '(编译后的代码将显示在这里)'}</pre>
                {jsCode && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(jsCode);
                      setOutput('✓ JavaScript 代码已复制到剪贴板');
                    }}
                    className="btn btn-small"
                  >
                    📋 复制代码
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
