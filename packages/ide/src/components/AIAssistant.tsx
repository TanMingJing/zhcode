import React, { useState } from 'react';
import './AIAssistant.css';

interface AIAssistantProps {
  selectedCode?: string;
  onClose?: () => void;
}

type AIFeature = 'autocomplete' | 'explain' | 'refactor' | 'bugfix' | 'unittest' | null;

export function AIAssistant({ selectedCode, onClose }: AIAssistantProps) {
  const [activeFeature, setActiveFeature] = useState<AIFeature>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

  const callAIService = async (endpoint: string, body: any) => {
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('AI service error');
      }

      const data = await response.json();
      setResult(data.result || data.suggestions || JSON.stringify(data, null, 2));
    } catch (err) {
      setError(`❌ AI 服务连接失败: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutocomplete = async () => {
    setActiveFeature('autocomplete');
    await callAIService('/api/autocomplete', {
      code: selectedCode || '',
      position: selectedCode?.length || 0,
      context: 'ZhCode editor'
    });
  };

  const handleExplain = async () => {
    setActiveFeature('explain');
    if (!selectedCode) {
      setError('❌ 请先选择代码');
      return;
    }
    await callAIService('/api/explain-code', {
      code: selectedCode
    });
  };

  const handleRefactor = async () => {
    setActiveFeature('refactor');
    if (!selectedCode) {
      setError('❌ 请先选择代码');
      return;
    }
    await callAIService('/api/suggest-refactor', {
      code: selectedCode
    });
  };

  const handleBugFix = async () => {
    setActiveFeature('bugfix');
    if (!selectedCode) {
      setError('❌ 请先选择代码');
      return;
    }
    await callAIService('/api/explain-error', {
      code: selectedCode,
      error: ''
    });
  };

  const handleUnitTest = async () => {
    setActiveFeature('unittest');
    if (!selectedCode) {
      setError('❌ 请先选择代码');
      return;
    }
    await callAIService('/api/generate', {
      code: selectedCode,
      type: 'unittest'
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="ai-assistant-container">
      {/* Header */}
      <div className="ai-assistant-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-magic"></i>
          <span>AI 辅助</span>
        </div>
        {onClose && (
          <button
            className="ai-close-btn"
            onClick={onClose}
            title="关闭"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Features Grid */}
      <div className="ai-features-grid">
        <button
          className={`ai-feature-btn ${activeFeature === 'autocomplete' ? 'active' : ''}`}
          onClick={handleAutocomplete}
          disabled={isLoading}
          title="智能代码补全"
        >
          <i className="fas fa-lightbulb"></i>
          <span>代码补全</span>
        </button>

        <button
          className={`ai-feature-btn ${activeFeature === 'explain' ? 'active' : ''}`}
          onClick={handleExplain}
          disabled={isLoading || !selectedCode}
          title="解释选中的代码"
        >
          <i className="fas fa-book"></i>
          <span>代码解释</span>
        </button>

        <button
          className={`ai-feature-btn ${activeFeature === 'refactor' ? 'active' : ''}`}
          onClick={handleRefactor}
          disabled={isLoading || !selectedCode}
          title="建议代码重构"
        >
          <i className="fas fa-hammer"></i>
          <span>重构建议</span>
        </button>

        <button
          className={`ai-feature-btn ${activeFeature === 'bugfix' ? 'active' : ''}`}
          onClick={handleBugFix}
          disabled={isLoading || !selectedCode}
          title="检测并修复 Bug"
        >
          <i className="fas fa-bug"></i>
          <span>Bug 定位</span>
        </button>

        <button
          className={`ai-feature-btn ${activeFeature === 'unittest' ? 'active' : ''}`}
          onClick={handleUnitTest}
          disabled={isLoading || !selectedCode}
          title="生成单元测试"
        >
          <i className="fas fa-vial"></i>
          <span>单元测试</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="ai-loading">
          <div className="ai-spinner"></div>
          <span>AI 思考中...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="ai-error">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="ai-result">
          <div className="ai-result-header">
            <span className="ai-result-title">
              {activeFeature === 'autocomplete' && '✨ 代码补全建议'}
              {activeFeature === 'explain' && '📖 代码解释'}
              {activeFeature === 'refactor' && '🔧 重构建议'}
              {activeFeature === 'bugfix' && '🐛 Bug 分析'}
              {activeFeature === 'unittest' && '✅ 单元测试'}
            </span>
            <button
              className="ai-copy-btn"
              onClick={copyToClipboard}
              title="复制"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
          <div className="ai-result-content">
            <pre>{result}</pre>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !error && !isLoading && (
        <div className="ai-empty-state">
          <i className="fas fa-robot"></i>
          <p>选择一个功能开始</p>
          <small>提示: 代码补全不需要选中代码</small>
        </div>
      )}
    </div>
  );
}
