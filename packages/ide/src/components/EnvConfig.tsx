import React, { useState, useEffect } from 'react';
import './EnvConfig.css';

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface EnvConfigProps {
  onClose?: () => void;
  onSave?: (envVars: EnvVariable[]) => void;
}

export function EnvConfig({ onClose, onSave }: EnvConfigProps) {
  const [envVars, setEnvVars] = useState<EnvVariable[]>([
    { id: '1', key: 'NODE_ENV', value: 'development', enabled: true },
    { id: '2', key: 'DEBUG', value: 'false', enabled: true },
  ]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addEnvVar = () => {
    if (newKey.trim() && newValue.trim()) {
      setEnvVars([...envVars, {
        id: Math.random().toString(),
        key: newKey,
        value: newValue,
        enabled: true
      }]);
      setNewKey('');
      setNewValue('');
    }
  };

  const removeEnvVar = (id: string) => {
    setEnvVars(envVars.filter(v => v.id !== id));
  };

  const toggleEnvVar = (id: string) => {
    setEnvVars(envVars.map(v =>
      v.id === id ? { ...v, enabled: !v.enabled } : v
    ));
  };

  const updateEnvVar = (id: string, key: string, value: string) => {
    setEnvVars(envVars.map(v =>
      v.id === id ? { ...v, key, value } : v
    ));
  };

  const handleSave = () => {
    onSave?.(envVars);
  };

  return (
    <div className="env-config">
      {/* Header */}
      <div className="env-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <i className="fas fa-gear" style={{ color: '#667eea' }}></i>
          <h2>环境变量配置</h2>
        </div>
        {onClose && (
          <button className="env-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="env-content">
        {/* Existing Variables */}
        <div className="env-section">
          <h3>当前变量</h3>
          <div className="env-list">
            {envVars.map(envVar => (
              <div key={envVar.id} className="env-item">
                <input
                  type="checkbox"
                  checked={envVar.enabled}
                  onChange={() => toggleEnvVar(envVar.id)}
                  className="env-checkbox"
                />
                <input
                  type="text"
                  value={envVar.key}
                  onChange={(e) => updateEnvVar(envVar.id, e.target.value, envVar.value)}
                  placeholder="键名"
                  className="env-input env-key"
                />
                <span className="env-separator">=</span>
                <input
                  type="text"
                  value={envVar.value}
                  onChange={(e) => updateEnvVar(envVar.id, envVar.key, e.target.value)}
                  placeholder="值"
                  className="env-input env-value"
                />
                <button
                  className="env-delete-btn"
                  onClick={() => removeEnvVar(envVar.id)}
                  title="删除"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Variable */}
        <div className="env-section">
          <h3>添加新变量</h3>
          <div className="env-add">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addEnvVar()}
              placeholder="键名"
              className="env-input env-key"
            />
            <span className="env-separator">=</span>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addEnvVar()}
              placeholder="值"
              className="env-input env-value"
            />
            <button
              className="env-add-btn"
              onClick={addEnvVar}
              disabled={!newKey.trim() || !newValue.trim()}
            >
              <i className="fas fa-plus"></i>
              添加
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="env-info">
          <i className="fas fa-info-circle"></i>
          <p>环境变量将在运行时使用。取消勾选以禁用某个变量。</p>
        </div>
      </div>

      {/* Footer */}
      <div className="env-footer">
        {onClose && (
          <button className="btn-cancel" onClick={onClose}>
            取消
          </button>
        )}
        <button className="btn-save" onClick={handleSave}>
          <i className="fas fa-check"></i>
          保存配置
        </button>
      </div>
    </div>
  );
}
