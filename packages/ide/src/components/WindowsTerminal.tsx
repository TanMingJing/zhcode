import React, { useState } from 'react';
import './WindowsTerminal.css';

interface WindowsTerminalProps {
  onClose?: () => void;
  workingDirectory?: string;  // Current local folder path - passed from parent
}

// Terminal launch only works with local backend
const API_URL = 'http://localhost:3002';

export function WindowsTerminal({ workingDirectory }: WindowsTerminalProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string>('');

  // Get the starting path - use workingDirectory prop or localStorage
  const getStartingPath = () => {
    const path = workingDirectory || localStorage.getItem('zhcode_terminal_path') || '';
    return path.replace(/\//g, '\\');
  };

  const hasValidPath = !!(workingDirectory || localStorage.getItem('zhcode_terminal_path'));

  const launchWindowsTerminal = async () => {
    if (!hasValidPath) {
      setLaunchStatus('⚠️ 请先在「存储」面板打开本地文件夹');
      setTimeout(() => setLaunchStatus(''), 3000);
      return;
    }
    
    setIsLaunching(true);
    setLaunchStatus('启动 Windows Terminal 中...');

    try {
      // Call backend to open Windows Terminal
      const response = await fetch(`${API_URL}/api/launch-terminal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startingPath: getStartingPath()
        })
      });

      if (response.ok) {
        setLaunchStatus('✅ Windows Terminal 已启动');
        setTimeout(() => {
          setLaunchStatus('');
        }, 2000);
      } else {
        setLaunchStatus('❌ 启动失败，请检查 Windows Terminal 是否已安装');
      }
    } catch (error) {
      setLaunchStatus('❌ 需要本地后端服务。请在 packages/ai-service 运行: pnpm dev');
      console.error('Failed to launch terminal:', error);
    }

    setIsLaunching(false);
  };

  const launchPowerShell = async () => {
    if (!hasValidPath) {
      setLaunchStatus('⚠️ 请先在「存储」面板打开本地文件夹');
      setTimeout(() => setLaunchStatus(''), 3000);
      return;
    }
    
    setIsLaunching(true);
    setLaunchStatus('启动 PowerShell 中...');

    try {
      const response = await fetch(`${API_URL}/api/launch-powershell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startingPath: getStartingPath()
        })
      });

      if (response.ok) {
        setLaunchStatus('✅ PowerShell 已启动');
        setTimeout(() => {
          setLaunchStatus('');
        }, 2000);
      } else {
        setLaunchStatus('❌ 启动失败');
      }
    } catch (error) {
      setLaunchStatus('❌ 需要本地后端服务。请在 packages/ai-service 运行: pnpm dev');
      console.error('Failed to launch PowerShell:', error);
    }

    setIsLaunching(false);
  };

  const launchCMD = async () => {
    if (!hasValidPath) {
      setLaunchStatus('⚠️ 请先在「存储」面板打开本地文件夹');
      setTimeout(() => setLaunchStatus(''), 3000);
      return;
    }
    
    setIsLaunching(true);
    setLaunchStatus('启动 Command Prompt 中...');

    try {
      const response = await fetch(`${API_URL}/api/launch-cmd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startingPath: getStartingPath()
        })
      });

      if (response.ok) {
        setLaunchStatus('✅ Command Prompt 已启动');
        setTimeout(() => {
          setLaunchStatus('');
        }, 2000);
      } else {
        setLaunchStatus('❌ 启动失败');
      }
    } catch (error) {
      setLaunchStatus('❌ 需要本地后端服务。请在 packages/ai-service 运行: pnpm dev');
      console.error('Failed to launch CMD:', error);
    }

    setIsLaunching(false);
  };

  return (
    <div className="windows-terminal-container">
      {/* Content */}
      <div className="terminal-content-windows">
        <div className="terminal-info">
          <i className="fas fa-info-circle"></i>
          <p>选择要启动的 Windows 终端应用程序</p>
        </div>

        <div className="terminal-buttons">
          {/* Windows Terminal Button */}
          <button
            className="btn-launch-terminal"
            onClick={launchWindowsTerminal}
            disabled={isLaunching}
          >
            <i className="fas fa-window-maximize"></i>
            <div className="button-content">
              <div className="button-title">Windows Terminal</div>
              <div className="button-desc">现代化 Windows 终端</div>
            </div>
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* PowerShell Button */}
          <button
            className="btn-launch-terminal btn-powershell"
            onClick={launchPowerShell}
            disabled={isLaunching}
          >
            <i className="fas fa-terminal"></i>
            <div className="button-content">
              <div className="button-title">PowerShell</div>
              <div className="button-desc">强大的 Windows PowerShell</div>
            </div>
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* CMD Button */}
          <button
            className="btn-launch-terminal btn-cmd"
            onClick={launchCMD}
            disabled={isLaunching}
          >
            <i className="fas fa-keyboard"></i>
            <div className="button-content">
              <div className="button-title">Command Prompt (CMD)</div>
              <div className="button-desc">经典的命令行工具</div>
            </div>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        {/* Status Message */}
        {launchStatus && (
          <div className={`status-message ${launchStatus.includes('✅') ? 'success' : 'error'}`}>
            {launchStatus}
          </div>
        )}

        {/* Info Box */}
        <div className="terminal-instructions">
          <h3>📝 说明</h3>
          <ul>
            <li>点击上方按钮启动对应的系统终端</li>
            <li>终端将在新窗口中打开</li>
            <li>您可以在系统终端中执行任何 Windows 命令</li>
            <li>终端独立运行，不受 IDE 限制</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
