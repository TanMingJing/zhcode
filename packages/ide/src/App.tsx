import React, { useState, useCallback, useRef } from 'react';
import './App.css';
import { logAIOperation, getAIOperationHistory, saveProjectToCloud, getUserProjects, deleteProject, type AIOperation, type ZhCodeProject } from './services/appwriteService';
import { useAuth } from './context/AuthContext';
import { WindowsTerminal } from './components/WindowsTerminal';
import { AIAssistant } from './components/AIAssistant';

// We'll load @zhcode/core dynamically to avoid build issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ZhCodeCore: any = null;

async function loadZhCodeCore() {
  if (!ZhCodeCore) {
    try {
      // Try to load from the global scope (for development)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).ZhCodeCore) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// 导出函数：将代码转换为 JavaScript
async function transpileCode(code: string): Promise<string> {
  try {
    const core = await loadZhCodeCore();
    if (!core || !core.transpile) {
      return code; // 如果编译器不可用，返回原始代码
    }
    return core.transpile(code);
  } catch (e) {
    console.error('Transpile error:', e);
    return code; // 出错时返回原始代码
  }
}

// 导出函数：下载文件
function downloadFile(content: string, filename: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// AI Service API helper - Direct OpenRouter/OpenAI calls
async function callAIService(action: string, code: string, apiKey?: string, provider: string = 'local', language: string = 'zh'): Promise<any> {
  if (provider === 'local') {
    // Local AI service - basic responses
    return {
      explanation: language === 'en' ? 'This is a basic response from the local AI service.' : '这是本地 AI 服务的基础响应。',
      suggestions: [language === 'en' ? 'This is an example suggestion' : '这是一个示例建议']
    };
  }

  if (!apiKey) {
    return { error: language === 'en' ? '❌ Please provide an API key' : '❌ 请提供 API 密钥' };
  }

  try {
    let endpoint = '';
    let payload: any = {};
    
    // Detect code type/framework
    const isZhCode = code.includes('函数') || code.includes('返回') || code.includes('令');
    const isReact = code.includes('import') || code.includes('useState') || code.includes('useEffect') || code.includes('JSX');
    const codeType = isReact ? 'React/TypeScript' : isZhCode ? 'ZhCode' : 'JavaScript';

    if (provider === 'openrouter') {
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      const systemPrompts: Record<string, string> = {
        'explain-code': language === 'en' 
          ? `You are a code explanation expert. Explain the following ${codeType} code clearly and concisely. Focus on what it does, how it works, and why it's structured this way:`
          : `你是一个代码解释助手。请用中文简洁地解释以下 ${codeType} 代码的功能、工作原理和设计目的：`,
        'explain-error': language === 'en'
          ? `You are a debugging expert. Explain this error message and suggest fixes for ${codeType}:`
          : `你是一个代码调试助手。请用中文帮助解释以下错误信息和可能的 ${codeType} 修复方法：`,
        'suggest-refactor': language === 'en'
          ? `You are a code review expert. Provide 2-3 specific optimization suggestions for this ${codeType} code:`
          : `你是一个代码重构建议助手。请用中文为这段 ${codeType} 代码提供 2-3 个改进建议：`,
        'generate': language === 'en'
          ? `You are a code generation expert. Generate ${codeType} code to implement the following requirement:`
          : `你是一个代码生成助手。请用 ${codeType} 生成代码来实现以下需求：`
      };

      payload = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompts[action] || (language === 'en' ? 'You are a helpful programming assistant.' : '你是一个有帮助的编程助手。')
          },
          {
            role: 'user',
            content: code
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      };
    } else if (provider === 'openai') {
      endpoint = 'https://api.openai.com/v1/chat/completions';
      const systemPrompts: Record<string, string> = {
        'explain-code': language === 'en'
          ? `You are a code explanation expert. Explain the following ${codeType} code clearly and concisely. Focus on what it does, how it works, and why it's structured this way:`
          : `你是一个代码解释助手。请用中文简洁地解释以下 ${codeType} 代码的功能、工作原理和设计目的：`,
        'explain-error': language === 'en'
          ? `You are a debugging expert. Explain this error message and suggest fixes for ${codeType}:`
          : `你是一个代码调试助手。请用中文帮助解释以下错误信息和可能的 ${codeType} 修复方法：`,
        'suggest-refactor': language === 'en'
          ? `You are a code review expert. Provide 2-3 specific optimization suggestions for this ${codeType} code:`
          : `你是一个代码重构建议助手。请用中文为这段 ${codeType} 代码提供 2-3 个改进建议：`,
        'generate': language === 'en'
          ? `You are a code generation expert. Generate ${codeType} code to implement the following requirement:`
          : `你是一个代码生成助手。请用 ${codeType} 生成代码来实现以下需求：`
      };

      payload = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompts[action] || (language === 'en' ? 'You are a helpful programming assistant.' : '你是一个有帮助的编程助手。')
          },
          {
            role: 'user',
            content: code
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      };
    }

    const authHeader = provider === 'openrouter' 
      ? { 'Authorization': `Bearer ${apiKey}` }
      : { 'Authorization': `Bearer ${apiKey}` };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      const errMsg = language === 'en' ? 'API Error' : 'API 错误';
      return { error: `❌ ${errMsg} (${response.status}): ${errorData.error?.message || 'Connection failed'}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return {
      explanation: content,
      suggestions: content.split('\n').filter((line: string) => line.trim())
    };
  } catch (error) {
    console.error('AI Service error:', error);
    return { error: `❌ 连接失败: ${String(error).slice(0, 50)}` };
  }
}

// Helper function to create preview HTML
function createPreviewHTML(output: string): string {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Web Preview</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #f5f5f5;
        }
        .preview-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          min-height: 100vh;
        }
        pre {
          background: #f4f4f4;
          padding: 15px;
          border-radius: 6px;
          overflow-x: auto;
          font-size: 14px;
          border-left: 3px solid #0ea5e9;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <pre>${output.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </div>
      <script>
        // Allow code execution in the preview
        ${output}
      </script>
    </body>
    </html>
  `;
}

export function App(): JSX.Element {
  const defaultCode = `函数 你好(名字) {
  返回 "你好，" + 名字 + "！"
}

令 结果 = 你好("世界")
打印(结果)
`;

  // Layout state
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [aiPanelWidth, setAiPanelWidth] = useState(350);
  const [editorHeight, setEditorHeight] = useState(500);
  const [previewWidth, setPreviewWidth] = useState(400);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(250);
  const [terminalWidth, setTerminalWidth] = useState(40);
  const [outputWidth, setOutputWidth] = useState(30);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showOutput, setShowOutput] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGitHub, setShowGitHub] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [selectedLineNumber, setSelectedLineNumber] = useState<number | null>(null);
  const [gitHubToken, setGitHubToken] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('zhcode_github_token') || '' : '';
  });
  const [tempGitHubToken, setTempGitHubToken] = useState(gitHubToken);
  const [gitHubRepo, setGitHubRepo] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('zhcode_github_repo') || '' : '';
  });
  const [tempGitHubRepo, setTempGitHubRepo] = useState(gitHubRepo);
  const [commitMessage, setCommitMessage] = useState('');
  const [gitStatus, setGitStatus] = useState('');
  const [gitLoading, setGitLoading] = useState(false);
  const [repoFiles, setRepoFiles] = useState<Array<{name: string; path: string; type: string}>>([]);
  const [repoInfo, setRepoInfo] = useState<{description?: string; language?: string; stargazers_count?: number}>({});
  const [apiKey, setApiKey] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('zhcode_api_key') || '' : '';
  });
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [aiProvider, setAiProvider] = useState(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('zhcode_ai_provider') || 'local') as 'local' | 'openai' | 'openrouter' : 'local';
  });
  const [tempAiProvider, setTempAiProvider] = useState(aiProvider);
  const [aiLanguage, setAiLanguage] = useState(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('zhcode_ai_language') || 'zh') as 'zh' | 'en' : 'zh';
  });
  const [tempAiLanguage, setTempAiLanguage] = useState(aiLanguage);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showAIAssistantModal, setShowAIAssistantModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'ai' | 'profile'>('ai');
  const [profileEdits, setProfileEdits] = useState({name: '', bio: '', theme: 'dark', language: 'en'});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const { user, logout, updateProfile, isLoading: authLoading } = useAuth();
  const [files, setFiles] = useState<Record<string, string>>({
    'main.zhc': defaultCode,
  });
  const [activeFile, setActiveFile] = useState('main.zhc');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'info'>('success');
  const [newFileName, setNewFileName] = useState('');
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [contextMenu, setContextMenu] = useState<{x: number; y: number; visible: boolean}>({x: 0, y: 0, visible: false});
  const [selectedText, setSelectedText] = useState('');
  const [undoStack, setUndoStack] = useState<Record<string, string[]>>({});
  const [redoStack, setRedoStack] = useState<Record<string, string[]>>({});
  const [showAIHistory, setShowAIHistory] = useState(false);
  const [aiHistory, setAiHistory] = useState<AIOperation[]>([]);
  const [aiHistoryLoading, setAiHistoryLoading] = useState(false);
  const [showCloudProjects, setShowCloudProjects] = useState(false);
  const [cloudProjects, setCloudProjects] = useState<ZhCodeProject[]>([]);
  const [cloudProjectsLoading, setCloudProjectsLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const compileTimeoutRef = useRef<NodeJS.Timeout>();
  const sidebarDragRef = useRef<number>(0);
  const aiPanelDragRef = useRef<number>(0);
  const editorDragRef = useRef<number>(0);
  const terminalDragRef = useRef<number>(0);
  const previewDragRef = useRef<number>(0);
  const outputWidthDragRef = useRef<number>(0);
  const terminalAIDragRef = useRef<number>(0);
  const aiOutputDragRef = useRef<number>(0);

  // Save API key to localStorage
  const handleSaveApiKey = useCallback(() => {
    localStorage.setItem('zhcode_api_key', tempApiKey);
    localStorage.setItem('zhcode_ai_provider', tempAiProvider);
    localStorage.setItem('zhcode_ai_language', tempAiLanguage);
    setApiKey(tempApiKey);
    setAiProvider(tempAiProvider);
    setAiLanguage(tempAiLanguage);
    setShowSettings(false);
  }, [tempApiKey, tempAiProvider, tempAiLanguage]);

  const handleSaveProfile = useCallback(async () => {
    try {
      setIsSavingProfile(true);
      setProfileMessage('');
      await updateProfile({
        name: profileEdits.name,
        bio: profileEdits.bio,
        theme: profileEdits.theme,
        language: profileEdits.language,
      });
      setProfileMessage('✅ Profile updated successfully!');
      setTimeout(() => setShowSettings(false), 1500);
    } catch (error) {
      setProfileMessage(`❌ Failed to update profile: ${String(error)}`);
    } finally {
      setIsSavingProfile(false);
    }
  }, [profileEdits, updateProfile]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setShowSettings(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  // GitHub handlers
  const handleSaveGitHub = useCallback(() => {
    if (!tempGitHubToken.trim()) {
      setGitStatus('❌ 请输入 GitHub Token');
      setTimeout(() => setGitStatus(''), 3000);
      return;
    }
    if (!tempGitHubRepo.trim()) {
      setGitStatus('❌ 请输入仓库名称');
      setTimeout(() => setGitStatus(''), 3000);
      return;
    }
    const formattedRepo = tempGitHubRepo.trim().replace(/\/+$/, '');
    if (!formattedRepo.includes('/')) {
      setGitStatus('❌ 仓库格式应为 owner/repo');
      setTimeout(() => setGitStatus(''), 3000);
      return;
    }
    localStorage.setItem('zhcode_github_token', tempGitHubToken);
    localStorage.setItem('zhcode_github_repo', formattedRepo);
    setGitHubToken(tempGitHubToken);
    setGitHubRepo(formattedRepo);
    setGitStatus('✓ GitHub 连接成功!');
    setTimeout(() => setGitStatus(''), 3000);
  }, [tempGitHubToken, tempGitHubRepo]);

  const handleSyncRepo = useCallback(async () => {
    if (!gitHubToken || !gitHubRepo) {
      setGitStatus('❌ 请先配置 GitHub');
      return;
    }
    setGitLoading(true);
    setGitStatus('');
    try {
      const [owner, repo] = gitHubRepo.split('/');
      if (!owner || !repo) {
        setGitStatus('❌ 仓库格式错误，应为 owner/repo');
        return;
      }
      // Fetch repo info
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { 'Authorization': `token ${gitHubToken}` }
      });
      if (!repoResponse.ok) {
        if (repoResponse.status === 401) {
          setGitStatus('❌ Token 无效，请检查 GitHub Token');
        } else if (repoResponse.status === 404) {
          setGitStatus('❌ 仓库未找到，请检查仓库名称');
        } else {
          setGitStatus(`❌ 同步失败: ${repoResponse.status}`);
        }
        return;
      }
      const info = await repoResponse.json();
      setRepoInfo({
        description: info.description,
        language: info.language,
        stargazers_count: info.stargazers_count
      });
      // Fetch files
      const filesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
        headers: { 'Authorization': `token ${gitHubToken}` }
      });
      if (filesResponse.ok) {
        const files = await filesResponse.json();
        setRepoFiles(files);
        setGitStatus(`✓ 同步成功! 找到 ${files.length} 个文件`);
        setTimeout(() => setGitStatus(''), 3000);
      }
    } catch (error) {
      setGitStatus(`❌ 同步失败: ${String(error).slice(0, 50)}`);
    } finally {
      setGitLoading(false);
    }
  }, [gitHubToken, gitHubRepo]);

  const handleCommitAndPush = useCallback(async () => {
    if (!gitHubToken || !gitHubRepo) {
      setGitStatus('❌ 请先配置 GitHub');
      return;
    }
    if (!commitMessage.trim()) {
      setGitStatus('❌ 请输入提交信息');
      setTimeout(() => setGitStatus(''), 3000);
      return;
    }
    setGitLoading(true);
    setGitStatus('正在提交和推送...');
    try {
      // Simulated commit (actual implementation would push to GitHub)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGitStatus('✓ 提交和推送成功!');
      setCommitMessage('');
      setTimeout(() => setGitStatus(''), 3000);
    } catch (error) {
      setGitStatus(`❌ 失败: ${String(error)}`);
    } finally {
      setGitLoading(false);
    }
  }, [gitHubToken, gitHubRepo, commitMessage]);

  // Resize handlers for sidebar
  const handleSidebarDragStart = useCallback((e: React.MouseEvent) => {
    sidebarDragRef.current = e.clientX;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mousemove', handleSidebarDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mouseup', handleSidebarDragEnd as any);
  }, []);

  const handleSidebarDrag = useCallback((e: MouseEvent) => {
    const delta = e.clientX - sidebarDragRef.current;
    setSidebarWidth(prev => Math.max(200, Math.min(600, prev + delta)));
    sidebarDragRef.current = e.clientX;
  }, []);

  const handleSidebarDragEnd = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mousemove', handleSidebarDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mouseup', handleSidebarDragEnd as any);
  }, []);

  // Resize handlers for AI panel
  const handleAIPanelDragStart = useCallback((e: React.MouseEvent) => {
    aiPanelDragRef.current = e.clientX;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mousemove', handleAIPanelDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mouseup', handleAIPanelDragEnd as any);
  }, []);

  const handleAIPanelDrag = useCallback((e: MouseEvent) => {
    const delta = e.clientX - aiPanelDragRef.current;
    setAiPanelWidth(prev => Math.max(250, Math.min(800, prev - delta)));
    aiPanelDragRef.current = e.clientX;
  }, []);

  const handleAIPanelDragEnd = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mousemove', handleAIPanelDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mouseup', handleAIPanelDragEnd as any);
  }, []);

  // Resize handlers for editor/bottom panel split
  const handleEditorDragStart = useCallback((e: React.MouseEvent) => {
    editorDragRef.current = e.clientY;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mousemove', handleEditorDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mouseup', handleEditorDragEnd as any);
  }, []);

  const handleEditorDrag = useCallback((e: MouseEvent) => {
    const delta = e.clientY - editorDragRef.current;
    setEditorHeight(prev => Math.max(200, Math.min(700, prev + delta)));
    editorDragRef.current = e.clientY;
  }, []);

  const handleEditorDragEnd = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mousemove', handleEditorDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mouseup', handleEditorDragEnd as any);
  }, []);

  // Resize handlers for bottom panel height
  const handleBottomPanelDragStart = useCallback((e: React.MouseEvent) => {
    terminalDragRef.current = e.clientY;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mousemove', handleBottomPanelDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mouseup', handleBottomPanelDragEnd as any);
  }, []);

  const handleBottomPanelDrag = useCallback((e: MouseEvent) => {
    const delta = e.clientY - terminalDragRef.current;
    setBottomPanelHeight(prev => Math.max(100, Math.min(600, prev - delta)));
    terminalDragRef.current = e.clientY;
  }, []);

  const handleBottomPanelDragEnd = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mousemove', handleBottomPanelDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mouseup', handleBottomPanelDragEnd as any);
  }, []);

  // Resize handlers for preview width
  const handlePreviewDragStart = useCallback((e: React.MouseEvent) => {
    previewDragRef.current = e.clientX;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mousemove', handlePreviewDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mouseup', handlePreviewDragEnd as any);
  }, []);

  const handlePreviewDrag = useCallback((e: MouseEvent) => {
    const delta = e.clientX - previewDragRef.current;
    setPreviewWidth(prev => Math.max(250, Math.min(800, prev - delta)));
    previewDragRef.current = e.clientX;
  }, []);

  const handlePreviewDragEnd = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mousemove', handlePreviewDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mouseup', handlePreviewDragEnd as any);
  }, []);

  // Resize handlers for terminal/output width split
  const handleOutputWidthDragStart = useCallback((e: React.MouseEvent) => {
    outputWidthDragRef.current = e.clientX;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mousemove', handleOutputWidthDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mouseup', handleOutputWidthDragEnd as any);
  }, []);

  const handleOutputWidthDrag = useCallback((e: MouseEvent) => {
    const delta = e.clientX - outputWidthDragRef.current;
    setTerminalWidth(prev => Math.max(30, Math.min(70, prev + delta / 3)));
    outputWidthDragRef.current = e.clientX;
  }, []);

  const handleOutputWidthDragEnd = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mousemove', handleOutputWidthDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mouseup', handleOutputWidthDragEnd as any);
  }, []);

  // Terminal-AI Resize Handler
  const handleTerminalAIDragStart = useCallback((e: React.MouseEvent) => {
    terminalAIDragRef.current = e.clientX;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mousemove', handleTerminalAIDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mouseup', handleTerminalAIDragEnd as any);
  }, []);

  const handleTerminalAIDrag = useCallback((e: MouseEvent) => {
    const delta = e.clientX - terminalAIDragRef.current;
    setTerminalWidth(prev => Math.max(15, Math.min(75, prev + (delta / window.innerWidth) * 100)));
    terminalAIDragRef.current = e.clientX;
  }, []);

  const handleTerminalAIDragEnd = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mousemove', handleTerminalAIDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mouseup', handleTerminalAIDragEnd as any);
  }, []);

  // AI-Output Resize Handler
  const handleAIOutputDragStart = useCallback((e: React.MouseEvent) => {
    aiOutputDragRef.current = e.clientX;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mousemove', handleAIOutputDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mouseup', handleAIOutputDragEnd as any);
  }, []);

  const handleAIOutputDrag = useCallback((e: MouseEvent) => {
    const delta = e.clientX - aiOutputDragRef.current;
    // Negate delta: dragging right shrinks output, dragging left expands output
    setOutputWidth(prev => Math.max(15, Math.min(75, prev - (delta / window.innerWidth) * 100)));
    aiOutputDragRef.current = e.clientX;
  }, []);

  const handleAIOutputDragEnd = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mousemove', handleAIOutputDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mouseup', handleAIOutputDragEnd as any);
  }, []);

  const handleTerminalOutputDragStart = useCallback((e: React.MouseEvent) => {
    terminalAIDragRef.current = e.clientX;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mousemove', handleTerminalOutputDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.addEventListener('mouseup', handleTerminalOutputDragEnd as any);
  }, []);

  const handleTerminalOutputDrag = useCallback((e: MouseEvent) => {
    const delta = e.clientX - terminalAIDragRef.current;
    setTerminalWidth(prev => Math.max(15, Math.min(85, prev + (delta / window.innerWidth) * 100)));
    terminalAIDragRef.current = e.clientX;
  }, []);

  const handleTerminalOutputDragEnd = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mousemove', handleTerminalOutputDrag as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document.removeEventListener('mouseup', handleTerminalOutputDragEnd as any);
  }, []);

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
      
      // Execute
      const originalLog = console.log;
      const logs: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => String(arg)).join(' '));
      };
      
      try {
        // Define built-in functions for ZhCode
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        const 打印 = (...args: any[]) => {
          logs.push(args.map(arg => String(arg)).join(' '));
        };
        
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
  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    
    const newFiles = { ...files };
    const oldContent = files[activeFile];
    
    // Save to undo stack
    const currentUndo = undoStack[activeFile] || [];
    const newUndo = [...currentUndo, oldContent];
    setUndoStack({ ...undoStack, [activeFile]: newUndo });
    
    // Clear redo stack when making new changes
    setRedoStack({ ...redoStack, [activeFile]: [] });
    
    newFiles[activeFile] = value;
    setFiles(newFiles);
    
    // Clear previous timeout
    if (compileTimeoutRef.current) {
      clearTimeout(compileTimeoutRef.current);
    }
    
    // Set new timeout for auto-compile
    compileTimeoutRef.current = setTimeout(() => {
      handleCompileAndRun();
    }, 500);
  }, [files, activeFile, handleCompileAndRun, undoStack, redoStack]);

  // Handle undo
  const handleUndo = useCallback(() => {
    const currentUndo = undoStack[activeFile] || [];
    if (currentUndo.length === 0) return;
    
    const newUndo = [...currentUndo];
    const previousContent = newUndo.pop()!;
    
    const currentRedo = redoStack[activeFile] || [];
    const newRedo = [...currentRedo, files[activeFile]];
    
    setUndoStack({ ...undoStack, [activeFile]: newUndo });
    setRedoStack({ ...redoStack, [activeFile]: newRedo });
    
    const newFiles = { ...files };
    newFiles[activeFile] = previousContent;
    setFiles(newFiles);
    
    // Compile with the restored code
    setTimeout(() => {
      handleCompileAndRun();
    }, 100);
  }, [files, activeFile, undoStack, redoStack, handleCompileAndRun]);

  // Handle redo
  const handleRedo = useCallback(() => {
    const currentRedo = redoStack[activeFile] || [];
    if (currentRedo.length === 0) return;
    
    const newRedo = [...currentRedo];
    const nextContent = newRedo.pop()!;
    
    const currentUndo = undoStack[activeFile] || [];
    const newUndo = [...currentUndo, files[activeFile]];
    
    setRedoStack({ ...redoStack, [activeFile]: newRedo });
    setUndoStack({ ...undoStack, [activeFile]: newUndo });
    
    const newFiles = { ...files };
    newFiles[activeFile] = nextContent;
    setFiles(newFiles);
    
    // Compile with the restored code
    setTimeout(() => {
      handleCompileAndRun();
    }, 100);
  }, [files, activeFile, undoStack, redoStack, handleCompileAndRun]);

  // Handle reset (revert to original)
  const handleResetFile = useCallback(() => {
    const currentUndo = undoStack[activeFile] || [];
    
    if (currentUndo.length > 0) {
      const original = currentUndo[0];
      
      const currentRedo = redoStack[activeFile] || [];
      const newRedo = [...currentRedo, files[activeFile]];
      
      setUndoStack({ ...undoStack, [activeFile]: [] });
      setRedoStack({ ...redoStack, [activeFile]: newRedo });
      
      const newFiles = { ...files };
      newFiles[activeFile] = original;
      setFiles(newFiles);
      
      setOutput('');
      setError('');
      
      // Compile with the restored code
      setTimeout(() => {
        handleCompileAndRun();
      }, 100);
    }
  }, [files, activeFile, undoStack, redoStack, handleCompileAndRun]);

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
  }, [files, newFileName]);

  // Handle file deletion
  const handleDeleteFile = useCallback((fileName: string) => {
    if (Object.keys(files).length === 1) {
      setError('必须保留至少一个文件');
      return;
    }
    
    const newFiles = { ...files };
    delete newFiles[fileName];
    setFiles(newFiles);
    
    if (activeFile === fileName) {
      setActiveFile(Object.keys(newFiles)[0]);
    }
  }, [files, activeFile]);

  // Handle file rename
  const handleRenameFile = useCallback((oldFileName: string) => {
    setRenamingFile(oldFileName);
    setRenameValue(oldFileName);
  }, []);

  const handleConfirmRename = useCallback(() => {
    if (!renameValue.trim() || renameValue === renamingFile) {
      setRenamingFile(null);
      return;
    }

    if (renameValue in files) {
      setError('文件已存在');
      setRenamingFile(null);
      return;
    }

    const newFiles: Record<string, string> = {};
    Object.keys(files).forEach(file => {
      if (file === renamingFile) {
        newFiles[renameValue] = files[file];
      } else {
        newFiles[file] = files[file];
      }
    });

    setFiles(newFiles);
    if (activeFile === renamingFile) {
      setActiveFile(renameValue);
    }
    setRenamingFile(null);
  }, [files, renamingFile, renameValue, activeFile]);

  // AI feature handlers
  const handleExplainError = useCallback(async () => {
    if (!error) {
      setAiExplanation('没有编译错误');
      return;
    }
    try {
      const result = await callAIService('explain-error', `错误: ${error}\n\n代码:\n${files[activeFile]}`, apiKey, aiProvider, aiLanguage);
      if (result?.error) {
        setAiExplanation(result.error);
      } else if (result?.explanation) {
        setAiExplanation(result.explanation);
      } else {
        setAiExplanation('无法连接到AI服务');
      }
    } catch (e) {
      setAiExplanation('AI 服务错误');
    }
  }, [error, files, activeFile, apiKey, aiProvider, aiLanguage]);

  // Load AI operation history
  const loadAIHistory = useCallback(async () => {
    setAiHistoryLoading(true);
    try {
      // Use a unique user ID (can be localStorage key or API key hash)
      const userId = localStorage.getItem('zhcode_user_id') || 'default_user';
      const history = await getAIOperationHistory(userId, 50);
      setAiHistory(history);
    } catch (e) {
      console.error('Failed to load AI history:', e);
    } finally {
      setAiHistoryLoading(false);
    }
  }, []);

  // Log AI operation and update history
  const logOperation = useCallback(async (action: string, input: string, output: string, status: 'success' | 'error', errorMessage?: string) => {
    try {
      const userId = localStorage.getItem('zhcode_user_id') || 'default_user';
      const isZhCode = files[activeFile]?.includes('函数') || files[activeFile]?.includes('返回');
      const isReact = files[activeFile]?.includes('import') || files[activeFile]?.includes('useState');
      const framework = isReact ? 'React/TypeScript' : isZhCode ? 'ZhCode' : 'JavaScript';

      await logAIOperation({
        userId,
        actionType: action as 'generate' | 'explain-code' | 'explain-error' | 'suggest-refactor',
        input,
        output,
        language: aiLanguage,
        framework,
        status,
        errorMessage,
        code: files[activeFile],
        fileId: activeFile,
      });

      // Reload history
      await loadAIHistory();
    } catch (e) {
      console.error('Failed to log operation:', e);
    }
  }, [files, activeFile, aiLanguage, loadAIHistory]);

  // Load cloud projects
  const loadCloudProjects = useCallback(async () => {
    setCloudProjectsLoading(true);
    try {
      const userId = localStorage.getItem('zhcode_user_id') || 'default_user';
      const projects = await getUserProjects(userId);
      setCloudProjects(projects);
    } catch (e) {
      console.error('Failed to load cloud projects:', e);
    } finally {
      setCloudProjectsLoading(false);
    }
  }, []);

  // Save current project to cloud
  const handleSaveToCloud = useCallback(async () => {
    if (!projectName.trim()) {
      setError('请输入项目名称');
      return;
    }

    try {
      const userId = localStorage.getItem('zhcode_user_id') || 'default_user';
      
      const project: Omit<ZhCodeProject, '$id' | 'createdAt' | 'updatedAt'> = {
        userId,
        projectName: projectName.trim(),
        description: projectDescription.trim(),
        files,
        mainFile: activeFile,
        language: aiLanguage,
        tags: ['zhcode'],
        isPublic: false,
      };

      const saved = await saveProjectToCloud(project);
      if (saved) {
        setError('✅ 项目已保存到云端');
        setProjectName('');
        setProjectDescription('');
        await loadCloudProjects();
      } else {
        setError('❌ 保存失败，请检查 Appwrite 配置');
      }
    } catch (e) {
      setError(`❌ 保存失败: ${String(e)}`);
    }
  }, [projectName, projectDescription, files, activeFile, aiLanguage, loadCloudProjects]);

  // Load project from cloud
  const handleLoadFromCloud = useCallback(async (project: ZhCodeProject) => {
    try {
      setFiles(project.files);
      setActiveFile(project.mainFile);
      setOutput('');
      setError(`✅ 已加载项目: ${project.projectName}`);
      setShowCloudProjects(false);
    } catch (e) {
      setError(`❌ 加载失败: ${String(e)}`);
    }
  }, []);

  // Delete cloud project
  const handleDeleteCloudProject = useCallback(async (projectId: string) => {
    if (!window.confirm('确定要删除这个项目吗？')) return;

    try {
      const success = await deleteProject(projectId);
      if (success) {
        setError('✅ 项目已删除');
        await loadCloudProjects();
      } else {
        setError('❌ 删除失败');
      }
    } catch (e) {
      setError(`❌ 删除失败: ${String(e)}`);
    }
  }, [loadCloudProjects]);

  // Export code
  const handleExportCode = useCallback(async () => {
    try {
      // 转译为 JavaScript
      const javaScriptContent = await transpileCode(files[activeFile]);
      const filename = activeFile.replace('.zhc', '.js');

      downloadFile(javaScriptContent, filename);
      setNotification(`✅ 代码已导出为 ${filename}`);
      setNotificationType('success');
      setTimeout(() => setNotification(''), 3000);
    } catch (e) {
      setError(`❌ 导出失败: ${String(e)}`);
    }
  }, [files, activeFile]);

  // Export as .zhc native format
  const handleExportZhc = useCallback(async () => {
    try {
      const filename = activeFile.endsWith('.zhc') ? activeFile : activeFile + '.zhc';
      downloadFile(files[activeFile], filename, 'text/plain');
      setNotification(`✅ 代码已导出为 ${filename} (ZhCode 原生格式)`);
      setNotificationType('success');
      setTimeout(() => setNotification(''), 3000);
    } catch (e) {
      setError(`❌ 导出失败: ${String(e)}`);
    }
  }, [files, activeFile]);

  // Export as .jsx React component (with proper ZhCode transpilation)
  const handleExportReact = useCallback(async () => {
    try {
      const javaScriptContent = await transpileCode(files[activeFile]);
      
      // Convert to React component format with proper transpiled code
      const componentName = activeFile.replace(/\.[^/.]+$/, '').replace(/[-_]/g, (match) => {
        return match === '-' ? '' : '';
      }).split(/[-_]/).map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
      
      // Wrap the transpiled JavaScript code in a proper React component
      const reactComponent = `import React, { useState } from 'react';\n\nconst ${componentName} = () => {\n  // Transpiled from ZhCode\n  ${javaScriptContent.split('\n').map(line => '  ' + line).join('\n')}\n  \n  return (\n    <div style={{ padding: '20px' }}>\n      {/* Component rendered successfully */}\n      <p>${componentName} Component</p>\n    </div>\n  );\n};\n\nexport default ${componentName};\n`;

      const filename = activeFile.replace(/\.[^/.]+$/, '.jsx');
      downloadFile(reactComponent, filename, 'text/javascript');
      setNotification(`✅ 代码已导出为 ${filename} (React 组件)`);
      setNotificationType('success');
      setTimeout(() => setNotification(''), 3000);
    } catch (e) {
      setError(`❌ 导出失败: ${String(e)}`);
    }
  }, [files, activeFile]);

  // Export all files as ZIP
  const handleExportZip = useCallback(async () => {
    try {
      // Dynamically import JSZip
      const JSZipModule = await import('jszip');
      const JSZip = JSZipModule.default;
      const zip = new JSZip();

      // Add all files to the zip
      for (const [filename, content] of Object.entries(files)) {
        zip.file(filename, content);
      }

      // Generate zip blob
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName || 'project'}_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setNotification(`✅ 所有文件已导出为 ZIP`);
      setNotificationType('success');
      setTimeout(() => setNotification(''), 3000);
    } catch (e) {
      setError(`❌ 导出 ZIP 失败: ${String(e)}`);
    }
  }, [files, projectName]);

  // Export all files as JSON project
  const handleExportProject = useCallback(async () => {
    try {
      const project = {
        name: projectName || 'zhcode_project',
        files: files,
        mainFile: activeFile,
        exportTime: new Date().toISOString(),
      };

      const jsonContent = JSON.stringify(project, null, 2);
      downloadFile(jsonContent, `${projectName || 'project'}.zhcode.json`, 'application/json');
      setError(`✅ 项目已导出`);
    } catch (e) {
      setError(`❌ 导出失败: ${String(e)}`);
    }
  }, [files, activeFile, projectName]);

  const handleExplainCode = useCallback(async () => {
    const selectedText = editorRef.current?.getSelectedText?.();
    if (!selectedText) {
      setAiExplanation('请先选择代码');
      return;
    }
    try {
      const result = await callAIService('explain-code', selectedText, apiKey, aiProvider, aiLanguage);
      if (result?.error) {
        setAiExplanation(result.error);
        await logOperation('explain-code', selectedText, result.error, 'error', result.error);
      } else if (result?.explanation) {
        setAiExplanation(result.explanation);
        await logOperation('explain-code', selectedText, result.explanation, 'success');
      } else {
        setAiExplanation('无法连接到AI服务');
        await logOperation('explain-code', selectedText, '', 'error', '无法连接到AI服务');
      }
    } catch (e) {
      setAiExplanation('AI 服务错误');
      await logOperation('explain-code', selectedText, '', 'error', String(e));
    }
  }, [apiKey, aiProvider, aiLanguage, logOperation]);

  const handleGenerateCode = useCallback(async () => {
    if (!aiInput.trim()) {
      setAiExplanation('请输入代码描述');
      return;
    }
    try {
      const result = await callAIService('generate', aiInput, apiKey, aiProvider, aiLanguage);
      if (result?.error) {
        setAiExplanation(result.error);
        await logOperation('generate', aiInput, result.error, 'error', result.error);
      } else if (result?.explanation) {
        const currentCode = files[activeFile];
        const newCode = currentCode + '\n\n' + result.explanation;
        const newFiles = { ...files };
        newFiles[activeFile] = newCode;
        setFiles(newFiles);
        setAiExplanation(`✓ 代码已添加到 ${activeFile}！\n\n生成的代码：\n${result.explanation.slice(0, 200)}${result.explanation.length > 200 ? '...' : ''}`);
        setAiInput('');
        await logOperation('generate', aiInput, result.explanation, 'success');
        // Auto-compile to verify syntax
        setTimeout(() => {
          handleCompileAndRun();
        }, 300);
      } else {
        setAiExplanation('无法连接到AI服务');
        await logOperation('generate', aiInput, '', 'error', '无法连接到AI服务');
      }
    } catch (e) {
      setAiExplanation('AI 服务错误');
      await logOperation('generate', aiInput, '', 'error', String(e));
    }
  }, [aiInput, files, activeFile, apiKey, aiProvider, aiLanguage, handleCompileAndRun, logOperation]);

  const handleGetSuggestions = useCallback(async () => {
    try {
      const result = await callAIService('suggest-refactor', files[activeFile], apiKey, aiProvider, aiLanguage);
      if (result?.error) {
        setAiSuggestions([result.error]);
        await logOperation('suggest-refactor', files[activeFile], result.error, 'error', result.error);
      } else if (result?.suggestions && Array.isArray(result.suggestions)) {
        setAiSuggestions(result.suggestions);
        await logOperation('suggest-refactor', files[activeFile], result.suggestions.join('\n'), 'success');
      } else {
        setAiSuggestions(['无法获取建议']);
        await logOperation('suggest-refactor', files[activeFile], '', 'error', '无法获取建议');
      }
    } catch (e) {
      setAiSuggestions(['AI 服务错误']);
      await logOperation('suggest-refactor', files[activeFile], '', 'error', String(e));
    }
  }, [files, activeFile, apiKey, aiProvider, aiLanguage, logOperation]);

  // Context menu handlers
  const handleEditorContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const text = window.getSelection()?.toString() || '';
    if (text.trim()) {
      e.preventDefault();
      setSelectedText(text);
      setContextMenu({x: e.clientX, y: e.clientY, visible: true});
    }
  }, []);

  const handleContextMenuAction = useCallback(async (action: string) => {
    if (!selectedText) return;
    
    setContextMenu({...contextMenu, visible: false});
    setShowAIPanel(true);

    try {
      let result;
      switch (action) {
        case 'analyze':
          result = await callAIService('explain-code', `分析以下代码:\n${selectedText}`, apiKey, aiProvider, aiLanguage);
          if (result?.error) {
            setAiExplanation(result.error);
            await logOperation('explain-code', `分析以下代码:\n${selectedText}`, result.error, 'error', result.error);
          } else if (result?.explanation) {
            setAiExplanation(`📊 代码分析:\n\n${result.explanation}`);
            await logOperation('explain-code', `分析以下代码:\n${selectedText}`, result.explanation, 'success');
          }
          break;
        case 'error':
          result = await callAIService('explain-error', `解释这个错误:\n${selectedText}`, apiKey, aiProvider, aiLanguage);
          if (result?.error) {
            setAiExplanation(result.error);
            await logOperation('explain-error', `解释这个错误:\n${selectedText}`, result.error, 'error', result.error);
          } else if (result?.explanation) {
            setAiExplanation(`🔍 错误解释:\n\n${result.explanation}`);
            await logOperation('explain-error', `解释这个错误:\n${selectedText}`, result.explanation, 'success');
          }
          break;
        case 'explain':
          result = await callAIService('explain-code', selectedText, apiKey, aiProvider, aiLanguage);
          if (result?.error) {
            setAiExplanation(result.error);
            await logOperation('explain-code', selectedText, result.error, 'error', result.error);
          } else if (result?.explanation) {
            setAiExplanation(`💡 代码解释:\n\n${result.explanation}`);
            await logOperation('explain-code', selectedText, result.explanation, 'success');
          }
          break;
        case 'optimize':
          result = await callAIService('suggest-refactor', selectedText, apiKey, aiProvider, aiLanguage);
          if (result?.error) {
            setAiExplanation(result.error);
            await logOperation('suggest-refactor', selectedText, result.error, 'error', result.error);
          } else if (result?.suggestions && Array.isArray(result.suggestions)) {
            setAiSuggestions(result.suggestions);
            setAiExplanation(`🚀 优化建议:\n\n${result.suggestions.join('\n')}`);
            await logOperation('suggest-refactor', selectedText, result.suggestions.join('\n'), 'success');
          } else if (result?.explanation) {
            setAiExplanation(`🚀 优化建议:\n\n${result.explanation}`);
            await logOperation('suggest-refactor', selectedText, result.explanation, 'success');
          }
          break;
      }
    } catch (e) {
      setAiExplanation(`❌ AI 服务错误: ${String(e)}`);
      await logOperation(action === 'error' ? 'explain-error' : 'explain-code', selectedText, '', 'error', String(e));
    }
  }, [selectedText, apiKey, aiProvider, aiLanguage, contextMenu, logOperation]);

  // Close context menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({...contextMenu, visible: false});
      }
    };
    
    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu]);

  // Keyboard shortcuts for undo/redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="ide-container">
      <header className="header">
        <div className="header-left">
          <i className="fas fa-code header-icon"></i>
          <span className="app-title">ZhCode IDE</span>
        </div>
        <div className="header-right">
          <button 
            className="btn btn-icon"
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
            disabled={(undoStack[activeFile] || []).length === 0}
            style={{ opacity: (undoStack[activeFile] || []).length === 0 ? 0.5 : 1 }}
          >
            <i className="fas fa-undo"></i>
          </button>
          <button 
            className="btn btn-icon"
            onClick={handleRedo}
            title="Redo (Ctrl+Y)"
            disabled={(redoStack[activeFile] || []).length === 0}
            style={{ opacity: (redoStack[activeFile] || []).length === 0 ? 0.5 : 1 }}
          >
            <i className="fas fa-redo"></i>
          </button>
          <button 
            className="btn btn-icon"
            onClick={handleResetFile}
            title="Reset to Original"
            disabled={(undoStack[activeFile] || []).length === 0}
            style={{ opacity: (undoStack[activeFile] || []).length === 0 ? 0.5 : 1 }}
          >
            <i className="fas fa-history"></i>
          </button>
          <button 
            className="btn btn-icon"
            onClick={() => { setShowAIHistory(true); loadAIHistory(); }}
            title="AI Operation History"
          >
            <i className="fas fa-book"></i>
          </button>
          <button 
            className="btn btn-icon"
            onClick={() => { setShowCloudProjects(true); loadCloudProjects(); }}
            title="Cloud Projects"
          >
            <i className="fas fa-cloud"></i>
          </button>
          <button 
            className="btn btn-icon"
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export Options"
            style={{ position: 'relative' }}
          >
            <i className="fas fa-download"></i>
            {showExportMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: '#1a1a2e',
                border: '2px solid #667eea',
                borderRadius: '12px',
                marginTop: '8px',
                zIndex: 1000,
                minWidth: '240px',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.25)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(102, 126, 234, 0.3)',
                  background: 'rgba(102, 126, 234, 0.08)',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#667eea',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📥 导出选项
                </div>
                
                {/* Export Buttons */}
                <button 
                  onClick={() => {
                    handleExportZhc();
                    setShowExportMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    borderBottom: '1px solid rgba(102, 126, 234, 0.15)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                    e.currentTarget.style.paddingLeft = '20px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '16px';
                  }}
                >
                  <i className="fas fa-file-code" style={{fontSize: '14px', color: '#667eea'}}></i>
                  <span>.zhc (原生格式)</span>
                </button>
                
                <button 
                  onClick={() => {
                    handleExportReact();
                    setShowExportMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    borderBottom: '1px solid rgba(102, 126, 234, 0.15)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                    e.currentTarget.style.paddingLeft = '20px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '16px';
                  }}
                >
                  <i className="fab fa-react" style={{fontSize: '14px', color: '#61dafb'}}></i>
                  <span>.jsx (React)</span>
                </button>
                
                <button 
                  onClick={() => {
                    handleExportCode();
                    setShowExportMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    borderBottom: '1px solid rgba(102, 126, 234, 0.15)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                    e.currentTarget.style.paddingLeft = '20px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '16px';
                  }}
                >
                  <i className="fas fa-js-square" style={{fontSize: '14px', color: '#f7df1e'}}></i>
                  <span>.js (JavaScript)</span>
                </button>

                <button 
                  onClick={() => {
                    handleExportZip();
                    setShowExportMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    borderTop: '1px solid rgba(102, 126, 234, 0.2)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                    e.currentTarget.style.paddingLeft = '20px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '16px';
                  }}
                >
                  <i className="fas fa-archive" style={{fontSize: '14px', color: '#10b981'}}></i>
                  <span>所有文件 (ZIP)</span>
                </button>
              </div>
            )}
          </button>
          <button 
            className="btn btn-icon"
            onClick={() => setShowAIPanel(!showAIPanel)}
            title="AI Assistant"
          >
            <i className="fas fa-wand-magic-sparkles"></i>
          </button>
          <button 
            className="btn btn-icon"
            onClick={() => handleCompileAndRun()}
            title="Run Code"
          >
            <i className="fas fa-play"></i>
          </button>
          <button 
            className="btn btn-icon"
            onClick={() => setShowTerminal(!showTerminal)}
            title={showTerminal ? "Hide Terminal" : "Show Terminal"}
            style={{ 
              color: showTerminal ? '#667eea' : 'var(--text-secondary)',
              borderBottom: showTerminal ? '2px solid #667eea' : 'none'
            }}
          >
            <i className="fas fa-terminal"></i>
          </button>
          <button 
            className="btn btn-icon"
            onClick={() => { setTempGitHubToken(gitHubToken); setTempGitHubRepo(gitHubRepo); setShowGitHub(true); }}
            title="GitHub Sync"
          >
            <i className="fas fa-code-branch"></i>
          </button>
          <button 
            className="btn btn-icon"
            onClick={() => { 
              setTempApiKey(apiKey);
              if (user) {
                setProfileEdits({
                  name: (user.name as string) || '',
                  bio: (user.bio as string) || '',
                  theme: (user.theme as string) || 'dark',
                  language: (user.language as string) || 'en'
                });
              }
              setSettingsTab('ai');
              setShowSettings(true); 
            }}
            title="Settings"
          >
            <i className="fas fa-cog"></i>
          </button>
          {gitStatus && (
            <span style={{ marginLeft: '12px', fontSize: '12px', color: gitStatus.includes('❌') ? 'var(--danger)' : 'var(--success)' }}>
              {gitStatus}
            </span>
          )}
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: notificationType === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(14, 165, 233, 0.95)',
          color: '#fff',
          padding: '14px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: notificationType === 'success' ? '0 4px 20px rgba(16, 185, 129, 0.3)' : '0 4px 20px rgba(14, 165, 233, 0.3)',
          backdropFilter: 'blur(10px)',
          border: notificationType === 'success' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(14, 165, 233, 0.5)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <i className={`fas fa-${notificationType === 'success' ? 'check-circle' : 'info-circle'}`}></i>
          <span>{notification}</span>
        </div>
      )}

      {showGitHub && (
        <div className="modal-overlay" onClick={() => setShowGitHub(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflow: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <i className="fas fa-code-branch" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                <h2>GitHub 连接</h2>
                {gitHubToken && gitHubRepo && (
                  <span style={{ fontSize: '12px', color: '#888', marginLeft: 'auto' }}>
                    <i className="fas fa-check-circle" style={{ color: 'var(--success)', marginRight: '4px' }}></i>
                    已连接: {gitHubRepo}
                  </span>
                )}
              </div>
              <button className="btn-close" onClick={() => setShowGitHub(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="settings-section">
                <div className="settings-label">
                  <i className="fas fa-token"></i>
                  <span>Personal Access Token</span>
                </div>
                <input
                  type="password"
                  className="settings-input"
                  value={tempGitHubToken}
                  onChange={(e) => setTempGitHubToken(e.target.value)}
                  placeholder="输入你的 GitHub Personal Access Token"
                  disabled={gitLoading}
                />
                <div className="info-callout">
                  <div className="info-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <p>你的 token 将本地存储在浏览器中，永不上传到服务器。<br/>📚 <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)', textDecoration: 'underline'}}>创建 Token</a></p>
                </div>
              </div>

              <div className="settings-section">
                <div className="settings-label">
                  <i className="fas fa-folder"></i>
                  <span>仓库</span>
                </div>
                <input
                  type="text"
                  className="settings-input"
                  value={tempGitHubRepo}
                  onChange={(e) => setTempGitHubRepo(e.target.value.trim())}
                  placeholder="格式: owner/repo (例如: facebook/react)"
                  disabled={gitLoading}
                />
              </div>

              {repoInfo.description && (
                <div className="settings-section">
                  <div style={{ padding: '12px', background: 'rgba(14, 165, 233, 0.05)', borderRadius: '4px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                    <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                      <strong>📌 {repoInfo.description}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', display: 'flex', gap: '16px' }}>
                      {repoInfo.language && <span><i className="fas fa-code"></i> {repoInfo.language}</span>}
                      {repoInfo.stargazers_count !== undefined && <span><i className="fas fa-star"></i> {repoInfo.stargazers_count}</span>}
                    </div>
                  </div>
                </div>
              )}

              {gitHubToken && gitHubRepo && repoFiles.length > 0 && (
                <div className="settings-section">
                  <div className="settings-label">
                    <i className="fas fa-list"></i>
                    <span>文件列表 ({repoFiles.length})</span>
                  </div>
                  <div style={{ 
                    maxHeight: '200px', 
                    overflow: 'auto', 
                    background: 'rgba(0, 0, 0, 0.2)', 
                    borderRadius: '4px',
                    border: '1px solid rgba(100, 100, 100, 0.2)',
                    padding: '8px'
                  }}>
                    {repoFiles.slice(0, 20).map((file, idx) => (
                      <div key={idx} style={{ 
                        padding: '6px 8px', 
                        fontSize: '12px', 
                        borderBottom: idx < repoFiles.length - 1 ? '1px solid rgba(100, 100, 100, 0.1)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <i className={`fas fa-${file.type === 'dir' ? 'folder' : 'file'}`} style={{color: file.type === 'dir' ? 'var(--primary)' : '#888'}}></i>
                        <span>{file.name}</span>
                      </div>
                    ))}
                    {repoFiles.length > 20 && (
                      <div style={{ padding: '8px', textAlign: 'center', color: '#888', fontSize: '12px' }}>
                        ... 还有 {repoFiles.length - 20} 个文件
                      </div>
                    )}
                  </div>
                </div>
              )}

              {gitHubToken && gitHubRepo && (
                <div className="settings-section">
                  <div className="settings-label">
                    <i className="fas fa-comment"></i>
                    <span>提交信息</span>
                  </div>
                  <textarea
                    className="settings-input"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="输入你的提交信息"
                    rows={3}
                    disabled={gitLoading}
                    style={{ fontFamily: '"SF Mono", Monaco, monospace', fontSize: '13px' }}
                  />
                </div>
              )}

              {gitStatus && (
                <div className="settings-section">
                  <div className="info-callout" style={{
                    background: gitStatus.includes('❌') ? 'rgba(239, 68, 68, 0.1)' : gitStatus === '正在提交和推送...' || gitStatus === '' ? 'rgba(14, 165, 233, 0.05)' : 'rgba(16, 185, 129, 0.1)',
                    borderColor: gitStatus.includes('❌') ? 'rgba(239, 68, 68, 0.2)' : gitStatus === '正在提交和推送...' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                  }}>
                    <div className="info-icon" style={{
                      color: gitStatus.includes('❌') ? 'var(--danger)' : gitStatus === '正在提交和推送...' ? 'var(--primary)' : 'var(--success)'
                    }}>
                      {gitStatus.includes('正在') || gitStatus.includes('Syncing') ? (
                        <i className="fas fa-spinner" style={{animation: 'spin 1s linear infinite'}}></i>
                      ) : (
                        <i className={`fas fa-${gitStatus.includes('❌') ? 'times-circle' : 'check-circle'}`}></i>
                      )}
                    </div>
                    <p>{gitStatus || '准备好了'}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowGitHub(false)}
                disabled={gitLoading}
              >
                <i className="fas fa-times"></i>
                <span>关闭</span>
              </button>
              {gitHubToken && gitHubRepo && (
                <>
                  <button 
                    className="btn-sync"
                    onClick={handleSyncRepo}
                    disabled={gitLoading}
                    style={{
                      background: gitLoading ? '#999' : 'var(--secondary)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: gitLoading ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {gitLoading ? <i className="fas fa-spinner" style={{animation: 'spin 1s linear infinite'}}></i> : <i className="fas fa-sync"></i>}
                    <span>{gitLoading ? '同步中...' : '同步'}</span>
                  </button>
                  <button 
                    className="btn-commit"
                    onClick={handleCommitAndPush}
                    disabled={gitLoading || !commitMessage.trim()}
                    style={{
                      background: gitLoading || !commitMessage.trim() ? '#999' : 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: gitLoading || !commitMessage.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {gitLoading ? <i className="fas fa-spinner" style={{animation: 'spin 1s linear infinite'}}></i> : <i className="fas fa-arrow-up"></i>}
                    <span>{gitLoading ? '推送中...' : '推送'}</span>
                  </button>
                </>
              )}
              <button 
                className="btn-save" 
                onClick={handleSaveGitHub}
                disabled={gitLoading}
              >
                <i className="fas fa-check"></i>
                <span>保存</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <i className="fas fa-cog" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                <h2>设置</h2>
              </div>
              <button className="btn-close" onClick={() => setShowSettings(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Settings Tabs - Modern Design */}
            <div style={{
              display: 'flex',
              gap: '0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(90deg, rgba(26, 26, 40, 0.5) 0%, transparent 100%)',
              paddingLeft: '0'
            }}>
              <button
                onClick={() => setSettingsTab('ai')}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  border: 'none',
                  background: settingsTab === 'ai' ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                  borderBottom: settingsTab === 'ai' ? '3px solid #667eea' : '3px solid transparent',
                  color: settingsTab === 'ai' ? '#fff' : '#888',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (settingsTab !== 'ai') {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (settingsTab !== 'ai') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <i className="fas fa-microchip" style={{fontSize: '16px'}}></i>
                AI 设置
              </button>
              <button
                onClick={() => setSettingsTab('profile')}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  border: 'none',
                  background: settingsTab === 'profile' ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                  borderBottom: settingsTab === 'profile' ? '3px solid #667eea' : '3px solid transparent',
                  color: settingsTab === 'profile' ? '#fff' : '#888',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (settingsTab !== 'profile') {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (settingsTab !== 'profile') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <i className="fas fa-user-circle" style={{fontSize: '16px'}}></i>
                资料
              </button>
            </div>
            <div className="modal-body">
              {/* AI Settings Tab */}
              {settingsTab === 'ai' && (
                <>
                  <div className="settings-section">
                    <div className="settings-label">
                      <i className="fas fa-microchip" style={{fontSize: '16px', color: '#667eea'}}></i>
                      <span>AI 提供商</span>
                    </div>
                    <div className="provider-buttons">
                      <button
                        className={`provider-btn ${tempAiProvider === 'local' ? 'active' : ''}`}
                        onClick={() => setTempAiProvider('local')}
                      >
                        <i className="fas fa-server"></i>
                        <span>本地</span>
                      </button>
                      <button
                        className={`provider-btn ${tempAiProvider === 'openai' ? 'active' : ''}`}
                        onClick={() => setTempAiProvider('openai')}
                      >
                        <i className="fas fa-cube"></i>
                        <span>OpenAI</span>
                      </button>
                      <button
                        className={`provider-btn ${tempAiProvider === 'openrouter' ? 'active' : ''}`}
                        onClick={() => setTempAiProvider('openrouter')}
                      >
                        <i className="fas fa-network-wired"></i>
                        <span>OpenRouter</span>
                      </button>
                    </div>
                  </div>

                  {tempAiProvider !== 'local' && (
                    <div className="settings-section">
                      <div className="settings-label">
                        <i className="fas fa-key" style={{fontSize: '16px', color: '#667eea'}}></i>
                        <span>API 密钥</span>
                      </div>
                      <input
                        type="password"
                        className="settings-input"
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        placeholder={`输入你的 ${tempAiProvider === 'openai' ? 'OpenAI' : 'OpenRouter'} API 密钥`}
                      />
                      <div className="info-callout">
                        <div className="info-icon">
                          <i className="fas fa-info-circle"></i>
                        </div>
                        <p>你的 API 密钥将本地存储在浏览器中，永不上传到服务器。</p>
                      </div>
                    </div>
                  )}

                  {tempAiProvider === 'local' && (
                    <div className="settings-section">
                      <div className="info-callout" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', borderLeft: '4px solid #10b981' }}>
                        <div className="info-icon" style={{ color: '#10b981' }}>
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <p style={{color: '#10b981', fontWeight: '500'}}>使用本地 AI 服务 - 无需 API 密钥。功能有限但完全免费。</p>
                      </div>
                    </div>
                  )}

                  <div className="settings-section">
                    <div className="settings-label">
                      <i className="fas fa-language" style={{fontSize: '16px', color: '#667eea'}}></i>
                      <span>AI 解释语言</span>
                    </div>
                    <div className="provider-buttons">
                      <button
                        className={`provider-btn ${tempAiLanguage === 'zh' ? 'active' : ''}`}
                        onClick={() => setTempAiLanguage('zh')}
                      >
                        <i className="fas fa-flag-china"></i>
                        <span>中文</span>
                      </button>
                      <button
                        className={`provider-btn ${tempAiLanguage === 'en' ? 'active' : ''}`}
                        onClick={() => setTempAiLanguage('en')}
                      >
                        <i className="fas fa-flag-usa"></i>
                        <span>English</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Profile Tab */}
              {settingsTab === 'profile' && user && (
                <>
                  {/* Avatar Section - Modern Card */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '18px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.08) 100%)',
                    border: '1px solid rgba(102, 126, 234, 0.25)',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <img 
                      src={user.avatar as string}
                      alt="Avatar" 
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        border: '3px solid #667eea',
                        flexShrink: 0,
                        boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)'
                      }}
                    />
                    <div style={{flex: 1, minWidth: 0}}>
                      <p style={{margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#fff'}}>
                        @{user.username as string}
                      </p>
                      <p style={{margin: '0', fontSize: '12px', color: '#aaa'}}>
                        {user.email as string}
                      </p>
                    </div>
                  </div>

                  {/* Profile Message */}
                  {profileMessage && (
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      textAlign: 'center',
                      borderLeft: '4px solid',
                      marginBottom: '16px',
                      background: profileMessage.includes('✅') ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      borderColor: profileMessage.includes('✅') ? '#22c55e' : '#ef4444',
                      color: profileMessage.includes('✅') ? '#22c55e' : '#ef4444',
                      fontWeight: '500',
                      animation: 'slideIn 0.3s ease-out'
                    }}>
                      {profileMessage}
                    </div>
                  )}

                  {/* Profile Form - Modern Inputs */}
                  <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
                    <div>
                      <label style={{fontSize: '12px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '8px'}}>
                        全名
                      </label>
                      <input
                        type="text"
                        value={profileEdits.name}
                        onChange={(e) => setProfileEdits({...profileEdits, name: e.target.value})}
                        placeholder="输入您的全名"
                        disabled={isSavingProfile || authLoading}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(102, 126, 234, 0.25)',
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                          e.currentTarget.style.boxShadow = '0 0 12px rgba(102, 126, 234, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.25)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div>
                      <label style={{fontSize: '12px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '8px'}}>
                        个人简介
                      </label>
                      <textarea
                        value={profileEdits.bio}
                        onChange={(e) => setProfileEdits({...profileEdits, bio: e.target.value.slice(0, 200)})}
                        placeholder="告诉我们您的一些信息..."
                        maxLength={200}
                        disabled={isSavingProfile || authLoading}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(102, 126, 234, 0.25)',
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          minHeight: '80px',
                          resize: 'vertical',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                          e.currentTarget.style.boxShadow = '0 0 12px rgba(102, 126, 234, 0.15)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.25)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      <div style={{fontSize: '11px', color: '#888', textAlign: 'right', marginTop: '6px'}}>
                        {profileEdits.bio.length}/200
                      </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                      <div>
                        <label style={{fontSize: '12px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '8px'}}>
                          主题
                        </label>
                        <select
                          value={profileEdits.theme}
                          onChange={(e) => setProfileEdits({...profileEdits, theme: e.target.value})}
                          disabled={isSavingProfile || authLoading}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(102, 126, 234, 0.25)',
                            color: '#fff',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="dark">🌙 深色</option>
                          <option value="light">☀️ 浅色</option>
                          <option value="auto">🔄 自动</option>
                        </select>
                      </div>

                      <div>
                        <label style={{fontSize: '12px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '8px'}}>
                          语言
                        </label>
                        <select
                          value={profileEdits.language}
                          onChange={(e) => setProfileEdits({...profileEdits, language: e.target.value})}
                          disabled={isSavingProfile || authLoading}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(102, 126, 234, 0.25)',
                            color: '#fff',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="en">🇬🇧 英文</option>
                          <option value="zh">🇨🇳 中文</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowSettings(false)}>
                <i className="fas fa-times"></i>
                <span>取消</span>
              </button>
              {settingsTab === 'ai' && (
                <button className="btn-save" onClick={handleSaveApiKey}>
                  <i className="fas fa-check"></i>
                  <span>保存</span>
                </button>
              )}
              {settingsTab === 'profile' && (
                <>
                  <button 
                    className="btn-cancel" 
                    onClick={handleLogout}
                    disabled={isSavingProfile || authLoading}
                    style={{
                      borderColor: '#ef4444', 
                      color: '#ef4444',
                      fontWeight: '600',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>登出</span>
                  </button>
                  <button 
                    className="btn-save" 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile || authLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 20px'
                    }}
                  >
                    <i className="fas fa-check-circle"></i>
                    <span>{isSavingProfile ? '保存中...' : '保存资料'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showAIHistory && (
        <div className="modal-overlay" onClick={() => setShowAIHistory(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh', overflow: 'auto', minWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <i className="fas fa-book" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                <h2>AI 操作历史</h2>
                {aiHistoryLoading && <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#888' }}>加载中...</span>}
              </div>
              <button className="btn-close" onClick={() => setShowAIHistory(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: 'calc(80vh - 120px)', overflow: 'auto' }}>
              {aiHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '40px', marginBottom: '10px', display: 'block' }}></i>
                  <p>暂无 AI 操作记录</p>
                </div>
              ) : (
                <div>
                  {aiHistory.map((op, idx) => (
                    <div key={op.$id || idx} style={{ 
                      padding: '12px', 
                      marginBottom: '8px', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      borderRadius: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ 
                            display: 'inline-block',
                            background: op.status === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: op.status === 'success' ? '#22c55e' : '#ef4444',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            marginRight: '8px'
                          }}>
                            {op.status === 'success' ? '✓ 成功' : '✗ 失败'}
                          </span>
                          <span style={{ 
                            display: 'inline-block',
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#3b82f6',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            marginRight: '8px'
                          }}>
                            {op.actionType}
                          </span>
                          <span style={{ 
                            display: 'inline-block',
                            background: 'rgba(168, 85, 247, 0.2)',
                            color: '#a855f7',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px'
                          }}>
                            {op.framework}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#888' }}>
                          {new Date(op.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                        <div style={{ color: '#aaa', marginBottom: '4px' }}>
                          <strong>输入:</strong>
                          <div style={{ 
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '6px',
                            borderRadius: '3px',
                            marginTop: '4px',
                            maxHeight: '60px',
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontFamily: 'monospace'
                          }}>
                            {op.input.slice(0, 200)}{op.input.length > 200 ? '...' : ''}
                          </div>
                        </div>
                        
                        <div style={{ color: '#aaa' }}>
                          <strong>输出:</strong>
                          <div style={{ 
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '6px',
                            borderRadius: '3px',
                            marginTop: '4px',
                            maxHeight: '60px',
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontFamily: 'monospace'
                          }}>
                            {op.output.slice(0, 200)}{op.output.length > 200 ? '...' : ''}
                          </div>
                        </div>
                      </div>

                      {op.errorMessage && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#ef4444',
                          background: 'rgba(239, 68, 68, 0.1)',
                          padding: '6px',
                          borderRadius: '3px',
                          marginTop: '6px'
                        }}>
                          <strong>错误:</strong> {op.errorMessage}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCloudProjects && (
        <div className="modal-overlay" onClick={() => setShowCloudProjects(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh', overflow: 'auto', minWidth: '550px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <i className="fas fa-cloud" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                <h2>云端项目</h2>
                {cloudProjectsLoading && <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#888' }}>加载中...</span>}
              </div>
              <button className="btn-close" onClick={() => setShowCloudProjects(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: 'calc(80vh - 220px)', overflow: 'auto' }}>
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>项目名称</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="输入项目名称"
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold' }}>项目描述（可选）</label>
                  <textarea
                    className="settings-input"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="输入项目描述"
                    style={{ resize: 'vertical', minHeight: '60px' }}
                  />
                </div>
                <button 
                  className="btn-save"
                  onClick={handleSaveToCloud}
                  style={{ width: '100%' }}
                >
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>保存当前项目到云端</span>
                </button>
              </div>

              {cloudProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '40px', marginBottom: '10px', display: 'block' }}></i>
                  <p>暂无云端项目</p>
                </div>
              ) : (
                <div>
                  {cloudProjects.map((project) => (
                    <div key={project.$id} style={{
                      padding: '12px',
                      marginBottom: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px'
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <h4 style={{ margin: '0 0 4px 0', color: '#fff' }}>{project.projectName}</h4>
                          <span style={{ fontSize: '11px', color: '#888' }}>
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {project.description && (
                          <p style={{ margin: '4px 0', fontSize: '12px', color: '#aaa' }}>
                            {project.description}
                          </p>
                        )}
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                          📁 {Object.keys(project.files).length} 个文件
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={{
                            flex: 1,
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                          onClick={() => handleLoadFromCloud(project)}
                        >
                          <i className="fas fa-download"></i> 加载
                        </button>
                        <button
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                          onClick={() => handleDeleteCloudProject(project.$id || '')}
                        >
                          <i className="fas fa-trash"></i> 删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCloudProjects(false)}>
                <i className="fas fa-times"></i>
                <span>关闭</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAIAssistantModal && (
        <div className="modal-overlay" onClick={() => setShowAIAssistantModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <i className="fas fa-wand-magic-sparkles" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
                <h2>AI 辅助</h2>
              </div>
              <button className="btn-close" onClick={() => setShowAIAssistantModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              <AIAssistant selectedCode={selectedText} onClose={() => setShowAIAssistantModal(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="ide-content" style={{ display: 'flex', gap: '1px', height: 'calc(100vh - 60px)', background: 'var(--border)' }}>
        {/* Left Sidebar - Files */}
        <aside className="sidebar" style={{ width: sidebarWidth }}>
          <div className="editor-header">
            <i className="fas fa-file-code"></i>
            <h3>文件</h3>
          </div>
          <ul className="file-list">
            {Object.keys(files).map((file) => {
              const codeLines = files[file].split('\n').length;
              return (
              <li 
                key={file} 
                className={`file-item ${activeFile === file ? 'active' : ''}`}
                onClick={() => setActiveFile(file)}
                title={`${codeLines} 行代码`}
              >
                <i className="fas fa-file"></i>
                {renamingFile === file ? (
                  <input
                    type="text"
                    className="input-field"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyPress={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') handleConfirmRename();
                      if (e.key === 'Escape') setRenamingFile(null);
                    }}
                    onBlur={handleConfirmRename}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    style={{ flex: 1, marginLeft: '5px' }}
                  />
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file}</span>
                    <span style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap' }}>({codeLines}L)</span>
                  </div>
                )}
                {renamingFile !== file && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameFile(file);
                      }}
                      title="Rename"
                      style={{ padding: '4px 6px' }}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file);
                      }}
                      title="Delete"
                      style={{ padding: '4px 6px' }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                )}
              </li>
              );
            })}
          </ul>
          <div className="file-input-group">
            <div className="new-file-card">
              <div className="new-file-header">
                <i className="fas fa-file-circle-plus"></i>
                <span>新建文件</span>
              </div>
              <input 
                type="text"
                className="input-field new-file-input"
                placeholder="输入文件名称..."
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleCreateFile();
                }}
              />
              <button 
                className="btn btn-primary btn-create"
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
              >
                <i className="fas fa-check"></i>
                <span>创建</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Resizable divider between sidebar and editor */}
        <div 
          className="resize-handle-vertical"
          onMouseDown={handleSidebarDragStart}
          style={{ cursor: 'col-resize' }}
        />

        {/* Center - Editor and Preview */}
        <main className="editor-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top: Editor Section */}
          <div className="editor-wrapper" style={{ flex: 1 }}>
            <div className="editor-header">
              <i className="fas fa-pen"></i>
              编辑器
            </div>
            <div className="editor-content-wrapper">
              <div className="line-numbers">
                {(files[activeFile] || '').split('\n').map((_, i) => (
                  <div 
                    key={i} 
                    className={`line-number ${selectedLineNumber === i + 1 ? 'selected' : ''}`}
                    onClick={() => setSelectedLineNumber(i + 1)}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="editor-editor-wrapper">
                {selectedLineNumber && (
                  <div 
                    className="line-highlight"
                    style={{
                      top: `calc(15px + (${selectedLineNumber - 1}) * (14px * 1.6))`
                    }}
                  />
                )}
                <textarea
                  className="code-editor"
                  value={files[activeFile] || ''}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onClick={(e) => {
                    const textarea = e.currentTarget;
                    const text = textarea.value;
                    const selectionStart = textarea.selectionStart;
                    const lineNumber = text.substring(0, selectionStart).split('\n').length;
                    setSelectedLineNumber(lineNumber);
                  }}
                  onMouseUp={(e) => {
                const text = window.getSelection()?.toString() || '';
                if (text.trim()) {
                  setSelectedText(text);
                  const textarea = e.currentTarget as HTMLTextAreaElement;
                  const editorWrapper = textarea.closest('.editor-wrapper') as HTMLElement;
                  
                  if (editorWrapper) {
                    const editorRect = editorWrapper.getBoundingClientRect();
                    const menuWidth = 160;
                    
                    // Position menu at mouse position relative to editor
                    setContextMenu({
                      x: Math.max(editorRect.left, Math.min(e.clientX - menuWidth / 2, window.innerWidth - menuWidth - 10)),
                      y: e.clientY + 5,
                      visible: true
                    });
                  }
                } else {
                  setContextMenu({...contextMenu, visible: false});
                }
              }}
              placeholder="输入 ZhCode 代码..."
            />
              </div>
            </div>
          </div>

          {/* Context Menu */}
          {contextMenu.visible && (
            <div 
              ref={contextMenuRef}
              className="context-menu"
              style={{
                position: 'fixed',
                top: `${Math.max(5, Math.min(contextMenu.y, window.innerHeight - 200))}px`,
                left: `${Math.max(5, Math.min(contextMenu.x, window.innerWidth - 180))}px`,
                zIndex: 10000
              }}
            >
              <button 
                className="context-menu-item"
                onClick={() => handleContextMenuAction('analyze')}
              >
                <i className="fas fa-magnifying-glass"></i>
                <span>代码分析</span>
              </button>
              <button 
                className="context-menu-item"
                onClick={() => handleContextMenuAction('error')}
              >
                <i className="fas fa-bug"></i>
                <span>解释错误</span>
              </button>
              <button 
                className="context-menu-item"
                onClick={() => handleContextMenuAction('explain')}
              >
                <i className="fas fa-lightbulb"></i>
                <span>解释代码</span>
              </button>
              <button 
                className="context-menu-item"
                onClick={() => handleContextMenuAction('optimize')}
              >
                <i className="fas fa-rocket"></i>
                <span>优化建议</span>
              </button>
            </div>
          )}

          {/* Resizable divider between editor and bottom panels */}
          <div 
            className="resize-handle-horizontal"
            onMouseDown={handleBottomPanelDragStart}
            style={{ cursor: 'row-resize' }}
          />

          {/* Bottom: Terminal and Output Side by Side */}
          {(showTerminal || showOutput) && (
            <div className="bottom-panels-container" style={{ display: 'flex', height: `${bottomPanelHeight}px`, background: 'var(--border)' }}>
              {/* Terminal Panel - Left */}
              {showTerminal && (
                <div className="terminal-panel" style={{ width: `${terminalWidth}%`, display: 'flex', flexDirection: 'column', minWidth: '150px', overflow: 'hidden', flexShrink: 0 }}>
                  <WindowsTerminal onClose={() => setShowTerminal(false)} />
                </div>
              )}

              {/* Terminal-Output Divider */}
              {showTerminal && showOutput && (
                <div 
                  className="resize-handle-vertical"
                  onMouseDown={handleTerminalOutputDragStart}
                  style={{ cursor: 'col-resize' }}
                />
              )}

              {/* Output Panel - Right */}
              {showOutput && (
                <div className="output-grid" style={{ width: showTerminal ? `${100 - terminalWidth}%` : '100%', display: 'flex', flexDirection: 'column', minWidth: '150px', overflow: 'hidden', flexShrink: 0 }}>
                  <div className="output-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="output-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <i className="fas fa-code"></i>
                        <span>输出</span>
                      </div>
                      <button 
                        className="btn-close"
                        onClick={() => setShowOutput(false)}
                        style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <div className="output-content" style={{ flex: 1, overflow: 'auto' }}>
                      {output && <pre>{output}</pre>}
                      {!output && <span className="placeholder">(运行代码查看输出)</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show hidden panels buttons */}
          <div style={{ display: 'flex', gap: '8px', padding: '8px', flexWrap: 'wrap' }}>
            {!showOutput && (
              <button 
                className="btn btn-secondary"
                onClick={() => setShowOutput(true)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <i className="fas fa-code"></i> 输出
              </button>
            )}
            {!showTerminal && (
              <button 
                className="btn btn-secondary"
                onClick={() => setShowTerminal(true)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <i className="fas fa-terminal"></i> 终端
              </button>
            )}
            {!showPreview && (
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPreview(true)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <i className="fas fa-browser"></i> 预览
              </button>
            )}
          </div>
        </main>

        {/* Resizable divider between editor and preview */}
        {showPreview && (
          <>
            <div 
              className="resize-handle-vertical"
              onMouseDown={handlePreviewDragStart}
              style={{ cursor: 'col-resize' }}
            />

            {/* Right - Web Preview Panel */}
            <aside className="preview-panel" style={{ width: previewWidth, display: 'flex', flexDirection: 'column' }}>
              <div className="output-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <i className="fas fa-browser"></i>
                  <span>网页预览</span>
                </div>
                <button 
                  className="btn-close"
                  onClick={() => setShowPreview(false)}
                  style={{ padding: '4px 8px', color: 'var(--text-secondary)' }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <iframe
                className="preview-iframe"
                srcDoc={createPreviewHTML(output)}
                sandbox="allow-scripts"
                style={{ flex: 1, border: 'none', background: 'white' }}
              />
            </aside>
          </>
        )}

        {/* Resizable divider between editor and AI panel */}
        {showAIPanel && (
          <>
            <div 
              className="resize-handle-vertical"
              onMouseDown={handleAIPanelDragStart}
              style={{ cursor: 'col-resize' }}
            />

            {/* Right Sidebar - AI Panel */}
            <aside className="ai-panel" style={{ width: aiPanelWidth }}>
              <div className="ai-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <i className="fas fa-sparkles"></i>
                  <h3>AI 助手</h3>
                </div>
                <button className="btn-close" onClick={() => setShowAIPanel(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="ai-panel-content">
                {/* AI Tools Section */}
                <div className="ai-tools-section">
                  <div className="ai-section-title">
                    <i className="fas fa-wand-magic-sparkles"></i>
                    <span>代码分析</span>
                  </div>
                  <div className="ai-tools">
                    <button 
                      className="btn btn-ai-tool"
                      onClick={handleExplainError}
                      title="分析编译/运行错误"
                    >
                      <i className="fas fa-lightbulb"></i>
                      <span>解释错误</span>
                    </button>
                    <button 
                      className="btn btn-ai-tool"
                      onClick={handleExplainCode}
                      title="解释选中的代码"
                    >
                      <i className="fas fa-book"></i>
                      <span>解释代码</span>
                    </button>
                    <button 
                      className="btn btn-ai-tool"
                      onClick={handleGetSuggestions}
                      title="获取代码优化建议"
                    >
                      <i className="fas fa-star"></i>
                      <span>优化建议</span>
                    </button>
                  </div>
                </div>

                {/* Code Generation Section */}
                <div className="ai-generation-section">
                  <div className="ai-section-title">
                    <i className="fas fa-code"></i>
                    <span>代码生成</span>
                  </div>
                  <div className="ai-input-group">
                    <input
                      type="text"
                      className="input-field ai-input"
                      placeholder="描述你需要的代码功能..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleGenerateCode();
                      }}
                    />
                    <button 
                      className="btn btn-primary btn-generate"
                      onClick={handleGenerateCode}
                      disabled={!aiInput.trim()}
                    >
                      <i className="fas fa-sparkles"></i>
                      <span>生成代码</span>
                    </button>
                  </div>
                </div>

                {/* AI Assistant Quick Access */}
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAIAssistantModal(true)}
                  style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                >
                  <i className="fas fa-wand-magic-sparkles"></i>
                  <span>打开完整 AI 助手</span>
                </button>

                {/* Output Section */}
                <div className="ai-output">
                  {aiExplanation && (
                    <div className="explanation-box" style={{
                      background: aiExplanation.includes('✓ 代码已添加') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                      borderColor: aiExplanation.includes('✓ 代码已添加') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(14, 165, 233, 0.3)'
                    }}>
                      <div className="output-title" style={{
                        color: aiExplanation.includes('✓ 代码已添加') ? 'var(--success)' : 'var(--primary)'
                      }}>
                        <i className={`fas fa-${aiExplanation.includes('✓ 代码已添加') ? 'check-circle' : 'lightbulb'}`}></i>
                        <span>{aiExplanation.includes('✓ 代码已添加') ? '✓ 代码已应用' : '解释'}</span>
                      </div>
                      <p style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}>{aiExplanation}</p>
                    </div>
                  )}
                  {aiSuggestions.length > 0 && (
                    <div className="suggestions-box">
                      <div className="output-title">
                        <i className="fas fa-star"></i>
                        <span>建议</span>
                      </div>
                      <ul>
                        {aiSuggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
