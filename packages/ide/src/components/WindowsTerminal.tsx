import React, { useState } from 'react';
import './WindowsTerminal.css';

interface WindowsTerminalProps {
  onClose?: () => void;
}

export function WindowsTerminal({ onClose }: WindowsTerminalProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState<string>('');

  const launchWindowsTerminal = async () => {
    setIsLaunching(true);
    setLaunchStatus('启动 Windows Terminal 中...');

    try {
      // Call backend to open Windows Terminal
      const response = await fetch('http://localhost:3002/api/launch-terminal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startingPath: process.cwd?.() || 'C:\\'
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
      setLaunchStatus('❌ 连接到后端失败，请运行后端服务');
      console.error('Failed to launch terminal:', error);
    }

    setIsLaunching(false);
  };

  const launchPowerShell = async () => {
    setIsLaunching(true);
    setLaunchStatus('启动 PowerShell 中...');

    try {
      const response = await fetch('http://localhost:3002/api/launch-powershell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
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
      setLaunchStatus('❌ 连接到后端失败');
      console.error('Failed to launch PowerShell:', error);
    }

    setIsLaunching(false);
  };

  const launchCMD = async () => {
    setIsLaunching(true);
    setLaunchStatus('启动 Command Prompt 中...');

    try {
      const response = await fetch('http://localhost:3002/api/launch-cmd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
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
      setLaunchStatus('❌ 连接到后端失败');
      console.error('Failed to launch CMD:', error);
    }

    setIsLaunching(false);
  };

  return (
    <div className="windows-terminal-container">
      {/* Header */}
      <div className="terminal-header-windows">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-terminal"></i>
          <span>Windows 系统终端</span>
        </div>
        {onClose && (
          <button
            className="btn-close-terminal"
            onClick={onClose}
            title="关闭"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

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
