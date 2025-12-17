import React, { useState, useEffect } from 'react';
import './Autocomplete.css';

export interface Suggestion {
  id: string;
  label: string;
  kind: 'keyword' | 'variable' | 'function' | 'type' | 'snippet';
  detail?: string;
  documentation?: string;
  sortText?: string;
}

interface AutocompleteProps {
  suggestions: Suggestion[];
  visible: boolean;
  position: { x: number; y: number };
  selectedIndex: number;
  onSelect: (suggestion: Suggestion) => void;
  onHover: (index: number) => void;
  filterText?: string;
}

export function Autocomplete({
  suggestions,
  visible,
  position,
  selectedIndex,
  onSelect,
  onHover,
  filterText = ''
}: AutocompleteProps) {
  const getKindIcon = (kind: string): string => {
    switch (kind) {
      case 'keyword':
        return 'fa-code';
      case 'variable':
        return 'fa-box';
      case 'function':
        return 'fa-function';
      case 'type':
        return 'fa-cube';
      case 'snippet':
        return 'fa-file-code';
      default:
        return 'fa-circle';
    }
  };

  const getKindColor = (kind: string): string => {
    switch (kind) {
      case 'keyword':
        return '#667eea';
      case 'variable':
        return '#f59e0b';
      case 'function':
        return '#10b981';
      case 'type':
        return '#ec4899';
      case 'snippet':
        return '#8b5cf6';
      default:
        return '#a0a0a0';
    }
  };

  const highlightMatch = (text: string, filter: string) => {
    if (!filter) return text;
    
    const regex = new RegExp(`(${filter})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => (
      part.toLowerCase() === filter.toLowerCase()
        ? <strong key={i}>{part}</strong>
        : part
    ));
  };

  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="autocomplete-container"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`
      }}
    >
      <div className="autocomplete-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
            onMouseEnter={() => onHover(index)}
            onClick={() => onSelect(suggestion)}
          >
            <div className="item-icon" style={{ color: getKindColor(suggestion.kind) }}>
              <i className={`fas ${getKindIcon(suggestion.kind)}`}></i>
            </div>
            <div className="item-content">
              <div className="item-label">
                {highlightMatch(suggestion.label, filterText)}
              </div>
              {suggestion.detail && (
                <div className="item-detail">{suggestion.detail}</div>
              )}
            </div>
            <div className="item-kind">
              <span className={`kind-badge kind-${suggestion.kind}`}>
                {suggestion.kind}
              </span>
            </div>
          </div>
        ))}
      </div>

      {suggestions[selectedIndex]?.documentation && (
        <div className="autocomplete-preview">
          <div className="preview-title">
            <i className="fas fa-file-lines"></i>
            文档
          </div>
          <div className="preview-content">
            {suggestions[selectedIndex].documentation}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate suggestions from code context
export function generateSuggestions(
  filterText: string,
  context: {
    keywords?: string[];
    variables?: string[];
    functions?: string[];
    types?: string[];
  }
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const filter = filterText.toLowerCase();

  // ZhCode keywords
  const defaultKeywords = [
    '函数', '变量', '如果', '循环', '返回', '中止', '继续',
    '真', '假', '无', '类', '导入', '导出', '接口', '扩展'
  ];

  const keywords = context.keywords || defaultKeywords;
  keywords
    .filter(k => k.toLowerCase().startsWith(filter))
    .forEach((keyword, i) => {
      suggestions.push({
        id: `kw-${i}`,
        label: keyword,
        kind: 'keyword',
        detail: 'ZhCode 关键字',
        sortText: `0-${keyword}`
      });
    });

  // Variables
  const variables = context.variables || ['当前日期', '用户名', '项目名'];
  variables
    .filter(v => v.toLowerCase().startsWith(filter))
    .forEach((variable, i) => {
      suggestions.push({
        id: `var-${i}`,
        label: variable,
        kind: 'variable',
        detail: '变量',
        sortText: `1-${variable}`
      });
    });

  // Functions
  const functions = context.functions || [
    { name: '打印', params: '(文本)' },
    { name: '读入', params: '()' },
    { name: '长度', params: '(数组)' },
    { name: '追加', params: '(数组, 值)' },
  ];
  functions
    .filter(f => f.name.toLowerCase().startsWith(filter))
    .forEach((func, i) => {
      suggestions.push({
        id: `func-${i}`,
        label: func.name,
        kind: 'function',
        detail: func.params,
        documentation: `调用 ${func.name}${func.params} 函数`,
        sortText: `2-${func.name}`
      });
    });

  // Types
  const types = context.types || ['字符串', '数字', '布尔', '数组', '对象'];
  types
    .filter(t => t.toLowerCase().startsWith(filter))
    .forEach((type, i) => {
      suggestions.push({
        id: `type-${i}`,
        label: type,
        kind: 'type',
        detail: '类型',
        sortText: `3-${type}`
      });
    });

  // Sort by sortText
  suggestions.sort((a, b) => (a.sortText || '').localeCompare(b.sortText || ''));

  return suggestions;
}
