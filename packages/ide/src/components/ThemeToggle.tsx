import React from 'react';

interface ThemeToggleProps {
  currentTheme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function ThemeToggle({ currentTheme, onThemeChange }: ThemeToggleProps) {
  const handleToggle = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    onThemeChange(newTheme);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        className="btn btn-icon"
        onClick={handleToggle}
        title={`切换主题 (当前: ${currentTheme === 'dark' ? '暗黑' : '亮色'})`}
        style={{
          color: currentTheme === 'light' ? '#f59e0b' : '#60a5fa'
        }}
      >
        <i className={`fas fa-${currentTheme === 'dark' ? 'sun' : 'moon'}`}></i>
      </button>
    </div>
  );
}
